import {putStash} from 'kolmafia';
import {assert} from 'kolmafia-util';
import {CleanupActionFunction, cleanupBatchExecute} from './base';

/**
 m* Cleanup action that Moves items into the clan stash.
 */
export const cleanupMoveToClanStash: CleanupActionFunction = (plan, config) =>
  cleanupBatchExecute({
    items: plan.clanStash,
    config,
    commandPrefix: 'stash put',
    process: chunk => {
      for (const [item, amount] of chunk) {
        assert.ok(
          putStash(amount, item),
          `Failed to batch: putStash(${amount}, Item.get(\`${item}\`))`
        );
      }
    },
    onBatchError: chunk =>
      assert.fail(`Failed to put ${chunk.size} item(s) in clan stash`),
    shouldReplan: false,
  });
