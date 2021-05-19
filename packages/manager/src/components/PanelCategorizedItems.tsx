import {H3, NonIdealState, Spinner, Tab, Tabs} from '@blueprintjs/core';
import {
  CLEANUP_TABLES_CATEGORIZED_ROUTE,
  OcdItem,
  OcdRule,
  OcdRuleset,
  ReadonlyOcdRuleset,
} from '@ocd-cleanup/common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useAsyncCallback} from 'react-async-hook';
import useSWR from 'swr';
import {fetchGetCleanupTableCategorized, fetchSaveOcdRuleset} from '../api';
import {setErrorToast, setSavingToast, showInfoToast} from '../toaster';
import {ocdActionToString, typeCheck} from '../util';
import {OcdItemTable, RuleChangeHandler} from './OcdItemTable';
import './PanelCategorizedItems.css';

const OCD_TAB_TYPES = {
  all: 0,
  closet: 0,
  craft: 0,
  display: 0,
  dispose: 0,
  gift: 0,
  inventory: 0,
  keep: 0,
  mall: 0,
  pulverize: 0,
  reminder: 0,
  search: 0,
  stash: 0,
  untinker: 0,
  use: 0,
};

/**
 * Note: Tab types do not match OCD actions 1:1. For example, autosell (AUTO)
 * and discard (DISC) actions are shown together under "dispose".
 */
type OcdTabType = keyof typeof OCD_TAB_TYPES;
const isOcdTabType = (tabId: unknown): tabId is OcdTabType =>
  typeof tabId === 'string' &&
  Object.prototype.hasOwnProperty.call(OCD_TAB_TYPES, tabId);

const categorizeItemsForTabs = (
  items: readonly Readonly<OcdItem>[],
  ocdRules: ReadonlyOcdRuleset
) =>
  items.reduce(
    (itemsForTabs, item) => {
      const rule = ocdRules[item.id];
      if (rule) {
        itemsForTabs.all.push(item);
        switch (rule.action) {
          case 'CLST':
            itemsForTabs.closet.push(item);
            break;
          case 'MAKE':
            itemsForTabs.craft.push(item);
            break;
          case 'AUTO':
          case 'DISC':
            itemsForTabs.dispose.push(item);
            break;
          case 'BREAK':
          case 'USE':
            itemsForTabs.use.push(item);
            break;
          case 'DISP':
            itemsForTabs.display.push(item);
            break;
          case 'KEEP':
            itemsForTabs.keep.push(item);
            break;
          case 'GIFT':
            itemsForTabs.gift.push(item);
            break;
          case 'MALL':
            itemsForTabs.mall.push(item);
            break;
          case 'PULV':
            itemsForTabs.pulverize.push(item);
            break;
          case 'TODO':
            itemsForTabs.reminder.push(item);
            break;
          case 'UNTN':
            itemsForTabs.untinker.push(item);
            break;
          case 'CLAN':
            itemsForTabs.stash.push(item);
            break;
        }
      }
      return itemsForTabs;
    },
    {
      /** This includes only items that have an OCD rule defined. */
      all: [] as OcdItem[],
      closet: [] as OcdItem[],
      craft: [] as OcdItem[],
      display: [] as OcdItem[],
      dispose: [] as OcdItem[],
      gift: [] as OcdItem[],
      keep: [] as OcdItem[],
      mall: [] as OcdItem[],
      pulverize: [] as OcdItem[],
      reminder: [] as OcdItem[],
      stash: [] as OcdItem[],
      untinker: [] as OcdItem[],
      use: [] as OcdItem[],
    }
  );

/** Empty object used as placeholder for the OCD ruleset being edited. */
const EMPTY_OCD_RULES = Object.freeze({});

/**
 * Panel for editing the player's OCD-Cleanup ruleset.
 */
