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
  OcdItem,
  OcdRule,
  OcdRuleset,
  ReadonlyInventoryState,
  ReadonlyOcdRuleset,
} from '@philter/common';
import classNames from 'classnames';
import React, {memo, useCallback, useEffect, useMemo, useRef} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {areEqual, FixedSizeList} from 'react-window';
import './OcdItemTable.css';
import {OcdRulePicker} from './OcdRulePicker';

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
  newRuleOrReducer: React.SetStateAction<OcdRule | null>
) => void;

interface OcdItemTableRowProps extends React.ComponentProps<'div'> {
  inventory: ReadonlyInventoryState;
  item: Readonly<OcdItem>;
  onRuleChange: RuleChangeHandler;
  rule: Readonly<OcdRule | null>;
}

/**
 * Row component for `<OcdItemTable/>`.
 */
// eslint-disable-next-line prefer-arrow-callback
const OcdItemTableRow = memo(function OcdItemTableRow({
  className,
  inventory,
  item,
  onRuleChange,
  rule,
  ...restProps
}: OcdItemTableRowProps) {
  return (
    <div className={`OcdItemTable__Row ${className || ''}`} {...restProps}>
      <div className="OcdItemTable__Cell OcdItemTable__ColumnItemName">
        <AnchorButton
          className="OcdItemTable__ItemImageLink"
          minimal
          onClick={useCallback(() => itemDescriptionPopup(item.descid), [
            item.descid,
          ])}
          title="View item description"
        >
          {useMemo(
            () => (
              <img
                className="OcdItemTable__ItemImage"
                alt={item.name}
                src={`/images/itemimages/${item.image}`}
              />
            ),
            [item]
          )}
        </AnchorButton>
        <AnchorButton
          className="OcdItemTable__ItemNameLink"
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
      <div className="OcdItemTable__Cell OcdItemTable__ColumnClosetAmount">
        {inventory.closet[item.id] || 0}
      </div>
      <div className="OcdItemTable__Cell OcdItemTable__ColumnStorageAmount">
        {inventory.storage[item.id] || 0}
      </div>
      <div className="OcdItemTable__Cell OcdItemTable__ColumnDisplayCaseAmount">
        {inventory.displayCase[item.id] || 0}
      </div>
      <div className="OcdItemTable__Cell OcdItemTable__ColumnMallPrice">
        {item.mallPrice && addZwspAfterComma(item.mallPrice.toLocaleString())}
        {item.mallPrice !== null && item.isMallPriceAtMinimum && (
          <Tag
            className="OcdItemTable__ColumnMallPrice--minimum"
            htmlTitle="Is at minimum mall price"
            intent="primary"
            minimal
          >
            min
          </Tag>
        )}
      </div>
      <div className="OcdItemTable__Cell OcdItemTable__ColumnKeepAmount">
        <NumericInput
          className="OcdItemTable__InputKeepAmount"
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
      <div className="OcdItemTable__Cell OcdItemTable__ColumnAction">
        <OcdRulePicker
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

interface OcdItemTableRowData {
  inventory: ReadonlyInventoryState;
  items: readonly Readonly<OcdItem>[];
  ocdRules: ReadonlyOcdRuleset;
  onRuleChange: RuleChangeHandler;
}

interface OcdItemTablePropsBase {
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
  items: readonly Readonly<OcdItem>[];
  /**
   * OCD cleanup ruleset.
   * If an item in `items` does not have a rule here, a default rule ("UNKN") is
   * used.
   */
  ocdRules: ReadonlyOcdRuleset;
  /**
   * Callback that is called when an OCD rule is modified.
   * The argument is a function that takes the previous OCD ruleset as argument
   * and returns a new OCD ruleset (Think `setState()` with updater callbacks).
   *
   * This implementation is necessary to prevent the entire table from being
   * re-rendered (causing lag) on every input change.
   */
  onChange?: (updater: (prevOcdRules: OcdRuleset) => OcdRuleset) => void;
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

interface OcdItemTableProps
  extends OcdItemTablePropsBase,
    Omit<React.ComponentProps<'div'>, keyof OcdItemTablePropsBase> {}

// eslint-disable-next-line prefer-arrow-callback
export const OcdItemTable = memo(function OcdItemTable({
  // className is already provided by React.ComponentProps<'div'>
  // eslint-disable-next-line react/prop-types
  className,
  disableReset,
  disableSave,
  inventory,
  items,
  ocdRules,
  onChange,
  onRuleChange,
  onReset,
  onSave,
  ...restProps
}: OcdItemTableProps) {
  const defaultRuleChangeHandler = useCallback(
    (itemId: number, newRuleOrReducer: React.SetStateAction<OcdRule | null>) =>
      onChange?.(prevOcdRules => {
        const newRule =
          typeof newRuleOrReducer === 'function'
            ? newRuleOrReducer(prevOcdRules[itemId] || null)
            : newRuleOrReducer;
        if (newRule) return {...prevOcdRules, [itemId]: newRule};
        else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const {[itemId]: _removed, ...restOcdRules} = prevOcdRules;
          return restOcdRules;
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

  const itemData = useMemo<OcdItemTableRowData>(
    () => ({
      inventory,
      items,
      ocdRules,
      onRuleChange: onRuleChange || defaultRuleChangeHandler,
    }),
    [defaultRuleChangeHandler, inventory, items, ocdRules, onRuleChange]
  );
  const itemKeyCallback = useCallback(
    (index: number, data: OcdItemTableRowData) => data.items[index].id,
    []
  );

  const editorButtons = useMemo(
    () => (
      <ButtonGroup className="OcdItemTable__EditorButtons">
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
          className="OcdItemTable__PopperFix"
          popoverClassName={Popover2Classes.POPOVER2_CONTENT_SIZING}
          content={
            <p>
              Select an action for each item. These actions will tell
              OCD-Cleanup how to process each item:
              <UL>
                <li>
                  OCD-Cleanup will warn you about uncategorized items, but will
                  not touch them.
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
  // Since the data prop changes whenever the OCD ruleset is modified, this
  // component itself does not benefit from `React.memo()`. However, the
  // underlying component _does_ benefit from `React.memo()`.
  // eslint-disable-next-line prefer-arrow-callback
  const OcdItemTableRowWrapper = useCallback(function OcdItemTableRowWrapper({
    data: {ocdRules, onRuleChange, inventory, items},
    index,
    style,
    isScrolling = false,
  }: {
    data: OcdItemTableRowData;
    index: number;
    style?: React.CSSProperties;
    isScrolling?: boolean;
  }) {
    isScrollingRef.current = isScrolling;
    return (
      <OcdItemTableRow
        inventory={inventory}
        item={items[index]}
        onRuleChange={onRuleChange}
        rule={ocdRules[items[index].id]}
        style={style}
      />
    );
  },
  []);

  return (
    <div className={classNames('OcdItemTable', className)} {...restProps}>
      {editorButtons}
      <div className="OcdItemTable__TableWrapper">
        <AutoSizer disableWidth>
          {({height: measuredHeight}) => (
            <div
              className="OcdItemTable__Inner"
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
              <div className="OcdItemTable__HeaderRow">
                <div className="OcdItemTable__HeaderCell OcdItemTable__ColumnItemName">
                  Item (Amount)
                </div>
                <div className="OcdItemTable__HeaderCell OcdItemTable__ColumnClosetAmount">
                  <abbr title="Amount in Closet">C</abbr>
                </div>
                <div className="OcdItemTable__HeaderCell OcdItemTable__ColumnStorageAmount">
                  <abbr title="Amount in Storage">S</abbr>
                </div>
                <div className="OcdItemTable__HeaderCell OcdItemTable__ColumnDisplayCaseAmount">
                  <abbr title="Amount in Display Case">D</abbr>
                </div>
                <div className="OcdItemTable__HeaderCell OcdItemTable__ColumnMallPrice">
                  <abbr title="5th lowest mall price">Price</abbr>
                </div>
                <div className="OcdItemTable__HeaderCell OcdItemTable__ColumnKeepAmount">
                  Keep
                </div>
                <div className="OcdItemTable__HeaderCell OcdItemTable__ColumnAction">
                  Action
                </div>
              </div>
              <FixedSizeList
                className="OcdItemTable__Body"
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
                {OcdItemTableRowWrapper}
              </FixedSizeList>
            </div>
          )}
        </AutoSizer>
      </div>
      {editorButtons}
    </div>
  );
});
