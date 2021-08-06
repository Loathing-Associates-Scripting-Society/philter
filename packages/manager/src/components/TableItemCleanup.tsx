import {
  Button,
  ButtonGroup,
  Classes,
  ControlGroup,
  InputGroup,
  UL,
} from '@blueprintjs/core';
import {Classes as Popover2Classes, Popover2} from '@blueprintjs/popover2';
import {
  CleanupRule,
  CleanupRuleset,
  ItemInfo,
  ReadonlyCleanupRuleset,
  ReadonlyInventoryState,
} from '@philter/common';
import classNames from 'classnames';
import React, {memo, useCallback, useMemo, useState} from 'react';
import {AutoSizer, Column, Table} from 'react-virtualized';
import {CleanupRulePicker} from './CleanupRulePicker';
import {NumericInputLite} from './NumericInputLite';
import './TableItemCleanup.css';

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

/**
 * Tag for items whose mall price is at minimum value.
 *
 * This is a lightweight replica of Blueprint.js's `<Tag>` component.
 */
const MinMallPriceTag = () => (
  <span
    className={classNames(
      Classes.TAG,
      Classes.MINIMAL,
      Classes.INTENT_PRIMARY,
      'TableItemCleanup__ColumnMallPrice--minimum'
    )}
    title="Is at minimum mall price"
  >
    min
  </span>
);

export type RuleChangeHandler = (
  itemId: number,
  newRuleOrReducer: React.SetStateAction<CleanupRule | null>
) => void;

// eslint-disable-next-line prefer-arrow-callback
const CellItemName = memo(function CellItemName({
  inventory,
  item,
}: {
  inventory: ReadonlyInventoryState;
  item: Readonly<ItemInfo>;
}) {
  return (
    <>
      <a
        className={classNames(
          Classes.BUTTON,
          Classes.MINIMAL,
          'TableItemCleanup__ItemImageLink'
        )}
        onClick={() => itemDescriptionPopup(item.descid)}
        tabIndex={0}
        title="View item description"
      >
        <img
          className="TableItemCleanup__ItemImage"
          alt={item.name}
          src={`/images/itemimages/${item.image}`}
        />
      </a>
      <a
        className={classNames(
          Classes.BUTTON,
          Classes.MINIMAL,
          'TableItemCleanup__ItemNameLink'
        )}
        href={`https://kol.coldfront.net/thekolwiki/index.php/Special:Search?search=${item.name}&go=Go`}
        rel="noopener noreferrer"
        target="_blank"
        tabIndex={0}
        title="Visit KoL wiki page"
      >
        <span dangerouslySetInnerHTML={{__html: item.name}}></span>
        {inventory.inventory[item.id] > 0 && (
          <>
            {' '}
            <i>({inventory.inventory[item.id]})</i>
          </>
        )}
      </a>
    </>
  );
});

// eslint-disable-next-line prefer-arrow-callback
const CellMallPrice = memo(function CellMallPrice({
  item,
}: {
  item: Readonly<ItemInfo>;
}) {
  return (
    <>
      {item.mallPrice && addZwspAfterComma(item.mallPrice.toLocaleString())}
      {item.mallPrice !== null && item.isMallPriceAtMinimum && (
        <MinMallPriceTag />
      )}
    </>
  );
});

// eslint-disable-next-line prefer-arrow-callback
const CellKeepAmount = memo(function CellKeepAmount({
  item,
  onRuleChange,
  rule,
}: {
  item: Readonly<ItemInfo>;
  onRuleChange: RuleChangeHandler;
  rule: Readonly<CleanupRule> | undefined;
}) {
  return (
    <NumericInputLite
      className="TableItemCleanup__InputKeepAmount"
      disabled={!rule || rule.action === 'KEEP'}
      fill
      min={0}
      onChange={event => {
        const value = Number(event.target.value);
        if (Number.isInteger(value)) {
          onRuleChange(item.id, rule => rule && {...rule, keepAmount: value});
        }
      }}
      value={rule?.keepAmount || 0}
    />
  );
});

// eslint-disable-next-line prefer-arrow-callback
const CellItemAction = memo(function CellItemAction({
  item,
  onRuleChange,
  rule,
}: {
  item: Readonly<ItemInfo>;
  onRuleChange: RuleChangeHandler;
  rule: Readonly<CleanupRule> | undefined;
}) {
  return (
    <CleanupRulePicker
      item={item}
      onChange={newRuleOrReducer => onRuleChange(item.id, newRuleOrReducer)}
      rule={rule || null}
    />
  );
});

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
    Omit<React.ComponentProps<'section'>, keyof TableItemCleanupPropsBase> {}

