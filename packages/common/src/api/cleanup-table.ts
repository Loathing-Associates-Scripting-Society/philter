/**
 * @file Defines routes for Cleanup Tables.
 */

import {InventoryState} from '../data/inventory-state.js';
import {ItemInfo} from '../data/item-info.js';
import {CleanupRuleset} from '../data/cleanup-rule.js';
import {RequestBase, SuccessResponseBase} from './base.js';

export const CLEANUP_TABLES_CATEGORIZED_ROUTE = '/cleanup-tables/categorized';
export type CLEANUP_TABLES_CATEGORIZED_ROUTE =
  typeof CLEANUP_TABLES_CATEGORIZED_ROUTE;

/**
 * Request for a cleanup table of categorized items.
 */
export type CleanupTableCategorizedGetRequest = RequestBase<
  CLEANUP_TABLES_CATEGORIZED_ROUTE,
  'get'
>;

/**
 * Response containing a cleanup table of categorized items, in inventory or
 * otherwise.
 */
export interface CleanupTableCategorizedGetResponse
  extends SuccessResponseBase {
  result: {
    /** Inventory state needed to render the table. */
    inventory: InventoryState;
    /**
     * Categorized items (i.e. has a cleanup action assigned)
     */
    items: ItemInfo[];
    /**
     * The entire cleanup ruleset
     */
    cleanupRules: CleanupRuleset;
  };
}

export const CLEANUP_TABLES_UNCATEGORIZED_ROUTE =
  '/cleanup-tables/uncategorized';
export type CLEANUP_TABLES_UNCATEGORIZED_ROUTE =
  typeof CLEANUP_TABLES_UNCATEGORIZED_ROUTE;

/**
 * Request for a cleanup table of uncategorized items in inventory.
 */
export type CleanupTableUncategorizedGetRequest = RequestBase<
  CLEANUP_TABLES_UNCATEGORIZED_ROUTE,
  'get'
>;

/**
 * Response containing a cleanup table of uncategorized items in inventory.
 * This includes any items in the closet, display case, and storage.
 * Items that cannot be processed by Philter are excluded.
 */
export interface CleanupTableUncategorizedGetResponse
  extends SuccessResponseBase {
  result: {
    /**
     * Uncategorized items (i.e. has no cleanup action assigned) in inventory.
     */
    items: ItemInfo[];
    /** Inventory state needed to render the table. */
    inventory: InventoryState;
    /**
     * The entire cleanup ruleset.
     */
    cleanupRules: CleanupRuleset;
  };
}

declare module './base' {
  interface Routes {
    [CLEANUP_TABLES_CATEGORIZED_ROUTE]: RoutesEntry<
      CleanupTableCategorizedGetRequest,
      CleanupTableCategorizedGetResponse
    >;
    [CLEANUP_TABLES_UNCATEGORIZED_ROUTE]: RoutesEntry<
      CleanupTableUncategorizedGetRequest,
      CleanupTableUncategorizedGetResponse
    >;
  }
}
