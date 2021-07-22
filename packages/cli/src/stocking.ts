import {
  logger,
  ReadonlyCleanupRules,
  ReadonlyStockingRules,
} from '@philter/common/kol';
import {
  availableAmount,
  batchClose,
  batchOpen,
  cliExecute,
  closetAmount,
  equippedAmount,
  itemAmount,
  putCloset,
  retrieveItem,
  storageAmount,
  toSlot,
} from 'kolmafia';
import {assert} from 'kolmafia-util';
import {fullAmount} from './util';

const TEN_LEAF_CLOVER = Item.get('ten-leaf clover');
const DISASSEMBLED_CLOVER = Item.get('disassembled clover');

// This is only called if the player has both kinds of clovers, so no need to check if stock contains both
function cloversNeeded(stockingRules: ReadonlyStockingRules) {
  return (
    (stockingRules.get(TEN_LEAF_CLOVER)?.amount || 0) +
    (stockingRules.get(DISASSEMBLED_CLOVER)?.amount || 0) -
    fullAmount(TEN_LEAF_CLOVER) -
    fullAmount(DISASSEMBLED_CLOVER)
  );
}

/**
 * Returns the alternate form of a ten-leaf clover or disassembled clover.
 * @param it ten-leaf clover or disassembled clover
 * @return
 */
function otherClover(it: Item) {
  return it === TEN_LEAF_CLOVER ? DISASSEMBLED_CLOVER : TEN_LEAF_CLOVER;
}

class Stocker {
  isFirst = true;

  stockit(q: number, it: Item): boolean {
    q = q - closetAmount(it) - storageAmount(it) - equippedAmount(it);
    if (q < 1) return true;
    if (this.isFirst) {
      logger.info('Stocking up on required items!');
      this.isFirst = false;
    }
    return retrieveItem(q, it);
  }
}

/**
 * Stocks up on items based on the stock rules.
 * @param stockingRules Stocking ruleset to use
 * @param cleanupRules Cleanup ruleset to use
 * @return Whether all items were stocked successfully
 */
export function stock(
  stockingRules: ReadonlyStockingRules,
  cleanupRules: ReadonlyCleanupRules
): boolean {
  let success = true;
  const stocker = new Stocker();

  batchOpen();
  for (const [item, stockingRule] of stockingRules) {
    // Someone might want both assembled and disassembled clovers. Esure there are enough of combined tot
    if (
      (TEN_LEAF_CLOVER === item || DISASSEMBLED_CLOVER === item) &&
      stockingRules.has(otherClover(item))
    ) {
      const cloversNeededAmount = cloversNeeded(stockingRules);
      if (cloversNeededAmount > 0) {
        // TODO: This seems suspicious, it might be acquiring less clovers than
        // needed. Need to verify
        assert.ok(
          cliExecute(
            `cheapest ten-leaf clover, disassembled clover; acquire ${
              cloversNeededAmount - availableAmount(item)
            } it`
          ),
          'Failed to stock up on clovers'
        );
      }
    }
    if (
      fullAmount(item) < stockingRule.amount &&
      !stocker.stockit(stockingRule.amount, item)
    ) {
      success = false;
      logger.error(
        `Failed to stock ${
          stockingRule.amount > 1
            ? `${stockingRule.amount} ${item.plural}`
            : `a ${item}`
        }`
      );
    }
    // Closet everything (except for gear) that is stocked so it won't get accidentally used.
    const keepAmount = cleanupRules.get(item)?.keepAmount || 0;
    if (
      toSlot(item) === Slot.get('none') &&
      stockingRule.amount - keepAmount > closetAmount(item) &&
      itemAmount(item) > keepAmount
    ) {
      putCloset(
        Math.min(
          itemAmount(item) - keepAmount,
          stockingRule.amount - keepAmount - closetAmount(item)
        ),
        item
      );
    }
  }

  // TODO: batchOpen(), batchClose() may no longer be needed since putCloset()
  // cannot be batched anymore. Need to verify
  assert.ok(batchClose(), 'Failed to transfer items for stocking');
  return success;
}
