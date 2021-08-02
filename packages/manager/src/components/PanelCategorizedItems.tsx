import {H3, NonIdealState, Spinner, Tab, Tabs} from '@blueprintjs/core';
import {
  CleanupRule,
  CLEANUP_TABLES_CATEGORIZED_ROUTE,
  ItemInfo,
  ReadonlyCleanupRuleset,
} from '@philter/common';
import {dequal} from 'dequal/lite';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useAsyncCallback} from 'react-async-hook';
import useSWR from 'swr';
import {fetchGetCleanupTableCategorized, fetchSaveCleanupRuleset} from '../api';
import {setErrorToast, setSavingToast, showInfoToast} from '../toaster';
import {cleanupActionToString, typeCheck} from '../util';
import './PanelCategorizedItems.css';
import {RuleChangeHandler, TableItemCleanup} from './TableItemCleanup';

const CLEANUP_TAB_TYPES = {
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
 * Note: Tab types do not match cleanup actions 1:1. For example, autosell
 * (AUTO) and discard (DISC) actions are shown together under "dispose".
 */
type CleanupTabType = keyof typeof CLEANUP_TAB_TYPES;
const isCleanupTabType = (tabId: unknown): tabId is CleanupTabType =>
  typeof tabId === 'string' &&
  Object.prototype.hasOwnProperty.call(CLEANUP_TAB_TYPES, tabId);

const categorizeItemsForTabs = (
  items: readonly Readonly<ItemInfo>[],
  cleanupRules: ReadonlyCleanupRuleset
) =>
  items.reduce(
    (itemsForTabs, item) => {
      const rule = cleanupRules[item.id];
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
      /** This includes only items that have a cleanup rule defined. */
      all: [] as ItemInfo[],
      closet: [] as ItemInfo[],
      craft: [] as ItemInfo[],
      display: [] as ItemInfo[],
      dispose: [] as ItemInfo[],
      gift: [] as ItemInfo[],
      keep: [] as ItemInfo[],
      mall: [] as ItemInfo[],
      pulverize: [] as ItemInfo[],
      reminder: [] as ItemInfo[],
      stash: [] as ItemInfo[],
      untinker: [] as ItemInfo[],
      use: [] as ItemInfo[],
    }
  );

/**
 * Panel for editing the player's Philter ruleset.
 */
export const PanelCategorizedItems = ({
  cleanupRules,
  onChange,
}: {
  /**
   * Active cleanup ruleset being edited, or `undefined` if the base cleanup
   * ruleset has not been loaded yet.
   */
  cleanupRules: ReadonlyCleanupRuleset | undefined;
  /** Callback invoked when the active cleanup ruleset is changed */
  onChange: (
    newStateOrReducer: React.SetStateAction<ReadonlyCleanupRuleset | undefined>
  ) => void;
}): JSX.Element => {
  const {
    data,
    error: loadingError,
    isValidating: isLoading,
    mutate,
  } = useSWR(CLEANUP_TABLES_CATEGORIZED_ROUTE, async () => {
    const response = await fetchGetCleanupTableCategorized();
    // Items must be sorted by ID
    response.result.items.sort((itemA, itemB) => itemA.id - itemB.id);
    return response.result;
  });

  // When the data is loaded for the first time, sync the active cleanup ruleset
  // with the base cleanup ruleset
  useEffect(() => {
    if (data?.cleanupRules) {
      onChange(prevCleanupRules => prevCleanupRules ?? data.cleanupRules);
    }
  }, [data?.cleanupRules, onChange]);

  const hasChanges = useMemo(
    () => Boolean(cleanupRules) && !dequal(cleanupRules, data?.cleanupRules),
    [cleanupRules, data?.cleanupRules]
  );

  const handleReset = useCallback(
    () => data?.cleanupRules && onChange(data.cleanupRules),
    [data?.cleanupRules, onChange]
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
      if (!cleanupRules) {
        throw new Error(
          'Cannot save active ruleset because it has not been initialized yet'
        );
      }

      const response = await fetchSaveCleanupRuleset(cleanupRules);
      if (!response?.result?.success) {
        throw new Error(`Unexpected response: ${JSON.stringify(response)}`);
      }
      return {...data, cleanupRules};
    }, false)
  );

  useEffect(
    () => setErrorToast('savingError', savingError, 'Cannot save cleanup rule'),
    [savingError]
  );
  useEffect(
    () => setSavingToast('isSaving', isSaving, 'Saving cleanup rules...'),
    [isSaving]
  );

  const handleRuleChange: RuleChangeHandler = useCallback(
    (itemId, newRuleOrReducer) =>
      onChange(prevCleanupRules => {
        if (prevCleanupRules === undefined) return prevCleanupRules;

        const prevRule: CleanupRule | undefined = prevCleanupRules[itemId];
        const newRule =
          typeof newRuleOrReducer === 'function'
            ? newRuleOrReducer(prevCleanupRules[itemId] || null)
            : newRuleOrReducer;

        if (prevRule && prevRule.action !== newRule?.action) {
          const itemName = data?.items.find(item => item.id === itemId)?.name;
          if (itemName !== undefined) {
            showInfoToast(
              newRule
                ? `Changed action for ${itemName} to "${cleanupActionToString(
                    newRule.action
                  )}"`
                : `Removed action for ${itemName}`
            );
          }
        }

        if (newRule) return {...prevCleanupRules, [itemId]: newRule};
        else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const {[itemId]: _removed, ...restCleanupRules} = prevCleanupRules;
          return restCleanupRules;
        }
      }),
    [data?.items, onChange]
  );

  const [tabId, setTabId] = useState<CleanupTabType>('all');

  // Item categories are based on the active copy of the ruleset being edited,
  // rather than the base copy. This allows the tabs to be updated in real time
  // when the user edits the ruleset.
  const itemsForTabs = useMemo(
    () => categorizeItemsForTabs(data?.items ?? [], cleanupRules || {}),
    [cleanupRules, data?.items]
  );

  const isTabAvailable = Object.prototype.hasOwnProperty.call(
    itemsForTabs,
    tabId
  )
    ? itemsForTabs[tabId as keyof typeof itemsForTabs].length > 0
    : true;
  const actualTabId = isTabAvailable ? tabId : 'all';

  const makeItemTable = (items: ItemInfo[]) =>
    cleanupRules &&
    data && (
      <TableItemCleanup
        className="PanelCategorizedItems__Table"
        disableReset={!hasChanges}
        disableSave={!hasChanges}
        inventory={data.inventory}
        items={items}
        cleanupRules={cleanupRules}
        onRuleChange={handleRuleChange}
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
          onChange={tabId => isCleanupTabType(tabId) && setTabId(tabId)}
          renderActiveTabPanelOnly
          selectedTabId={actualTabId}
        >
          <Tab
            id={typeCheck<CleanupTabType>('all')}
            panel={makeItemTable(itemsForTabs.all)}
            panelClassName="PanelCategorizedItems__TabItem"
            title="All"
          />
          {itemsForTabs.keep.length > 0 && (
            <Tab
              id={typeCheck<CleanupTabType>('keep')}
              panel={makeItemTable(itemsForTabs.keep)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Keep"
            />
          )}
          {itemsForTabs.mall.length > 0 && (
            <Tab
              id={typeCheck<CleanupTabType>('mall')}
              panel={makeItemTable(itemsForTabs.mall)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Mall"
            />
          )}
          {itemsForTabs.pulverize.length > 0 && (
            <Tab
              id={typeCheck<CleanupTabType>('pulverize')}
              panel={makeItemTable(itemsForTabs.pulverize)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Pulverize"
            />
          )}
          {itemsForTabs.use.length > 0 && (
            <Tab
              id={typeCheck<CleanupTabType>('use')}
              panel={makeItemTable(itemsForTabs.use)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Use"
            />
          )}
          {itemsForTabs.closet.length > 0 && (
            <Tab
              id={typeCheck<CleanupTabType>('closet')}
              panel={makeItemTable(itemsForTabs.closet)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Closet"
            />
          )}
          {itemsForTabs.stash.length > 0 && (
            <Tab
              id={typeCheck<CleanupTabType>('stash')}
              panel={makeItemTable(itemsForTabs.stash)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Clan Stash"
            />
          )}
          {itemsForTabs.craft.length > 0 && (
            <Tab
              id={typeCheck<CleanupTabType>('craft')}
              panel={makeItemTable(itemsForTabs.craft)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Crafting"
            />
          )}
          {itemsForTabs.untinker.length > 0 && (
            <Tab
              id={typeCheck<CleanupTabType>('untinker')}
              panel={makeItemTable(itemsForTabs.untinker)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Untinkering"
            />
          )}
          {itemsForTabs.gift.length > 0 && (
            <Tab
              id={typeCheck<CleanupTabType>('gift')}
              panel={makeItemTable(itemsForTabs.gift)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Gift"
            />
          )}
          {itemsForTabs.display.length > 0 && (
            <Tab
              id={typeCheck<CleanupTabType>('display')}
              panel={makeItemTable(itemsForTabs.display)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Display"
            />
          )}
          {itemsForTabs.dispose.length > 0 && (
            <Tab
              id={typeCheck<CleanupTabType>('dispose')}
              panel={makeItemTable(itemsForTabs.dispose)}
              panelClassName="PanelCategorizedItems__TabItem"
              title="Dispose"
            />
          )}
          {itemsForTabs.reminder.length > 0 && (
            <Tab
              id={typeCheck<CleanupTabType>('reminder')}
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
