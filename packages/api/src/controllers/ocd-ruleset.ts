/**
 * @file Tools for managing `OcdRuleset` objects.
 */

import {isOcdAction, OcdRule} from '@ocd-cleanup/common';
import {bufferToFile, myName, toBoolean, toInt, toItem} from 'kolmafia';
import {getvar} from 'zlib.ash';
import {createMapLoader, encodeItem} from '../util';
import {CONFIG_NAMES, getFullDataFileName} from './ocd-cleanup-config';

/**
 * Loads an OCD ruleset from a text file into a map.
 * @param filename Path to the data file
 * @return Map of each item to its OCD rule. If the user's OCD ruleset file is
 *    empty or missing, returns `null`.
 * @throws {TypeError} If the file contains invalid data
 */
const loadOcdRulesetFile = createMapLoader(
  (
    [itemName, action, keepAmountStr, info, message],
    _,
    filename
  ): [Item, OcdRule] => {
    if (!isOcdAction(action)) {
      throw new TypeError(
        `${action} is not a valid OCD action (file: ${filename}, entry: ${itemName})`
      );
    }

    let rule: OcdRule;
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
      // Curiously, OCD Inventory Control stores the message in the 'info' field
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
 * Saves a map containing an OCD ruleset to a text file.
 * @param filepath Path to the data file
 * @param ocdRuleset Map of each item to its item info
 */
export function saveOcdRulesetFile(
  filepath: string,
  ocdRuleset: ReadonlyMap<Item, Readonly<OcdRule>>
): boolean {
  // Sort entries by item ID in ascending order when saving
  const buffer = Array.from(ocdRuleset.entries())
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
 * Loads the OCD ruleset from the ruleset file of the current player.
 * @return Map of each item to its OCD rule. If the user's OCD ruleset file is
 *    empty or missing, returns `null`.
 */
export function loadOcdRulesetForCurrentPlayer() {
  let ocdRulesMap = loadOcdRulesetFile(
    getFullDataFileName(getvar(CONFIG_NAMES.dataFileName))
  );
  if (!ocdRulesMap || ocdRulesMap.size === 0) {
    // Legacy file name
    // TODO: We inherited this from OCD Inventory Manager. Since nobody seems to
    // be using this anymore, we can probably remove it.
    ocdRulesMap = loadOcdRulesetFile(`OCD_${myName()}.txt`);
  }
  return ocdRulesMap;
}

/**
 * Writes the OCD ruleset to the ruleset file of the current player.
 * @param stockingRuleset OCD ruleset to save
 */
export function saveOcdRulesetForCurrentPlayer(
  ocdRuleset: ReadonlyMap<Item, Readonly<OcdRule>>
) {
  return saveOcdRulesetFile(
    getFullDataFileName(getvar(CONFIG_NAMES.dataFileName)),
    ocdRuleset
  );
}
