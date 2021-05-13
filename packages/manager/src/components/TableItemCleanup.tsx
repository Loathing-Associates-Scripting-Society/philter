import {
  AnchorButton,
  Button,
  ButtonGroup,
  NumericInput,
  Tag,
  UL,
} from '@blueprintjs/core';
import {Classes as Popover2Classes, Popover2} from '@blueprintjs/popover2';
import {
  ItemInfo,
  CleanupRule,
  CleanupRuleset,
  ReadonlyInventoryState,
  ReadonlyCleanupRuleset,
} from '@philter/common';
import classNames from 'classnames';
import React, {memo, useCallback, useEffect, useMemo, useRef} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {areEqual, FixedSizeList} from 'react-window';
import './TableItemCleanup.css';
import {CleanupRulePicker} from './CleanupRulePicker';

/* eslint-disable react/no-unescaped-entities */

/**
 * Adds a zero-width space (ZWSP) after each comma (`,`) in the given string.
 * This allows the `overflow-wrap: break-word` CSS rule to break long numbers
 * across multiple lines.
 */
const addZwspAfterComma = (str: string) => str.replace(/,/g, ',\u200B');

/**
 * Launches the in-game item description page in a popup window.
 * @param descid Item descid
 */
const itemDescriptionPopup = (descid: string) => {
  window
    .open(`/desc_item.php?whichitem=${descid}`, 'name', 'height=200,width=214')
    ?.focus();
};

export type RuleChangeHandler = (
  itemId: number,
  newRuleOrReducer: React.SetStateAction<CleanupRule | null>
) => void;

interface TableItemCleanupRowProps extends React.ComponentProps<'div'> {
  inventory: ReadonlyInventoryState;
  item: Readonly<ItemInfo>;
  onRuleChange: RuleChangeHandler;
  rule: Readonly<CleanupRule | null>;
}

/**
 * Row component for `<TableItemCleanup/>`.
 */
// eslint-disable-next-line prefer-arrow-callback
const TableItemCleanupRow = memo(function TableItemCleanupRow({
  className,
  inventory,
  item,
  onRuleChange,
  rule,
  ...restProps
}: TableItemCleanupRowProps) {
  return (
    <div className={`TableItemCleanup__Row ${className || ''}`} {...restProps}>
      <div className="TableItemCleanup__Cell TableItemCleanup__ColumnItemName">
        <AnchorButton
          className="TableItemCleanup__ItemImageLink"
          minimal
          onClick={useCallback(() => itemDescriptionPopup(item.descid), [
            item.descid,
          ])}
          title="View item description"
        >
          {useMemo(
            () => (
              <img
                className="TableItemCleanup__ItemImage"
                alt={item.name}
                src={`/images/itemimages/${item.image}`}
              />
            ),
            [item]
          )}
        </AnchorButton>
        <AnchorButton
          className="TableItemCleanup__ItemNameLink"
          href={`https://kol.coldfront.net/thekolwiki/index.php/Special:Search?search=${item.name}&go=Go`}
          minimal
          rel="noopener noreferrer"
          target="_blank"
          title="Visit KoL wiki page"
        >
          {useMemo(
            () => (
              <>
                <span dangerouslySetInnerHTML={{__html: item.name}}></span>
                {inventory.inventory[item.id] > 0 && (
                  <>
                    {' '}
                    <i>({inventory.inventory[item.id]})</i>
                  </>
                )}
              </>
            ),
            [inventory, item]
          )}
        </AnchorButton>
      </div>
      <div className="TableItemCleanup__Cell TableItemCleanup__ColumnClosetAmount">
        {inventory.closet[item.id] || 0}
      </div>
      <div className="TableItemCleanup__Cell TableItemCleanup__ColumnStorageAmount">
        {inventory.storage[item.id] || 0}
      </div>
      <div className="TableItemCleanup__Cell TableItemCleanup__ColumnDisplayCaseAmount">
        {inventory.displayCase[item.id] || 0}
      </div>
      <div className="TableItemCleanup__Cell TableItemCleanup__ColumnMallPrice">
        {item.mallPrice && addZwspAfterComma(item.mallPrice.toLocaleString())}
        {item.mallPrice !== null && item.isMallPriceAtMinimum && (
          <Tag
            className="TableItemCleanup__ColumnMallPrice--minimum"
            htmlTitle="Is at minimum mall price"
            intent="primary"
            minimal
          >
            min
          </Tag>
        )}
      </div>
      <div className="TableItemCleanup__Cell TableItemCleanup__ColumnKeepAmount">
        <NumericInput
          className="TableItemCleanup__InputKeepAmount"
          disabled={!rule || rule.action === 'KEEP'}
          fill
          majorStepSize={10}
          min={0}
          minorStepSize={null}
          onValueChange={useCallback(
            (value: number) => {
              if (Number.isInteger(value)) {
                onRuleChange(
                  item.id,
                  rule => rule && {...rule, keepAmount: value}
                );
              }
            },
            [item.id, onRuleChange]
          )}
          stepSize={1}
          value={rule?.keepAmount || 0}
        />
      </div>
      <div className="TableItemCleanup__Cell TableItemCleanup__ColumnAction">
        <CleanupRulePicker
          item={item}
          onChange={useCallback(
            newRuleOrReducer => onRuleChange(item.id, newRuleOrReducer),
            [item.id, onRuleChange]
          )}
          rule={rule}
        />
      </div>
    </div>
  );
},
areEqual);

