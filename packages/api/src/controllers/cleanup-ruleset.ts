/**
 * @file Tools for managing `CleanupRuleset` objects.
 */

import {isCleanupAction, CleanupRule} from '@philter/common';
import {bufferToFile, myName, toBoolean, toInt, toItem} from 'kolmafia';
import {getvar} from 'zlib.ash';
import {createMapLoader, encodeItem} from '../util';
import {CONFIG_NAMES, getFullDataFileName} from './philter-config';

/**
 * Loads a cleanup ruleset from a text file into a map.
 * @param filename Path to the data file
 * @return Map of each item to its cleanup rule. If the user's cleanup ruleset
 *    file is empty or missing, returns `null`.
 * @throws {TypeError} If the file contains invalid data
 */
const loadCleanupRulesetFile = createMapLoader(
  (
    [itemName, action, keepAmountStr, info, message],
    _,
    filename
  ): [Item, CleanupRule] => {
    if (!isCleanupAction(action)) {
      throw new TypeError(
        `${action} is not a valid cleanup action (file: ${filename}, entry: ${itemName})`
      );
    }

    let rule: CleanupRule;
    if (action === 'GIFT') {
      rule = {action, recipent: info, message};
    } else if (action === 'MAKE') {
      rule = {
        action,
        targetItem: info,
        shouldUseCreatableOnly: toBoolean(message),
      };
    } else if (action === 'MALL') {
      const minPrice = Number(info);
      if (!Number.isInteger(minPrice)) {
        throw new TypeError(
          `Invalid minimum price ${minPrice} for MALL rule (file: ${filename}, entry: ${itemName})`
        );
      }
      rule = {action, minPrice};
    } else if (action === 'TODO') {
      // Curiously, Philter stores the message in the 'info' field
      rule = {action, message: info};
    } else {
      rule = {action};
    }

    const keepAmount = Number(keepAmountStr);
    if (!Number.isInteger(keepAmount)) {
      throw new TypeError(
        `Invalid keep amount ${keepAmountStr} (file: ${filename}, entry: ${itemName})`
      );
    }
    if (keepAmount > 0) {
      rule.keepAmount = keepAmount;
    }

    return [toItem(itemName), rule];
  }
);

/**
 * Saves a map containing a cleanup ruleset to a text file.
 * @param filepath Path to the data file
 * @param cleanupRulesMap Map of each item to its item info
 */
export function saveCleanupRulesetFile(
  filepath: string,
  cleanupRulesMap: ReadonlyMap<Item, Readonly<CleanupRule>>
): boolean {
  // Sort entries by item ID in ascending order when saving
  const buffer = Array.from(cleanupRulesMap.entries())
    .sort(([itemA], [itemB]) => toInt(itemA) - toInt(itemB))
    .map(([item, rule]) => {
      let info = '',
        message = '';
      if (rule.action === 'GIFT') {
        info = rule.recipent;
        message = rule.message;
      } else if (rule.action === 'MAKE') {
        info = rule.targetItem;
        message = String(rule.shouldUseCreatableOnly);
      } else if (rule.action === 'MALL') {
        info = rule.minPrice ? String(rule.minPrice) : '';
      } else if (rule.action === 'TODO') {
        info = rule.message;
      }

      return [
        encodeItem(item),
        rule.action,
        rule.keepAmount || 0,
        info,
        message,
      ].join('\t');
    })
    .join('\n');

  return bufferToFile(buffer, filepath);
}

/**
 * Loads the cleanup ruleset from the ruleset file of the current player.
 * @return Map of each item to its cleanup rule. If the user's cleanup ruleset
 *    file is empty or missing, returns `null`.
 */
export function loadCleanupRulesetForCurrentPlayer() {
  let cleanupRulesMap = loadCleanupRulesetFile(
    getFullDataFileName(getvar(CONFIG_NAMES.dataFileName))
  );
  if (!cleanupRulesMap || cleanupRulesMap.size === 0) {
    // Legacy file name
    // TODO: We inherited this from OCD Inventory Manager. Since nobody seems to
    // be using this anymore, we can probably remove it.
    cleanupRulesMap = loadCleanupRulesetFile(`OCD_${myName()}.txt`);
  }
  return cleanupRulesMap;
}

/**
 * Writes the stocking ruleset to the ruleset file of the current player.
 * @param cleanupRulesMap Stocking ruleset to save
 */
export function saveCleanupRulesetForCurrentPlayer(
  cleanupRulesMap: ReadonlyMap<Item, Readonly<CleanupRule>>
) {
  return saveCleanupRulesetFile(
    getFullDataFileName(getvar(CONFIG_NAMES.dataFileName)),
    cleanupRulesMap
  );
}
