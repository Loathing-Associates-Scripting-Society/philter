import {CleanupAction} from './cleanup-rule.js';

/**
 * Describes general statistics about Philter that the user may be interested
 * in.
 */
export interface PhilterStatistics {
  /** Number of categorized items for each action. */
  categorizedItemCounts: {
    [action in CleanupAction]: number;
  };
  /**
   * Number of uncategorized items in inventory, closet, storage, or display
   * case.
   */
  uncategorizedItemCount: number;
}