// eslint-disable-next-line prefer-arrow-callback
export const TableItemCleanup = memo(function TableItemCleanup({
  // className is already provided by React.ComponentProps<'section'>
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

  // Filtering
  const [filterText, setFilterText] = useState('');
  const filteredItems = useMemo(() => {
    if (!filterText) return items;
    const filterTextLower = filterText.trim().toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(filterTextLower)
    );
  }, [filterText, items]);

  const rowGetter = useCallback(
    ({index}: {index: number}) => filteredItems[index],
    [filteredItems]
  );

  const rowClassNameGetter = useCallback(
    ({index}: {index: number}) =>
      index === -1 ? 'TableItemCleanup__HeaderRow' : 'TableItemCleanup__Row',
    []
  );

  /* eslint-disable react/jsx-key */
  const columns = useMemo(
    () => [
      <Column
        cellRenderer={({rowData: item}: {rowData: Readonly<ItemInfo>}) => (
          <CellItemName inventory={inventory} item={item} />
        )}
        className="TableItemCleanup__Cell TableItemCleanup__ColumnItemName"
        dataKey="nameAndImage"
        flexGrow={5}
        flexShrink={0}
        label="Item (Amount)"
        width={200}
      />,
      <Column
        cellDataGetter={({rowData: item}: {rowData: Readonly<ItemInfo>}) =>
          inventory.closet[item.id] || 0
        }
        className="TableItemCleanup__Cell TableItemCleanup__ColumnClosetAmount"
        dataKey="closetAmount"
        flexShrink={0}
        label={<abbr title="Amount in Closet">C</abbr>}
        width={35}
      />,
      <Column
        cellDataGetter={({rowData: item}: {rowData: Readonly<ItemInfo>}) =>
          inventory.storage[item.id] || 0
        }
        className="TableItemCleanup__Cell TableItemCleanup__ColumnStorageAmount"
        dataKey="storageAmount"
        flexShrink={0}
        label={<abbr title="Amount in Storage">S</abbr>}
        width={35}
      />,
      <Column
        cellDataGetter={({rowData: item}: {rowData: Readonly<ItemInfo>}) =>
          inventory.displayCase[item.id] || 0
        }
        className="TableItemCleanup__Cell TableItemCleanup__ColumnDisplayCaseAmount"
        dataKey="displayCaseAmount"
        flexShrink={0}
        label={<abbr title="Amount in Display Case">D</abbr>}
        width={35}
      />,
      <Column
        cellRenderer={({rowData: item}: {rowData: Readonly<ItemInfo>}) => (
          <CellMallPrice item={item} />
        )}
        className="TableItemCleanup__Cell TableItemCleanup__ColumnMallPrice"
        dataKey="mallPrice"
        flexGrow={1}
        flexShrink={0}
        label={<abbr title="5th lowest mall price">Price</abbr>}
        width={80}
      />,
      <Column
        cellRenderer={({rowData: item}: {rowData: Readonly<ItemInfo>}) => (
          <CellKeepAmount
            item={item}
            onRuleChange={onRuleChange || defaultRuleChangeHandler}
            rule={cleanupRules[item.id]}
          />
        )}
        className="TableItemCleanup__Cell TableItemCleanup__ColumnKeepAmount"
        dataKey="keepAmount"
        flexShrink={0}
        label="Keep"
        width={70}
      />,
      <Column
        cellRenderer={({rowData: item}: {rowData: Readonly<ItemInfo>}) => (
          <CellItemAction
            item={item}
            onRuleChange={onRuleChange || defaultRuleChangeHandler}
            rule={cleanupRules[item.id]}
          />
        )}
        className="TableItemCleanup__Cell TableItemCleanup__ColumnAction"
        dataKey="action"
        flexGrow={1}
        flexShrink={0}
        label="Action"
        width={440}
      />,
    ],
    [cleanupRules, defaultRuleChangeHandler, inventory, onRuleChange]
  );
  /* eslint-enable react/jsx-key */

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

  return (
    <section
      className={classNames('TableItemCleanup', className)}
      {...restProps}
    >
      <header className="TableItemCleanup__HeaderMenu">
        {editorButtons}
        <ControlGroup className="TableItemCleanup__ItemFilterControl">
          <div>Filter by:</div>
          <InputGroup
            onChange={useCallback(
              (event: React.ChangeEvent<HTMLInputElement>) =>
                setFilterText(event.target.value),
              []
            )}
            placeholder="Enter item name..."
            value={filterText}
          />
          <div className="TableItemCleanup__ItemFilterBarHelperText">
            {filterText &&
              `${filteredItems.length} / ${items.length} match${
                filteredItems.length > 1 ? 'es' : ''
              }`}
          </div>
        </ControlGroup>
      </header>
      <div className="TableItemCleanup__TableWrapper">
        <AutoSizer>
          {({height: measuredHeight, width: measuredWidth}) => (
            <Table
              gridClassName="TableItemCleanup__Inner"
              headerClassName="TableItemCleanup__HeaderCell"
              headerHeight={30}
              height={measuredHeight}
              rowClassName={rowClassNameGetter}
              rowCount={filteredItems.length}
              rowGetter={rowGetter}
              rowHeight={60}
              width={measuredWidth}
            >
              {columns}
            </Table>
          )}
        </AutoSizer>
      </div>
      <footer className="TableItemCleanup__FooterMenu">{editorButtons}</footer>
    </section>
  );
});