interface TableItemCleanupRowData {
  inventory: ReadonlyInventoryState;
  items: readonly Readonly<ItemInfo>[];
  cleanupRules: ReadonlyCleanupRuleset;
  onRuleChange: RuleChangeHandler;
}

interface TableItemCleanupPropsBase {
  /**
   * Cleanup ruleset.
   * If an item in `items` does not have a rule here, a default rule ("UNKN") is
   * used.
   */
  cleanupRules: ReadonlyCleanupRuleset;
  /**
   * Whether the Reset button is disabled.
   */
  disableReset?: boolean;
  /**
   * Whether the Save button is disabled.
   */
  disableSave?: boolean;
  /** Inventory state. Used to show item quantities for each row. */
  inventory: ReadonlyInventoryState;
  /** Items to display in the table. */
  items: readonly Readonly<ItemInfo>[];
  /**
   * Callback that is called when a rule is modified.
   * The argument is a function that takes the previous ruleset as argument and
   * returns a new ruleset.
   *
   * This implementation is necessary to prevent the entire table from being
   * re-rendered (causing lag) on every input change.
   */
  onChange?: (
    updater: (prevCleanupRules: CleanupRuleset) => CleanupRuleset
  ) => void;
  /**
   * Called when the user clicks the Reset button.
   */
  onReset?: () => void;
  /**
   * Called when the user edits a rule for an item.
   * If not given, the default implementation calls `onChange` instead.
   */
  onRuleChange?: RuleChangeHandler;
  /**
   * Called when the user clicks the Save button.
   */
  onSave?: () => void;
}

interface TableItemCleanupProps
  extends TableItemCleanupPropsBase,
    Omit<React.ComponentProps<'div'>, keyof TableItemCleanupPropsBase> {}

