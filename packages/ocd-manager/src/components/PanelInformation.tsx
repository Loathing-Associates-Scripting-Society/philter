import {
  Callout,
  Colors,
  H3,
  HTMLTable,
  NonIdealState,
  Spinner,
} from '@blueprintjs/core';
import {STATISTICS_ROUTE} from '@ocd-cleanup/common';
import React, {useMemo} from 'react';
import useSWR from 'swr';
import {fetchGetStatistics} from '../api';
import './PanelInformation.css';

const BULLET = <span className="PanelInformation__Bullet">&#8943;</span>;

/**
 * Panel that acts as the "home page", and displays general information about
 * the player's cleanup rules.
 */
export const PanelInformation = () => {
  const {data, isValidating: isLoading, error: loadingError} = useSWR(
    STATISTICS_ROUTE,
    async () => (await fetchGetStatistics()).result
  );

  const categorizedCount = useMemo(
    () =>
      data
        ? Object.values(data.categorizedItemCounts).reduce(
            (acc, sum) => acc + sum
          )
        : 0,
    [data]
  );

  return (
    <div>
      <H3>
        <a
          href="https://github.com/Loathing-Associates-Scripting-Society/OCD-Cleanup"
          rel="noopener noreferrer"
          target="_blank"
        >
          OCD-Cleanup Manager
        </a>
      </H3>
      <p>
        Brought to you by{' '}
        <a
          href="https://github.com/Loathing-Associates-Scripting-Society"
          rel="noopener noreferrer"
          target="_blank"
        >
          Loathing Associates Scripting Society
        </a>
      </p>
      <Callout intent="warning" title="Manager v2 is in alpha">
        Using this <i>may</i> destroy your OCD-Cleanup configuration. Use at
        your own risk.
        <br />
        The{' '}
        <a href="/relay_OCD-Cleanup_Manager.ash?relay=true">
          classic OCD-Cleanup Manager
        </a>{' '}
        is still available.
      </Callout>
      {data ? (
        categorizedCount > 0 ? (
          <HTMLTable
            bordered
            className="PanelInformation__VerticalTable"
            condensed
          >
            <tr>
              <th
                style={
                  data.uncategorizedItemCount > 0
                    ? {color: Colors.ORANGE1}
                    : undefined
                }
              >
                Uncategorized (in inventory)
              </th>
              <td
                style={
                  data.uncategorizedItemCount > 0
                    ? {color: Colors.ORANGE1}
                    : undefined
                }
              >
                {data.uncategorizedItemCount}
              </td>
            </tr>
            <tr>
              <th>Items in Ruleset</th>
              <td>{categorizedCount}</td>
            </tr>
            <tr>
              <th>{BULLET} Keep All</th>
              <td>{data.categorizedItemCounts.KEEP}</td>
            </tr>
            <tr>
              <th>{BULLET} Mallsell</th>
              <td>{data.categorizedItemCounts.MALL}</td>
            </tr>
            <tr>
              <th>{BULLET} Autosell/Discard</th>
              <td>
                {data.categorizedItemCounts.AUTO +
                  data.categorizedItemCounts.DISC}
              </td>
            </tr>
            <tr>
              <th>{BULLET} Pulverize</th>
              <td>{data.categorizedItemCounts.PULV}</td>
            </tr>
            <tr>
              <th>{BULLET} Use or break</th>
              <td>
                {data.categorizedItemCounts.BREAK +
                  data.categorizedItemCounts.USE}
              </td>
            </tr>
            <tr>
              <th>{BULLET} Put in closet</th>
              <td>{data.categorizedItemCounts.CLST}</td>
            </tr>
            <tr>
              <th>{BULLET} Put in clan stash</th>
              <td>{data.categorizedItemCounts.CLAN}</td>
            </tr>
            <tr>
              <th>{BULLET} Crafting</th>
              <td>{data.categorizedItemCounts.MAKE}</td>
            </tr>
            <tr>
              <th>{BULLET} Untinker</th>
              <td>{data.categorizedItemCounts.UNTN}</td>
            </tr>
            <tr>
              <th>{BULLET} Send as gift</th>
              <td>{data.categorizedItemCounts.GIFT}</td>
            </tr>
            <tr>
              <th>{BULLET} Put in display case</th>
              <td>{data.categorizedItemCounts.DISP}</td>
            </tr>
            <tr>
              <th>{BULLET} Remind me later</th>
              <td>{data.categorizedItemCounts.TODO}</td>
            </tr>
          </HTMLTable>
        ) : (
          <NonIdealState
            icon="help"
            description='If this is your first time using OCD-Cleanup, you can create cleanup rules for your items in the "Add Items" tab.'
            title="Your OCD-Cleanup ruleset is empty or missing."
          />
        )
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
    </div>
  );
};
