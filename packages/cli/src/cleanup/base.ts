import {PhilterConfig} from '@philter/common';
import {logger} from '@philter/common/kol';
import {batchClose, batchOpen, itemAmount} from 'kolmafia';
import {assert} from 'kolmafia-util';
import {CleanupPlan} from '../planner';
import {grouper, splitItemsSorted} from '../util';

/** Represents the outcome of a cleanup action function. */
export interface CleanupActionResult {
  /**
   * Whether the cleanup plan should be regenerated (i.e. the current execution
   * plan has become stale), usually because the current action function created
   * more items, or consumed items not assigned to its action.
   */
  shouldReplan: boolean;
  /**
   * (Expected) meat gain from executing the action. The action function should
   * return the expected value when running in simulation mode.
   */
  profit: number;
}

/** Represents a function that cleans up all items for a single action. */
export type CleanupActionFunction = (
  plan: Readonly<CleanupPlan>,
  config: Readonly<PhilterConfig>
) => CleanupActionResult;

/** Item data format that can be accepted by `cleanupSimple()`. */
type ItemData = number | {amount: number};

interface CleanupExecuteOptions<T extends ItemData> {
  /**
   * Map whose keys are items to process, and values are the data associated
   * with each item (usually the amount to process)
   */
  items: ReadonlyMap<Item, T>;
  /** Configuration object */
  config: Readonly<PhilterConfig>;
  /**
   * Prefix to use when printing the command for each line
   * (no need to insert a space character at the end)
   */
  commandPrefix: string;
  /**
   * If provided, a callback function that returns the suffix to use for each
   * item.
   */
  commandItemSuffix?: (item: Item, data: T) => string;
  /**
   * Callback used to process the items. The argument is a Map containing the
   * same keys and values as `items`, sorted by the item name.
   * (not called if running in simulation mode)
   */
  process: (sortedItems: Map<Item, T>) => void;
  /**
   * Value of `shouldReplan` to return when at least one item is processed.
   *
   * If `items` is empty, this value is ignored and the function always uses
   * `false`.
   */
  shouldReplan: boolean;
}

/**
 * Executes a simple cleanup operation on `items`.
 * This assumes that the entire operation does not generate meat.
 * @return Cleanup action result whose `profit` is always 0
 */
export function cleanupSimple<T extends ItemData>({
  items,
  config,
  commandPrefix,
  commandItemSuffix,
  process,
  shouldReplan,
}: CleanupExecuteOptions<T>): CleanupActionResult {
  if (items.size === 0) return {shouldReplan: false, profit: 0};

  const sortedItems = new Map(
    Array.from(items).sort(([itemA], [itemB]) =>
      itemA.name.localeCompare(itemB.name)
    )
  );

  // TODO: Move this check to planning stage
  // (this should be checked only for the 'USE' action)
  if (itemAmount(Item.get("bitchin' meatcar")) === 0) {
    sortedItems.delete(Item.get('Degrassi Knoll shopping list'));
  }

  for (const chunk of grouper(sortedItems, 11)) {
    const messages: string[] = [];
    for (const [item, data] of chunk) {
      const amount = typeof data === 'number' ? data : data.amount;
      const itemSuffix = commandItemSuffix
        ? ` ${commandItemSuffix(item, data)}`
        : '';
      messages.push(`${amount} ${item}${itemSuffix}`);
    }
    logger.info(`${commandPrefix} ${messages.join(', ')}`);
    logger.info(' ');
  }

  if (!config.simulateOnly) {
    process(sortedItems);
  }
  return {shouldReplan, profit: 0};
}

interface CleanupBatchExecuteOptions
  extends Omit<CleanupExecuteOptions<number>, 'process'> {
  /**
   * Callback that processes a chunk of items. This will be called once for each
   * chunk. Each invocation of `process()` is preceded by `batchOpen()` and
   * followed by `batchClose()`.
   * (not called if running in simulation mode)
   */
  process: (chunk: Map<Item, number>) => void;
  /** Called when `batchClose()` fails, must throw an exception */
  onBatchError: (chunk: Map<Item, number>) => never;
}

/**
 * Executes a batch cleanup operation on `items`.
 *
 * This assumes that the entire operation does not generate meat.
 * @return Cleanup action result whose `profit` is always 0
 */
export function cleanupBatchExecute({
  items,
  config,
  commandPrefix,
  process,
  onBatchError,
  shouldReplan: valueOnSuccess,
}: CleanupBatchExecuteOptions) {
  return cleanupSimple({
    items,
    config,
    commandPrefix,
    process: items => safeBatchItems(items, process, onBatchError),
    shouldReplan: valueOnSuccess,
  });
}

/**
 * Splits `items` into large chunks and processes each item with `process()`.
 * This calls `batchOpen()` and `batchClose()` to batch process each chunk.
 * @param item Items to split
 * @param process Callback that processes a chunk of items. This will be called
 *    once for each chunk. Each invocation of `process()` is preceded by
 *    `batchOpen()` and followed by `batchClose()`.
 * @param onBatchError Callback to run if `batchClose()` fails, must throw an
 *    exception
 */
export function safeBatchItems<T>(
  items: ReadonlyMap<Item, T>,
  process: (chunk: Map<Item, T>) => void,
  onBatchError: (chunk: Map<Item, T>) => never
): void {
  // If there are too many items batched, KoLmafia may run out of memory.
  // On poor systems, this usually happens around 20 transfers.
  // We choose a safe number of 15.
  // TODO: Investigate if this still happens
  for (const chunk of splitItemsSorted(items, 15 * 11)) {
    batchOpen();
    process(chunk);
    if (!batchClose()) {
      onBatchError(chunk);
      // @ts-expect-error Fallback in case onBatchError() does not throw
      assert.fail(
        'batchClose() failed, but onBatchError() did not throw an exception'
      );
    }
  }
}
