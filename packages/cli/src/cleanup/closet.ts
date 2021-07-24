import {putCloset} from 'kolmafia';
import {assert} from 'kolmafia-util';
import {CleanupActionFunction, cleanupBatchExecute} from './base';

/**
 * Cleanup action that moves items into the closet.
 */
export const cleanupMoveToCloset: CleanupActionFunction = (plan, config) =>
  cleanupBatchExecute({
    items: plan.closet,
    config,
    commandPrefix: 'closet',
    process: chunk => {
      for (const [item, amount] of chunk) {
        assert.ok(
          putCloset(amount, item),
          `Failed to batch: putCloset(${amount}, Item.get(\`${item}\`))`
        );
      }
    },
    onBatchError: chunk =>
      assert.fail(`Failed to put ${chunk.size} item(s) in closet`),
    shouldReplan: false,
  });
