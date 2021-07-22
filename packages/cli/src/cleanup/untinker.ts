import {cliExecute, toInt} from 'kolmafia';
import {assert} from 'kolmafia-util';
import {CleanupActionFunction, cleanupSimple} from './base';

/**
u * Cleanup action that  Untinkers items.
 */
export const cleanupUntinker: CleanupActionFunction = (plan, config) =>
  cleanupSimple({
    items: plan.untinker,
    config,
    commandPrefix: 'untinker',
    process: items => {
      for (const [item, amount] of items) {
        assert.ok(
          cliExecute(`untinker ${amount} \u00B6${toInt(item)}`),
          `Failed to untinker ${amount} of ${item}`
        );
      }
    },
    shouldReplan: true,
  });
