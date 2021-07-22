import {PhilterConfig} from '@philter/common';
import {
  CONFIG_NAMES,
  loadCleanupRulesetFile,
  loadStockingRulesetFile,
  logger,
} from '@philter/common/kol';
import {
  cliExecute,
  emptyCloset,
  getProperty,
  myAscensions,
  myName,
  toBoolean,
} from 'kolmafia';
import {assert, withProperties} from 'kolmafia-util';
import {getvar} from 'zlib.ash';
import {cleanupAutosell} from './cleanup/autosell';
import {cleanupBreakApart} from './cleanup/break';
import {cleanupMoveToCloset} from './cleanup/closet';
import {cleanupDiscard} from './cleanup/discard';
import {cleanupMoveToDisplayCase} from './cleanup/display';
import {cleanupSendGifts} from './cleanup/gift';
import {cleanupMakeItems} from './cleanup/make';
import {cleanupMallsell} from './cleanup/mall';
import {cleanupPulverize} from './cleanup/pulverize';
import {cleanupMoveToClanStash} from './cleanup/stash';
import {cleanupShowReminder} from './cleanup/todo';
import {cleanupUntinker} from './cleanup/untinker';
import {cleanupUseItems} from './cleanup/use';
import {CleanupPlanner} from './planner';
import {stock} from './stocking';

/**
 * Loads cleanup rules from the player's cleanup ruleset file into a map.
 * This will look for a ruleset file whose name is given by `dataFileName`.
 * If this fails, it uses the current player's name as a fallback.
 * @param dataFileName Full name of data file including file extension
 * @return The loaded and combined cleanup ruleset
 */
function loadCurrentCleanupRules(dataFileName: string) {
  // TODO: Hopefully, nobody is using `OCD_<name>_Data.txt`.
  // Maybe we could remove it altogether
  const cleanupRules =
    loadCleanupRulesetFile(dataFileName) ||
    loadCleanupRulesetFile(`OCD_${myName()}_Data.txt`);
  assert.ok(
    cleanupRules,
    `Failed to load cleanup rules from file "${dataFileName}"`
  );
  assert.isAbove(
    cleanupRules.size,
    0,
    `Failed to load cleanup rules, file "${dataFileName}" is empty or missing`
  );
  return cleanupRules;
}

function doPhilter(config: Readonly<PhilterConfig>): {
  success: boolean;
  finalSale: number;
} {
  let finalSale = 0;

  const cleanupRules = loadCurrentCleanupRules(
    `OCDdata_${config.dataFileName}.txt`
  );
  let stockingRules = loadStockingRulesetFile(
    `OCDstock_${config.stockFileName}.txt`
  );
  if (!stockingRules) {
    if (getvar('BaleOCD_Stock') === '1') {
      assert.fail('You are missing item stocking information.');
    }
    stockingRules = new Map();
  }

  const planner = new CleanupPlanner();

  const actions = [
    // Actions that may create additional items, or remove items not included in
    // its execution plan
    cleanupBreakApart,
    cleanupMakeItems,
    cleanupUntinker,
    cleanupUseItems,
    cleanupPulverize,
    // Actions that never create or remove additional items
    cleanupMallsell,
    cleanupAutosell,
    cleanupDiscard,
    cleanupMoveToDisplayCase,
    cleanupMoveToCloset,
    cleanupMoveToClanStash,
    cleanupSendGifts,
  ];

  let plan = planner.makePlan(cleanupRules, stockingRules);
  if (!plan) return {success: false, finalSale};

  for (const actionFunc of actions) {
    const result = actionFunc(plan, config);
    finalSale += result.profit;
    if (result.shouldReplan) {
      plan = planner.makePlan(cleanupRules, stockingRules);
      if (!plan) return {success: false, finalSale};
    }
  }

  if (getvar('BaleOCD_Stock') === '1' && !config.simulateOnly) {
    stock(stockingRules, cleanupRules);
  }

  cleanupShowReminder(plan, config);

  if (config.simulateOnly) {
    logger.success(
      `Simulation finished. To actually clean your inventory, set ${CONFIG_NAMES.simulateOnly} to false and run Philter again.`
    );
  }

  return {success: true, finalSale};
}

/**
 * Executes cleanup and stocking routines.
 * @param config Config object to use
 * @return Total (expected) meat gain from cleanup
 */
export function philter(config: Readonly<PhilterConfig>): number {
  assert.ok(cliExecute('inventory refresh'));

  // Empty closet before emptying out Hangks, otherwise it may interfere with
  // which Hangk's items go to closet
  if (
    config.emptyClosetMode >= 0 &&
    Number(getProperty('lastEmptiedStorage')) !== myAscensions() &&
    !config.simulateOnly
  ) {
    assert.ok(emptyCloset(), 'Failed to empty closet');
  }

  // Empty out Hangks, so it can be accounted for by what follows.
  if (
    toBoolean(getProperty('autoSatisfyWithStorage')) &&
    Number(getProperty('lastEmptiedStorage')) !== myAscensions()
  ) {
    assert.ok(cliExecute('hagnk all'), 'Failed to empty storage');
  }

  return withProperties(
    {
      autoSatisfyWithCloset: 'false',
      autoSatisfyWithStash: 'false',
      autoSatisfyWithStorage: 'false',
    },
    () => {
      const {success, finalSale} = doPhilter(config);
      return success ? finalSale : -1;
    }
  );
}
