import {
  Button,
  ButtonGroup,
  FormGroup,
  H3,
  NonIdealState,
  Spinner,
} from '@blueprintjs/core';
import {
  CLEANUP_TABLES_UNCATEGORIZED_ROUTE,
  CleanupRuleset,
} from '@philter/common';
import {dequal} from 'dequal/lite';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useAsyncCallback} from 'react-async-hook';
import useSWR from 'swr';
import {
  fetchGetCleanupTableUncategorized,
  fetchPatchCleanupRuleset,
} from '../api';
import {setErrorToast, setSavingToast} from '../toaster';
import {TableItemCleanup} from './TableItemCleanup';
import './PanelUncategorizedItems.css';

const EMPTY_CLEANUP_RULES = {};

export const PanelUncategorizedItems = (): JSX.Element => {
  // Major assumptions:
  //
  // - data.items contains _only_ items that are uncategorized, i.e. the server
  //   performs the filtering for us.
  // - cleanupRules always starts as an empty ruleset. Since data.items has
  //   already been curated, there is no need to retrieve the entire ruleset
  //   from the server.
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

  const [cleanupRules, setCleanupRules] =
    useState<CleanupRuleset>(EMPTY_CLEANUP_RULES);
  const resetCleanupRules = useCallback(
    () => setCleanupRules(EMPTY_CLEANUP_RULES),
    []
  );

  const hasChanges = useMemo(
    () => !dequal(cleanupRules, EMPTY_CLEANUP_RULES),
    [cleanupRules]
  );

  const {
    error: savingError,
    execute: doSave,
    loading: isSaving,
  } = useAsyncCallback(async () => {
    const response = await fetchPatchCleanupRuleset(cleanupRules);
    if (!response?.result?.success) {
      throw new Error(`Unexpected response: ${JSON.stringify(response)}`);
    }
    mutate();
    resetCleanupRules();
  });

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
      setCleanupRules(({...cleanupRules}) => {
        for (const item of data.items) {
          if (item.canMall) {
            cleanupRules[item.id] = {action: 'MALL', minPrice: 0};
          }
        }
        return cleanupRules;
      }),
    [data]
  );
  const setAllItemsToCloset = useCallback(
    () =>
      data &&
      setCleanupRules(({...cleanupRules}) => {
        for (const item of data.items) {
          if (item.canCloset) {
            cleanupRules[item.id] = {action: 'CLST'};
          }
        }
        return cleanupRules;
      }),
    [data]
  );
  const setAllItemsToKeep = useCallback(
    () =>
      data &&
      setCleanupRules(({...cleanupRules}) => {
        for (const item of data.items) {
          cleanupRules[item.id] = {action: 'KEEP'};
        }
        return cleanupRules;
      }),
    [data]
  );

  return (
    <>
      <H3>Uncategorized Items in Your Inventory</H3>
      {data ? (
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
              onChange={setCleanupRules}
              onReset={resetCleanupRules}
              onSave={doSave}
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
