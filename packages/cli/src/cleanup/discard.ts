import {print, toInt, visitUrl} from 'kolmafia';
import {CleanupActionFunction, cleanupSimple} from './base';

/**
 * Cleanup action that discards items.
 */
export const cleanupDiscard: CleanupActionFunction = (plan, config) =>
  cleanupSimple({
    items: plan.discard,
    config,
    commandPrefix: 'discard',
    process: items => {
      for (const [item, amount] of items) {
        for (let i = 0; i < amount; ++i) {
          print(`Discarding ${amount} of ${item.name}...`);
          // TODO: Check response text to verify if item was discarded
          visitUrl(
            `inventory.php?action=discard&pwd&ajax=1&whichitem=${toInt(item)}`
          );
        }
      }
    },
    shouldReplan: false,
  });
