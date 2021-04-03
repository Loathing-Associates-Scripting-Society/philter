/**
 * @file Tools for managing `OcdStockRuleset` objects.
 */

/**
 * @file Tools for managing `OcdRuleset` objects.
 */

import {StockingRule} from '@ocd-cleanup/common';
import {bufferToFile, toInt, toItem} from 'kolmafia';
import {getvar} from 'zlib.ash';
import {createMapLoader, encodeItem} from '../util';
import {CONFIG_NAMES, getFullStockFileName} from './ocd-cleanup-config';

/**
 * Loads an OCD stocking ruleset from a text file into a map.
 * @param fileName Path to the data file
 * @return Map of each item to its stocking rule. If the user's OCD stocking
 *    ruleset file is empty or missing, returns `null`.
 * @throws {TypeError} If the file contains invalid data
 */
const loadStockingRulesetFile = createMapLoader(
  (
    [itemName, type, amountStr, category = ''],
    _,
    fileName
  ): [Item, StockingRule] => {
    const amount = Number(amountStr);
    if (!Number.isInteger(amount)) {
      throw new TypeError(
        `Invalid stock-up amount (${amount}) for item '${itemName}' in file '${fileName}'`
      );
    }

    return [toItem(itemName), {type, amount, category}];
  }
);

/**
 * Saves a map containing an OCD stocking ruleset to a text file.
 * @param filepath Path to the data file
 * @param stockingRuleset Map of each item to its stocking rule
 */
export function saveStockingRulesetFile(
  filepath: string,
  stockingRuleset: ReadonlyMap<Item, Readonly<StockingRule>>
) {
  // Sort entries by item ID in ascending order when saving
  const buffer = Array.from(stockingRuleset.entries())
    .sort(([itemA], [itemB]) => toInt(itemA) - toInt(itemB))
    .map(([item, rule]) =>
      [encodeItem(item), rule.type, rule.amount, rule.category].join('\t')
    )
    .join('\n');

  if (!bufferToFile(buffer, filepath)) {
    throw new Error(`Failed to save to ${filepath}`);
  }
}

/**
 * Loads the OCD stocking ruleset from the stocking ruleset file of the current
 * player.
 * @return Map of each item to its stocking rule. If the user's OCD stocking
 *    ruleset file is empty or missing, returns `null`.
 */
export function loadStockingRulesetForCurrentPlayer() {
  return loadStockingRulesetFile(
    getFullStockFileName(getvar(CONFIG_NAMES.stockFileName))
  );
}

/**
 * Writes the OCD stocking ruleset to the stocking ruleset file of the current
 * player.
 * @param stockingRuleset OCD stocking ruleset to save
 */
export function saveStockingRulesetForCurrentPlayer(
  stockingRuleset: ReadonlyMap<Item, Readonly<StockingRule>>
) {
  return saveStockingRulesetFile(
    getFullStockFileName(getvar(CONFIG_NAMES.stockFileName)),
    stockingRuleset
  );
}
