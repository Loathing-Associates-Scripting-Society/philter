/**
 * @file Routes for the app
 */

import {
  CLEANUP_TABLES_CATEGORIZED_ROUTE,
  CLEANUP_TABLES_UNCATEGORIZED_ROUTE,
  CONFIG_ROUTE,
  INVENTORY_ROUTE,
  OcdAction,
  OcdRule,
  RULESET_ROUTE,
  STATISTICS_ROUTE,
  StockingRule,
} from '@philter/common';
import {isOCDable} from 'ocd-cleanup.ash';
import {getvar} from 'zlib.ash';
import {
  getInventoryState,
  getInventoryStateWithMaps,
} from './controllers/inventory-state';
import {
  CONFIG_NAMES,
  getFullDataFileName,
  getFullStockFileName,
  loadOcdCleanupConfig,
  saveOcdCleanupConfig,
} from './controllers/ocd-cleanup-config';
import {toOcdItem} from './controllers/ocd-item';
import {
  loadOcdRulesetForCurrentPlayer,
  saveOcdRulesetFile,
  saveOcdRulesetForCurrentPlayer,
} from './controllers/ocd-ruleset';
import {
  loadStockingRulesetForCurrentPlayer,
  saveStockingRulesetFile,
} from './controllers/stocking-ruleset';
import {createRoute} from './typed-router';
import {idMappingToItemMap, itemMapToIdMapping} from './util';

export const routes = [
  createRoute(CLEANUP_TABLES_CATEGORIZED_ROUTE, {
    get() {
      const ocdRulesMap = loadOcdRulesetForCurrentPlayer();
      if (!ocdRulesMap || ocdRulesMap.size === 0) {
        throw new Error(
          'All item information is corrupted or missing. Either you have not yet saved any item data or you lost it.'
        );
      }

      const [inventory, inventoryMaps] = getInventoryStateWithMaps();

      const categorizedItems = new Set(ocdRulesMap.keys());
      for (const key of Object.keys(inventoryMaps)) {
        const itemMap = inventoryMaps[key as keyof typeof inventoryMaps];
        for (const item of itemMap.keys()) {
          categorizedItems.add(item);
        }
      }

      return {
        result: {
          ocdRules: itemMapToIdMapping(ocdRulesMap),
          inventory,
          items: Array.from(categorizedItems, item => toOcdItem(item)),
        },
      };
    },
  }),
  createRoute(CLEANUP_TABLES_UNCATEGORIZED_ROUTE, {
    get: () => {
      const ocdRulesMap =
        loadOcdRulesetForCurrentPlayer() || new Map<Item, OcdRule>();
      const [inventory, inventoryMaps] = getInventoryStateWithMaps();

      const uncategorizedItems = new Set<Item>();
      for (const key of Object.keys(inventoryMaps)) {
        const itemMap = inventoryMaps[key as keyof typeof inventoryMaps];
        for (const item of itemMap.keys()) {
          if (!ocdRulesMap.has(item) && isOCDable(item)) {
            uncategorizedItems.add(item);
          }
        }
      }

      return {
        result: {
          inventory,
          items: Array.from(uncategorizedItems, item => toOcdItem(item)),
        },
      };
    },
  }),
  createRoute(RULESET_ROUTE, {
    post(params) {
      const ocdRulesMap = idMappingToItemMap(params.ocdRules);
      const success = saveOcdRulesetForCurrentPlayer(ocdRulesMap);

      return success
        ? {result: {success}}
        : {error: {code: 500, message: 'Cannot save OCD ruleset'}};
    },
    patch(params) {
      const ocdRulesMap =
        loadOcdRulesetForCurrentPlayer() || new Map<Item, OcdRule>();
      for (const [item, patch] of idMappingToItemMap(params.ocdRulesPatch)) {
        if (patch === null) {
          ocdRulesMap.delete(item);
        } else {
          ocdRulesMap.set(item, patch);
        }
      }
      const success = saveOcdRulesetForCurrentPlayer(ocdRulesMap);

      return success
        ? {result: {success}}
        : {error: {code: 500, message: 'Cannot update OCD ruleset'}};
    },
  }),
  createRoute(CONFIG_ROUTE, {
    get: () => ({result: loadOcdCleanupConfig()}),
    post(request) {
      const config = request.config;

      if (request.shouldCopyDataFiles) {
        if (config.dataFileName !== getvar(CONFIG_NAMES.dataFileName)) {
          // "Copy" file even if the original stocking file is missing or empty
          if (
            !saveOcdRulesetFile(
              getFullDataFileName(config.dataFileName),
              loadOcdRulesetForCurrentPlayer() || new Map<Item, OcdRule>()
            )
          ) {
            throw new Error(
              `Cannot copy OCD ruleset from ${CONFIG_NAMES.dataFileName} to ${config.dataFileName}`
            );
          }
        }

        if (config.stockFileName !== getvar(CONFIG_NAMES.stockFileName)) {
          // "Copy" file even if the original stocking file is missing or empty
          saveStockingRulesetFile(
            getFullStockFileName(config.stockFileName),
            loadStockingRulesetForCurrentPlayer() ||
              new Map<Item, StockingRule>()
          );
        }
      }

      saveOcdCleanupConfig(config);
      return {result: {success: true}};
    },
  }),
  createRoute(INVENTORY_ROUTE, {
    get: () => ({result: getInventoryState()}),
  }),
  createRoute(STATISTICS_ROUTE, {
    get: () => {
      const ocdRulesMap =
        loadOcdRulesetForCurrentPlayer() || new Map<Item, OcdRule>();
      const [, inventoryMaps] = getInventoryStateWithMaps();

      const categorizedItemCounts: Record<OcdAction, number> = {
        AUTO: 0,
        BREAK: 0,
        CLAN: 0,
        CLST: 0,
        DISC: 0,
        DISP: 0,
        GIFT: 0,
        KEEP: 0,
        MAKE: 0,
        MALL: 0,
        PULV: 0,
        TODO: 0,
        UNTN: 0,
        USE: 0,
      };
      for (const rule of ocdRulesMap.values()) {
        ++categorizedItemCounts[rule.action];
      }

      const uncategorizedItems = new Set<Item>();
      for (const key of Object.keys(inventoryMaps)) {
        const itemMap = inventoryMaps[key as keyof typeof inventoryMaps];
        for (const item of itemMap.keys()) {
          if (!ocdRulesMap.has(item) && isOCDable(item)) {
            uncategorizedItems.add(item);
          }
        }
      }

      return {
        result: {
          categorizedItemCounts,
          uncategorizedItemCount: uncategorizedItems.size,
        },
      };
    },
  }),
];
