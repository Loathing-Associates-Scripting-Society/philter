import {toInt, visitUrl} from 'kolmafia';
import {CleanupActionFunction, cleanupSimple} from './base';

/**
 * Cleanup action that breaks apart BRICKO items.
 */
export const cleanupBreakApart: CleanupActionFunction = (plan, config) =>
  cleanupSimple({
    items: plan.breakBricko,
    config,
    commandPrefix: 'break apart',
    process: chunk => {
      for (const [item, amount] of chunk) {
        for (let i = 0; i < amount; ++i) {
          // TODO: Check response text to verify if item was broken apart
          visitUrl(
            `inventory.php?action=breakbricko&pwd&ajax=1&whichitem=${toInt(
              item
            )}`
          );
        }
      }
    },
    shouldReplan: true,
  });
