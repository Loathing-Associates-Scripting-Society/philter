import {putDisplay} from 'kolmafia';
import {assert} from 'kolmafia-util';
import {CleanupActionFunction, cleanupBatchExecute} from './base';

/**
 * Cleanup action that moves items into the display case.
 */
export const cleanupMoveToDisplayCase: CleanupActionFunction = (plan, config) =>
  cleanupBatchExecute({
    items: plan.displayCase,
    config,
    commandPrefix: 'display',
    process: chunk => {
      for (const [item, amount] of chunk) {
        assert.ok(
          putDisplay(amount, item),
          `Failed to batch: putDisplay(${amount}, Item.get(\`${item}\`))`
        );
      }
    },
    onBatchError: chunk =>
      assert.fail(`Failed to put ${chunk.size} item(s) in display case`),
    shouldReplan: false,
  });
