import {OcdAction} from '../data/ocd-rule.js';

/**
 * Describes general statistics about Philter that the user may be interested
 * in.
 */
export interface OcdCleanupStatistics {
  /** Number of categorized items for each action. */
  categorizedItemCounts: {
    [action in OcdAction]: number;
  };
  /**
   * Number of uncategorized items in inventory, closet, storage, or display
   * case.
   */
  uncategorizedItemCount: number;
}
