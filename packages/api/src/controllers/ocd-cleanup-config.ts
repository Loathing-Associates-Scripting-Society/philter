/**
 * @file Tools for managing `OcdCleanupConfig` objects.
 */

import {OcdCleanupConfig} from '@philter/common';
import {toBoolean} from 'kolmafia';
import {_updateZlibVars} from 'philter.util.ash';
import {getvar} from 'zlib.ash';

/**
 * Namespace object that maps each config key to their ZLib variable name.
 */
export const CONFIG_NAMES: Readonly<
  Record<keyof OcdCleanupConfig, string>
> = Object.freeze({
  emptyClosetMode: 'BaleOCD_EmptyCloset',
  simulateOnly: 'BaleOCD_Sim',
  mallPricingMode: 'BaleOCD_Pricing',
  mallMultiName: 'BaleOCD_MallMulti',
  mallMultiKmailMessage: 'BaleOCD_MultiMessage',
  canUseMallMulti: 'BaleOCD_UseMallMulti',
  dataFileName: 'BaleOCD_DataFile',
  stockFileName: 'BaleOCD_StockFile',
});

/**
 * Get the full file name of an OCD ruleset file, including the prefix and file
 * extension.
 */
export function getFullDataFileName(fileNameComponent: string) {
  return `OCDdata_${fileNameComponent}.txt`;
}

/**
 * Get the full file name of an OCD stocking ruleset file, including the prefix
 * and file extension.
 */
export function getFullStockFileName(fileNameComponent: string) {
  return `OCDstock_${fileNameComponent}.txt`;
}

export function loadOcdCleanupConfig(): OcdCleanupConfig {
  const emptyClosetMode = parseInt(getvar(CONFIG_NAMES.emptyClosetMode));
  const mallPricingMode = getvar(CONFIG_NAMES.mallPricingMode);
  return {
    emptyClosetMode:
      emptyClosetMode === 0 || emptyClosetMode === -1 ? emptyClosetMode : 0,
    simulateOnly: toBoolean(CONFIG_NAMES.simulateOnly),
    mallPricingMode:
      mallPricingMode === 'auto' || mallPricingMode === 'max'
        ? mallPricingMode
        : 'auto',
    mallMultiName: getvar(CONFIG_NAMES.mallMultiName),
    mallMultiKmailMessage: getvar(CONFIG_NAMES.mallMultiKmailMessage),
    canUseMallMulti: toBoolean(getvar(CONFIG_NAMES.canUseMallMulti)),
    dataFileName: getvar(CONFIG_NAMES.dataFileName),
    stockFileName: getvar(CONFIG_NAMES.stockFileName),
  };
}

export function saveOcdCleanupConfig(config: OcdCleanupConfig) {
  const serializedConfig: Record<string, string> = {};
  for (const key of Object.keys(config)) {
    const varName: string | undefined =
      CONFIG_NAMES[key as keyof typeof CONFIG_NAMES];
    if (varName === undefined) {
      throw new Error(`Cannot find ZLib config name for config key '${key}'`);
    }
    serializedConfig[varName] = String(config[key as keyof typeof config]);
  }
  _updateZlibVars(serializedConfig);
}
