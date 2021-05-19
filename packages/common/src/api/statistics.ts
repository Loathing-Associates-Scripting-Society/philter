/**
 * @file Endpoint for general statistics about Philter.
 */

import {PhilterStatistics} from '../data/philter-statistics.js';
import {RequestBase, SuccessResponseBase} from './base.js';

export const STATISTICS_ROUTE = '/statistics';
export type STATISTICS_ROUTE = typeof STATISTICS_ROUTE;

export type StatisticsGetRequest = RequestBase<STATISTICS_ROUTE, 'get'>;

export interface StatisticsGetResponse extends SuccessResponseBase {
  result: PhilterStatistics;
}

declare module './base' {
  interface Routes {
    [STATISTICS_ROUTE]: RoutesEntry<
      StatisticsGetRequest,
      StatisticsGetResponse
    >;
  }
}