export const PanelCategorizedItems = (): JSX.Element => {
  // Providing default values is not ideal.
  // TODO: Add "loading" and "network error" states to <TabbedOcdRulesetEditor>
  // and handle network errors properly.
  const {data, error: loadingError, isValidating: isLoading, mutate} = useSWR(
    CLEANUP_TABLES_CATEGORIZED_ROUTE,
    async () => {
      const response = await fetchGetCleanupTableCategorized();
      // Items must be sorted by ID
      response.result.items.sort((itemA, itemB) => itemA.id - itemB.id);
      return response.result;
    }
  );

  const [activeOcdRules, setActiveOcdRules] = useState<OcdRuleset>(
    EMPTY_OCD_RULES
  );

  useEffect(() => {
    // When the data is loaded for the first time, populate activeOcdRules with
    // the server-sent ruleset
    if (data?.ocdRules && activeOcdRules === EMPTY_OCD_RULES) {
      setActiveOcdRules(data.ocdRules);
    }
  }, [activeOcdRules, data?.ocdRules]);

  const handleReset = useCallback(
    () => data?.ocdRules && setActiveOcdRules(data.ocdRules),
    [data?.ocdRules]
  );

  const {
    error: savingError,
    execute: handleSave,
    loading: isSaving,
  } = useAsyncCallback(() =>
    mutate(async data => {
      if (!data) {
        throw new Error("Cannot save ruleset when we don't have any data yet");
      }
      const response = await fetchSaveOcdRuleset(activeOcdRules);
      if (!response?.result?.success) {
        throw new Error(`Unexpected response: ${JSON.stringify(response)}`);
      }
      return {...data, ocdRules: activeOcdRules};
    }, false)
  );
  useEffect(
    () => setErrorToast('savingError', savingError, 'Cannot save OCD rule'),
    [savingError]
  );
  useEffect(() => setSavingToast('isSaving', isSaving, 'Saving OCD rules...'), [
    isSaving,
  ]);

  const handleOcdRuleChange: RuleChangeHandler = useCallback(
    (itemId, newRuleOrReducer) =>
      setActiveOcdRules(prevOcdRules => {
        const prevRule = prevOcdRules[itemId] as OcdRule | undefined;
        const newRule =
          typeof newRuleOrReducer === 'function'
            ? newRuleOrReducer(prevOcdRules[itemId] || null)
            : newRuleOrReducer;

        if (prevRule?.action !== newRule?.action) {
          const itemName = data?.items[itemId]?.name;
          showInfoToast(
            newRule
              ? `Changed action for ${itemName} to "${ocdActionToString(
                  newRule.action
                )}"`
              : `Removed action for ${itemName}`
          );
        }

        if (newRule) return {...prevOcdRules, [itemId]: newRule};
        else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const {[itemId]: _removed, ...restOcdRules} = prevOcdRules;
          return restOcdRules;
        }
      }),
    [data?.items]
  );

  const [tabId, setTabId] = useState<OcdTabType>('all');

  // Item categories are based on the active copy of the ruleset being edited,
  // rather than the base copy. This allows the tabs to be updated in real time
  // when the user edits the ruleset.
  const itemsForTabs = useMemo(
    () => categorizeItemsForTabs(data?.items ?? [], activeOcdRules || {}),
    [data?.items, activeOcdRules]
  );

  const isTabAvailable = Object.prototype.hasOwnProperty.call(
    itemsForTabs,
    tabId
  )
    ? itemsForTabs[tabId as keyof typeof itemsForTabs].length > 0
    : true;
  const actualTabId = isTabAvailable ? tabId : 'all';

  const hasChanges = Boolean(data && data.ocdRules !== activeOcdRules);

  const makeItemTable = (items: OcdItem[]) =>
    data && (
      <OcdItemTable
        className="PanelCategorizedItems__Table"
        disableReset={!hasChanges}
        disableSave={!hasChanges}
        inventory={data.inventory}
        items={items}
        ocdRules={activeOcdRules}
        onRuleChange={handleOcdRuleChange}
        onReset={handleReset}
        onSave={handleSave}
      />
    );

  return (
    <>
      <H3>Edit Cleanup Rules</H3>
      {data ? (
        <Tabs
          className="PanelCategorizedItems__Tabs"
          onChange={tabId => isOcdTabType(tabId) && setTabId(tabId)}
          renderActiveTabPanelOnly
          selectedTabId={actualTabId}
        >
          <Tab
            id={typeCheck<OcdTabType>('all')}
            panel={makeItemTable(itemsForTabs.all)}
            panelClassName="PanelCategorizedItems__TabItem"
            title="All"
          />
          {itemsForTabs.keep.length > 0 && (
            <Tab
              id={typeCheck<OcdTabType>('keep')}
              panel={makeItemTable(itemsForTabs.keep)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Keep"
            />
          )}
          {itemsForTabs.mall.length > 0 && (
            <Tab
              id={typeCheck<OcdTabType>('mall')}
              panel={makeItemTable(itemsForTabs.mall)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Mall"
            />
          )}
          {itemsForTabs.pulverize.length > 0 && (
            <Tab
              id={typeCheck<OcdTabType>('pulverize')}
              panel={makeItemTable(itemsForTabs.pulverize)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Pulverize"
            />
          )}
          {itemsForTabs.use.length > 0 && (
            <Tab
              id={typeCheck<OcdTabType>('use')}
              panel={makeItemTable(itemsForTabs.use)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Use"
            />
          )}
          {itemsForTabs.closet.length > 0 && (
            <Tab
              id={typeCheck<OcdTabType>('closet')}
              panel={makeItemTable(itemsForTabs.closet)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Closet"
            />
          )}
          {itemsForTabs.stash.length > 0 && (
            <Tab
              id={typeCheck<OcdTabType>('stash')}
              panel={makeItemTable(itemsForTabs.stash)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Clan Stash"
            />
          )}
          {itemsForTabs.craft.length > 0 && (
            <Tab
              id={typeCheck<OcdTabType>('craft')}
              panel={makeItemTable(itemsForTabs.craft)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Crafting"
            />
          )}
          {itemsForTabs.untinker.length > 0 && (
            <Tab
              id={typeCheck<OcdTabType>('untinker')}
              panel={makeItemTable(itemsForTabs.untinker)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Untinkering"
            />
          )}
          {itemsForTabs.gift.length > 0 && (
            <Tab
              id={typeCheck<OcdTabType>('gift')}
              panel={makeItemTable(itemsForTabs.gift)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Gift"
            />
          )}
          {itemsForTabs.display.length > 0 && (
            <Tab
              id={typeCheck<OcdTabType>('display')}
              panel={makeItemTable(itemsForTabs.display)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Display"
            />
          )}
          {itemsForTabs.dispose.length > 0 && (
            <Tab
              id={typeCheck<OcdTabType>('dispose')}
              panel={makeItemTable(itemsForTabs.dispose)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Dispose"
            />
          )}
          {itemsForTabs.reminder.length > 0 && (
            <Tab
              id={typeCheck<OcdTabType>('reminder')}
              panel={makeItemTable(itemsForTabs.reminder)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Reminders"
            />
          )}
        </Tabs>
      ) : isLoading ? (
        <Spinner />
      ) : (
        <NonIdealState
          icon={loadingError ? 'error' : 'info-sign'}
          title={loadingError ? 'Failed to load data' : 'Data not loaded yet'}
          description={
            loadingError instanceof Error ? loadingError.message : undefined
          }
        />
      )}
    </>
  );
};
