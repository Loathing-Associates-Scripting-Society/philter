import {print, printHtml} from 'kolmafia';
import {assert} from 'kolmafia-util';
import {CleanupActionFunction} from './base';

/**
 * Cleanup action that prints reminder messages for "TODO" items.
 */
export const cleanupShowReminder: CleanupActionFunction = (plan, config) => {
  const items = plan.reminder;
  if (items.size > 0) {
    print('');

    if (!config.simulateOnly) {
      for (const [item, amount] of items) {
        const rule = plan.cleanupRules.get(item);
        assert.ok(rule, `Missing rule for ${item}`);
        assert.ok(
          rule.action === 'TODO',
          `Unexpected action for ${item}: expected 'TODO', but got '${rule.action}'`
        );
        printHtml(`<b>${item} (${amount}): ${rule.message}</b>`);
      }
    }
  }

  return {shouldReplan: false, profit: 0};
};
