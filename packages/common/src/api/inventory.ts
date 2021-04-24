/**
 * @file Defines requests and responses for the player's inventory state.
 */

import {InventoryState} from '../data/inventory-state.js';
import {RequestBase, SuccessResponseBase} from './base.js';

export const INVENTORY_ROUTE = '/inventory' as const;
export type INVENTORY_ROUTE = typeof INVENTORY_ROUTE;

export type InventoryStateGetRequest = RequestBase<INVENTORY_ROUTE, 'get'>;

export interface InventoryStateGetResponse extends SuccessResponseBase {
  result: InventoryState;
}

declare module './base' {
  interface Routes {
    [INVENTORY_ROUTE]: RoutesEntry<
      InventoryStateGetRequest,
      InventoryStateGetResponse
    >;
  }
}
