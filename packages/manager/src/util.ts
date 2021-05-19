/**
 * @file Utilities that don't quite fit anywhere else.
 */

import {CleanupAction, ItemInfo} from '@philter/common';

/**
 * Maximum possible mallsell price for any item.
 * This is a limit enforced by KoL.
 */
export const MAX_MALL_PRICE = 999_999_999 as const;

/**
 * Zero-width space character. This can be used to allow browsers to break long
 * words across multiple lines, or as an empty placeholder.
 */
export const ZWSP = '\u200B';

/**
 * @param action Cleanup action
 * @return Human-readable short name for the action
 */
export const cleanupActionToString = (action: CleanupAction): string => {
  switch (action) {
    case 'AUTO':
      return 'Autosell';
    case 'BREAK':
      return 'Break apart';
    case 'CLAN':
      return 'Put in clan stash';
    case 'CLST':
      return 'Closet';
    case 'DISC':
      return 'Discard';
    case 'DISP':
      return 'Display';
    case 'GIFT':
      return 'Send as gift';
    case 'KEEP':
      return 'Keep all';
    case 'MAKE':
      return 'Craft';
    case 'MALL':
      return 'Mall sale';
    case 'PULV':
      return 'Pulverize';
    case 'TODO':
      return 'Reminder';
    case 'UNTN':
      return 'Untinker';
    case 'USE':
      return 'Use';
    default:
      // If we forget an action, TypeScript will catch this as a compile error
      return ((n: never) => n)(action);
  }
};

/**
 * @param item Item type to check
 * @return Whether Philter Manager should warn about pulverizing the item
 */
export const shouldWarnOnPulverize = (item: Readonly<ItemInfo>): boolean =>
  !item.isTradable;

/**
 * Identity function that returns the first argument as-is.
 * This is primarily intended to perform compile-time type-checks against union
 * types or enums.
 * **This does NOT perform any runtime type checks!**
 * @param value
 * @return `value` unmodified
 */
export const typeCheck = <T>(value: T): T => value;
