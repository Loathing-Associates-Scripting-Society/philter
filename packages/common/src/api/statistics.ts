/**
 * @file Endpoint for general statistics about OCD-Cleanup.
 */

import {OcdCleanupStatistics} from '../data/ocd-statistics.js';
import {RequestBase, SuccessResponseBase} from './base.js';

export const STATISTICS_ROUTE = '/statistics';
export type STATISTICS_ROUTE = typeof STATISTICS_ROUTE;

export type StatisticsGetRequest = RequestBase<STATISTICS_ROUTE, 'get'>;

export interface StatisticsGetResponse extends SuccessResponseBase {
  result: OcdCleanupStatistics;
}

declare module './base' {
  interface Routes {
    [STATISTICS_ROUTE]: RoutesEntry<
      StatisticsGetRequest,
      StatisticsGetResponse
    >;
  }
}
