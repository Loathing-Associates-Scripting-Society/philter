import {ReadonlyCleanupRules} from '@philter/common/kol';
import {assert, sendToPlayer} from 'kolmafia-util';
import {CleanupActionFunction, cleanupSimple} from './base';

// TODO: Extract GIFT rule at planning stage rather than action stage
// Which will obviate this function
function getRepresentativeGiftRule(
  items: Iterable<Item>,
  cleanupRules: ReadonlyCleanupRules
) {
  for (const key of items) {
    const rule = cleanupRules.get(key);
    assert.ok(rule, `${key} does not have associated cleanup rule`);
    assert.ok(
      rule.action === 'GIFT',
      `${key} is not associated with a GIFT action (got '${rule.action}')`
    );
    return rule;
  }
  // This should never happen in practice
  assert.fail('No item with GIFT rule found');
}

/**
 * Cleanup action that sends items to other players via Kmail and/or gifts.
 */
export const cleanupSendGifts: CleanupActionFunction = (plan, config) => {
  let shouldReplan = false;
  let profit = 0;

  for (const [recipent, items] of plan.gift) {
    const result = cleanupSimple({
      items,
      config,
      commandPrefix: `send gift to ${recipent}:`,
      process: items => {
        const giftRule = getRepresentativeGiftRule(
          items.keys(),
          plan.cleanupRules
        );
        sendToPlayer({
          recipent: giftRule.recipent,
          message: giftRule.message,
          items,
          insideNote: giftRule.message,
        });
      },
      shouldReplan: false,
    });
    shouldReplan ||= result.shouldReplan;
    profit += result.profit;
  }

  return {shouldReplan, profit};
};
