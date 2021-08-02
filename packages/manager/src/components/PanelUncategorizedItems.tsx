import {
  Button,
  ButtonGroup,
  FormGroup,
  H3,
  NonIdealState,
  Spinner,
} from '@blueprintjs/core';
import {
  CleanupRuleset,
  CLEANUP_TABLES_UNCATEGORIZED_ROUTE,
  ReadonlyCleanupRuleset,
} from '@philter/common';
import {dequal} from 'dequal/lite';
import React, {useCallback, useEffect, useMemo} from 'react';
import {useAsyncCallback} from 'react-async-hook';
import useSWR from 'swr';
import {
  fetchGetCleanupTableUncategorized,
  fetchSaveCleanupRuleset,
} from '../api';
import {setErrorToast, setSavingToast} from '../toaster';
import './PanelUncategorizedItems.css';
import {TableItemCleanup} from './TableItemCleanup';

export const PanelUncategorizedItems = ({
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
  // Major assumptions:
  //
  // - data.items contains _only_ items that are uncategorized, i.e. the server
  //   performs the filtering for us.
  const {
    data,
    error: loadingError,
    isValidating: isLoadingData,
    mutate,
  } = useSWR(CLEANUP_TABLES_UNCATEGORIZED_ROUTE, async () => {
    const response = await fetchGetCleanupTableUncategorized();
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
      return {
        ...data,
        items: data.items.filter(item => !(item.id in cleanupRules)),
        cleanupRules,
      };
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

  const setAllItemsToMall = useCallback(
    () =>
      data &&
      onChange(prevCleanupRules => {
        if (prevCleanupRules === undefined) return prevCleanupRules;

        const {...cleanupRules}: CleanupRuleset = prevCleanupRules;
        for (const item of data.items) {
          if (item.canMall) {
            cleanupRules[item.id] = {action: 'MALL', minPrice: 0};
          }
        }
        return cleanupRules;
      }),
    [data, onChange]
  );
  const setAllItemsToCloset = useCallback(
    () =>
      data &&
      onChange(prevCleanupRules => {
        if (prevCleanupRules === undefined) return prevCleanupRules;

        const {...cleanupRules}: CleanupRuleset = prevCleanupRules;
        for (const item of data.items) {
          if (item.canCloset) {
            cleanupRules[item.id] = {action: 'CLST'};
          }
        }
        return cleanupRules;
      }),
    [data, onChange]
  );
  const setAllItemsToKeep = useCallback(
    () =>
      data &&
      onChange(prevCleanupRules => {
        if (prevCleanupRules === undefined) return prevCleanupRules;

        const {...cleanupRules}: CleanupRuleset = prevCleanupRules;
        for (const item of data.items) {
          cleanupRules[item.id] = {action: 'KEEP'};
        }
        return cleanupRules;
      }),
    [data, onChange]
  );

  const handleCleanupRulesetChange = useCallback(
    (newRulesOrReducer: React.SetStateAction<CleanupRuleset>) =>
      onChange(prevCleanupRules =>
        prevCleanupRules
          ? typeof newRulesOrReducer === 'function'
            ? newRulesOrReducer(prevCleanupRules)
            : newRulesOrReducer
          : prevCleanupRules
      ),
    [onChange]
  );

  return (
    <>
      <H3>Uncategorized Items in Your Inventory</H3>
      {cleanupRules && data ? (
        data.items.length > 0 ? (
          <>
            <FormGroup inline label="Categorize all items as...">
              <ButtonGroup>
                <Button
                  disabled={
                    !data.items.some(
                      item =>
                        item.canMall && cleanupRules[item.id]?.action !== 'MALL'
                    )
                  }
                  onClick={setAllItemsToMall}
                >
                  Mallsell
                </Button>
                <Button
                  disabled={
                    !data.items.some(
                      item =>
                        item.canCloset &&
                        cleanupRules[item.id]?.action !== 'CLST'
                    )
                  }
                  onClick={setAllItemsToCloset}
                >
                  Closet
                </Button>
                <Button
                  disabled={
                    !data.items.some(
                      item => cleanupRules[item.id]?.action !== 'KEEP'
                    )
                  }
                  onClick={setAllItemsToKeep}
                >
                  Keep all
                </Button>
              </ButtonGroup>
            </FormGroup>
            <TableItemCleanup
              className="PanelUncategorizedItems__Table"
              disableReset={!hasChanges}
              disableSave={!hasChanges}
              inventory={data.inventory}
              items={data.items}
              cleanupRules={cleanupRules}
              onChange={handleCleanupRulesetChange}
              onReset={handleReset}
              onSave={handleSave}
            />
          </>
        ) : (
          <NonIdealState
            icon={
              <img
                alt="Nothing to do"
                src="/images/adventureimages/kg_accountant.gif"
              />
            }
            title="Your entire inventory has been categorized"
            description='"Nothing to see here, please move along."'
          />
        )
      ) : isLoadingData ? (
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