// eslint-disable-next-line prefer-arrow-callback
export const TableItemCleanup = memo(function TableItemCleanup({
  // className is already provided by React.ComponentProps<'div'>
  // eslint-disable-next-line react/prop-types
  className,
  cleanupRules,
  disableReset,
  disableSave,
  inventory,
  items,
  onChange,
  onReset,
  onRuleChange,
  onSave,
  ...restProps
}: TableItemCleanupProps) {
  const defaultRuleChangeHandler = useCallback(
    (
      itemId: number,
      newRuleOrReducer: React.SetStateAction<CleanupRule | null>
    ) =>
      onChange?.(prevCleanupRules => {
        const newRule =
          typeof newRuleOrReducer === 'function'
            ? newRuleOrReducer(prevCleanupRules[itemId] || null)
            : newRuleOrReducer;
        if (newRule) return {...prevCleanupRules, [itemId]: newRule};
        else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const {[itemId]: _removed, ...restCleanupRules} = prevCleanupRules;
          return restCleanupRules;
        }
      }),
    [onChange]
  );

  // Smooth scrolling (behavior: "smooth") via keyboard is tricky.
  // When the user holds down on the arrow up/down or page up/down keys,
  // onKeyDown() fires way too fast, overloading the browser and causing
  // scrolling to become extremely jittery.
  // I tried multiple ways of debouncing this:
  //
  // 1. Using lodash.throttle()
  //    - Was quite janky and forced me to set unreasonably high throttle
  //      delays, on the order of ~500ms for page up/down. Even then, it was
  //      unreliably janky.
  // 2. Manually debouncing using requestAnimationFrame() or setTimeout()
  //    - This was worse than using lodash.throttle().
  // 3. Using `isScrolling`
  //    - Much more reliable than the above. However, it caused long pauses
  //      between scrolls when the user holds down a scrolling key. Also, it
  //      didn't prevent doScroll() from being called multiple times before the
  //      component registered `isScrolling`.
  //
  // I eventually landed on a combination of (2) and (3) to successfully
  // debounce scrolling. This is still quite slow, but almost jitter-free.

  // Use requestAnimationFrame() and isScrolling to throttle scroll events
  const scrollTimerRef = useRef<number>();
  const isScrollingRef = useRef(false);

  /**
   * Debounced scrolling function
   * @param type
   * @param amount Position for `to`, offset for `by`
   */
  const doScroll = useCallback((type: 'to' | 'by', amount: number) => {
    if (isScrollingRef.current) return;
    if (scrollTimerRef.current !== undefined) return;
    scrollTimerRef.current = window.requestAnimationFrame(() => {
      scrollTimerRef.current = undefined;
      outerListRef.current?.[type === 'by' ? 'scrollBy' : 'scrollTo']({
        behavior: 'smooth',
        top: amount,
      });
    });
  }, []);
  // Cancel any remaining scrolling events if we are unmounting
  useEffect(
    () => () => {
      if (scrollTimerRef.current !== undefined) {
        window.cancelAnimationFrame(scrollTimerRef.current);
      }
    },
    []
  );

  // Manually implement Page Up/Down. Based on:
  // - https://github.com/bvaughn/react-window/issues/46#issuecomment-416073707
  // - https://sung.codes/blog/2019/05/07/scrolling-with-page-up-down-keys-in-react-window/
  const innerListRef = useRef<HTMLElement>(null);
  const outerListRef = useRef<HTMLElement>(null);

  const PAGE_HEIGHT = 600;
  const ROW_HEIGHT = 60;

  const itemData = useMemo<TableItemCleanupRowData>(
    () => ({
      inventory,
      items,
      cleanupRules,
      onRuleChange: onRuleChange || defaultRuleChangeHandler,
    }),
    [defaultRuleChangeHandler, inventory, items, cleanupRules, onRuleChange]
  );
  const itemKeyCallback = useCallback(
    (index: number, data: TableItemCleanupRowData) => data.items[index].id,
    []
  );

  const editorButtons = useMemo(
    () => (
      <ButtonGroup className="TableItemCleanup__EditorButtons">
        <Button
          disabled={disableSave}
          icon="saved"
          onClick={onSave}
          text="Save all"
        />
        <Button
          disabled={disableReset}
          icon="reset"
          onClick={onReset}
          text="Discard changes"
        />
        <Popover2
          className="TableItemCleanup__PopperFix"
          popoverClassName={Popover2Classes.POPOVER2_CONTENT_SIZING}
          content={
            <p>
              Select an action for each item. These actions will tell Philter
              how to process each item:
              <UL>
                <li>
                  Philter will warn you about uncategorized items, but will not
                  touch them.
                </li>
                <li>
                  "Mall sale" will use the lowest mall price <i>at cleanup</i>,
                  but never below the "min price".
                </li>
                <li>"Send as gift" actually uses Kmail, not the gift shop.</li>
                <li>
                  "Crafting" can use up other ingredients needed for the recipe,
                  even if you marked them as "Keep all".
                </li>
                <li>
                  "Pulverize" will send items to Smashbot if you can't use
                  Pulverize or Malus, but only in aftercore.
                </li>
                <li>
                  "Reminder" will show a reminder message during cleanup, but
                  won't touch the item.
                </li>
              </UL>
            </p>
          }
        >
          <Button icon="help" text="Help" />
        </Popover2>
      </ButtonGroup>
    ),
    [disableReset, disableSave, onReset, onSave]
  );

  // This function must be a stable value for React to properly use memoization.
  // Since the data prop changes whenever the cleanup ruleset is modified, this
  // component itself does not benefit from `React.memo()`. However, the
  // underlying component _does_ benefit from `React.memo()`.
  const TableItemCleanupRowWrapper = useCallback(
    // eslint-disable-next-line prefer-arrow-callback
    function TableItemCleanupRowWrapper({
      data: {cleanupRules, onRuleChange, inventory, items},
      index,
      style,
      isScrolling = false,
    }: {
      data: TableItemCleanupRowData;
      index: number;
      style?: React.CSSProperties;
      isScrolling?: boolean;
    }) {
      isScrollingRef.current = isScrolling;
      return (
        <TableItemCleanupRow
          inventory={inventory}
          item={items[index]}
          onRuleChange={onRuleChange}
          rule={cleanupRules[items[index].id]}
          style={style}
        />
      );
    },
    []
  );

  return (
    <div className={classNames('TableItemCleanup', className)} {...restProps}>
      {editorButtons}
      <div className="TableItemCleanup__TableWrapper">
        <AutoSizer disableWidth>
          {({height: measuredHeight}) => (
            <div
              className="TableItemCleanup__Inner"
              onKeyDown={event => {
                if (event.key === 'ArrowDown') {
                  if (event.currentTarget === event.target) {
                    doScroll('by', ROW_HEIGHT * 3);
                  }
                } else if (event.key === 'ArrowUp') {
                  if (event.currentTarget === event.target) {
                    doScroll('by', -ROW_HEIGHT * 3);
                  }
                } else if (event.key === 'PageDown') {
                  doScroll('by', PAGE_HEIGHT);
                } else if (event.key === 'PageUp') {
                  doScroll('by', -PAGE_HEIGHT);
                } else if (event.key === 'Home') {
                  doScroll('to', 0);
                } else if (event.key === 'End') {
                  if (innerListRef.current) {
                    doScroll(
                      'to',
                      parseFloat(innerListRef.current.style.height)
                    );
                  }
                }
              }}
              tabIndex={-1}
            >
              <div className="TableItemCleanup__HeaderRow">
                <div className="TableItemCleanup__HeaderCell TableItemCleanup__ColumnItemName">
                  Item (Amount)
                </div>
                <div className="TableItemCleanup__HeaderCell TableItemCleanup__ColumnClosetAmount">
                  <abbr title="Amount in Closet">C</abbr>
                </div>
                <div className="TableItemCleanup__HeaderCell TableItemCleanup__ColumnStorageAmount">
                  <abbr title="Amount in Storage">S</abbr>
                </div>
                <div className="TableItemCleanup__HeaderCell TableItemCleanup__ColumnDisplayCaseAmount">
                  <abbr title="Amount in Display Case">D</abbr>
                </div>
                <div className="TableItemCleanup__HeaderCell TableItemCleanup__ColumnMallPrice">
                  <abbr title="5th lowest mall price">Price</abbr>
                </div>
                <div className="TableItemCleanup__HeaderCell TableItemCleanup__ColumnKeepAmount">
                  Keep
                </div>
                <div className="TableItemCleanup__HeaderCell TableItemCleanup__ColumnAction">
                  Action
                </div>
              </div>
              <FixedSizeList
                className="TableItemCleanup__Body"
                height={measuredHeight}
                innerRef={innerListRef}
                itemCount={items.length}
                itemData={itemData}
                itemKey={itemKeyCallback}
                itemSize={ROW_HEIGHT}
                outerRef={outerListRef}
                overscanCount={15}
                useIsScrolling
                width="100%"
              >
                {TableItemCleanupRowWrapper}
              </FixedSizeList>
            </div>
          )}
        </AutoSizer>
      </div>
      {editorButtons}
    </div>
  );
});
