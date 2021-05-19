import {
  Button,
  ButtonGroup,
  FormGroup,
  H3,
  NonIdealState,
  Spinner,
} from '@blueprintjs/core';
import {CLEANUP_TABLES_UNCATEGORIZED_ROUTE, OcdRuleset} from '@philter/common';
import {dequal} from 'dequal/lite';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useAsyncCallback} from 'react-async-hook';
import useSWR from 'swr';
import {fetchGetCleanupTableUncategorized, fetchPatchOcdRuleset} from '../api';
import {setErrorToast, setSavingToast} from '../toaster';
import {OcdItemTable} from './OcdItemTable';
import './PanelUncategorizedItems.css';

const EMPTY_OCD_RULES = {};

export const PanelUncategorizedItems = (): JSX.Element => {
  // Major assumptions:
  //
  // - data.items contains _only_ items that are uncategorized, i.e. the server
  //   performs the filtering for us.
  // - ocdRules always starts as an empty ruleset. Since data.items has already
  //   been curated, there is no need to retrieve the entire ruleset from the
  //   server.
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

  const [ocdRules, setOcdRules] = useState<OcdRuleset>(EMPTY_OCD_RULES);
  const resetOcdRules = useCallback(() => setOcdRules(EMPTY_OCD_RULES), []);

  const hasChanges = useMemo(() => !dequal(ocdRules, EMPTY_OCD_RULES), [
    ocdRules,
  ]);

  const {
    error: savingError,
    execute: doSave,
    loading: isSaving,
  } = useAsyncCallback(async () => {
    const response = await fetchPatchOcdRuleset(ocdRules);
    if (!response?.result?.success) {
      throw new Error(`Unexpected response: ${JSON.stringify(response)}`);
    }
    mutate();
    resetOcdRules();
  });

  useEffect(
    () => setErrorToast('savingError', savingError, 'Cannot save OCD rule'),
    [savingError]
  );
  useEffect(() => setSavingToast('isSaving', isSaving, 'Saving OCD rules...'), [
    isSaving,
  ]);

  const setAllItemsToMall = useCallback(
    () =>
      data &&
      setOcdRules(({...ocdRules}) => {
        for (const item of data.items) {
          if (item.canMall) {
            ocdRules[item.id] = {action: 'MALL', minPrice: 0};
          }
        }
        return ocdRules;
      }),
    [data]
  );
  const setAllItemsToCloset = useCallback(
    () =>
      data &&
      setOcdRules(({...ocdRules}) => {
        for (const item of data.items) {
          if (item.canCloset) {
            ocdRules[item.id] = {action: 'CLST'};
          }
        }
        return ocdRules;
      }),
    [data]
  );
  const setAllItemsToKeep = useCallback(
    () =>
      data &&
      setOcdRules(({...ocdRules}) => {
        for (const item of data.items) {
          ocdRules[item.id] = {action: 'KEEP'};
        }
        return ocdRules;
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
                        item.canMall && ocdRules[item.id]?.action !== 'MALL'
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
                        item.canCloset && ocdRules[item.id]?.action !== 'CLST'
                    )
                  }
                  onClick={setAllItemsToCloset}
                >
                  Closet
                </Button>
                <Button
                  disabled={
                    !data.items.some(
                      item => ocdRules[item.id]?.action !== 'KEEP'
                    )
                  }
                  onClick={setAllItemsToKeep}
                >
                  Keep all
                </Button>
              </ButtonGroup>
            </FormGroup>
            <OcdItemTable
              className="PanelUncategorizedItems__Table"
              disableReset={!hasChanges}
              disableSave={!hasChanges}
              inventory={data.inventory}
              items={data.items}
              ocdRules={ocdRules}
              onChange={setOcdRules}
              onReset={resetOcdRules}
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
