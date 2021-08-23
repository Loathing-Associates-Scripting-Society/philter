import {
  Button,
  ButtonGroup,
  Classes,
  Colors,
  ControlGroup,
  Icon,
  IconName,
  InputGroup,
  Intent,
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
import {
  AutoSizer,
  Column,
  SortDirection,
  SortDirectionType,
  Table,
  TableHeaderRenderer,
} from 'react-virtualized';
import {CleanupRulePicker} from './CleanupRulePicker';
import {NumericInputLite} from './NumericInputLite';
import './TableItemCleanup.css';

/* eslint-disable react/no-unescaped-entities */

/** Name keys of sortable columns in `<TableItemCleanup/>`. */
const enum SortableColumnKey {
  ITEM_NAME = 'ITEM_NAME',
  INVENTORY_AMOUNT = 'INVENTORY_AMOUNT',
  CLOSET_AMOUNT = 'CLOSET_AMOUNT',
  STORAGE_AMOUNT = 'STORAGE_AMOUNT',
  DISPLAY_CASE_AMOUNT = 'DISPLAY_CASE_AMOUNT',
  MALL_PRICE = 'MALL_PRICE',
}

/** Assertion function for checking the exhaustiveness of switch statements. */
const assertInvalidSortableColumnKey = (key: never) => {
  throw new Error(`${key} is not a key for a sortable column`);
};

/**
 * Sorts an array of `ItemInfo` objects in-place for the given column key.
 * @param items Array of items
 * @param inventory Current inventory state
 * @param dataKey Column key
 * @return Sorted array of items
 */
const sortItemsByColumn = (
  items: Readonly<ItemInfo>[],
  inventory: ReadonlyInventoryState,
  dataKey: SortableColumnKey
) => {
  switch (dataKey) {
    case SortableColumnKey.ITEM_NAME:
      return items.sort((itemA, itemB) => itemA.name.localeCompare(itemB.name));
    case SortableColumnKey.INVENTORY_AMOUNT:
      return items.sort(
        (itemA, itemB) =>
          (inventory.inventory[itemA.id] || 0) -
          (inventory.inventory[itemB.id] || 0)
      );
    case SortableColumnKey.CLOSET_AMOUNT:
      return items.sort(
        (itemA, itemB) =>
          (inventory.closet[itemA.id] || 0) - (inventory.closet[itemB.id] || 0)
      );
    case SortableColumnKey.STORAGE_AMOUNT:
      return items.sort(
        (itemA, itemB) =>
          (inventory.storage[itemA.id] || 0) -
          (inventory.storage[itemB.id] || 0)
      );
    case SortableColumnKey.DISPLAY_CASE_AMOUNT:
      return items.sort(
        (itemA, itemB) =>
          (inventory.displayCase[itemA.id] || 0) -
          (inventory.displayCase[itemB.id] || 0)
      );
    case SortableColumnKey.MALL_PRICE:
      return items.sort(
        (itemA, itemB) => (itemA.mallPrice || 0) - (itemB.mallPrice || 0)
      );
    default:
      assertInvalidSortableColumnKey(dataKey);
  }
};

interface SortState {
  sortBy: SortableColumnKey | undefined;
  sortDirection: SortDirectionType;
}

/**
 * @param prevState Previous sort state
 * @return State reducer for `SortState`
 */
const makeSortStateReducer =
  (activatedColumnKey: SortableColumnKey) =>
  (prevState: SortState): SortState => {
    // Was either unsorted, or was sorted by another column
    if (!prevState.sortBy || prevState.sortBy !== activatedColumnKey) {
      return {sortBy: activatedColumnKey, sortDirection: SortDirection.ASC};
    }

    // User re-seleced a column that is already active
    // Cycle between ASC -> DESC -> (unsorted)
    return prevState.sortDirection === SortDirection.ASC
      ? {sortBy: prevState.sortBy, sortDirection: SortDirection.DESC}
      : {sortBy: undefined, sortDirection: SortDirection.ASC};
  };

/** Custom hook for managing the sort state of `<TableItemCleanup/>` */
const useSortState = () => {
  const [sortState, setSortState] = useState<SortState>({
    sortBy: undefined,
    sortDirection: SortDirection.ASC,
  });

  return {
    ...sortState,
    updateSortState: useCallback(
      ({sortBy}: {sortBy: string}) =>
        setSortState(makeSortStateReducer(sortBy as SortableColumnKey)),
      []
    ),
  };
};

/**
 * Returns the names of sorting indicator icons to be used for each sortable column.
 * @param dataKey Name keys of sortable columns
 * @return Object with two properties, `asc` and `desc`, which specify icon
 *    names to use for the column associated with the `key`
 */
const getSortingIconNames = (
  dataKey: SortableColumnKey
): {
  /** Icon to use if the column is sorted in ascending order */
  asc: IconName;
  /** Icon to use if the column is sorted in descending order */
  desc: IconName;
} => {
  switch (dataKey) {
    case SortableColumnKey.ITEM_NAME:
      return {asc: 'sort-alphabetical', desc: 'sort-alphabetical-desc'};
    case SortableColumnKey.INVENTORY_AMOUNT:
    case SortableColumnKey.CLOSET_AMOUNT:
    case SortableColumnKey.STORAGE_AMOUNT:
    case SortableColumnKey.DISPLAY_CASE_AMOUNT:
    case SortableColumnKey.MALL_PRICE:
      return {asc: 'sort-numerical', desc: 'sort-numerical-desc'};
  }
  assertInvalidSortableColumnKey(dataKey);
};

const sortableHeaderRenderer: TableHeaderRenderer = ({
  dataKey,
  disableSort,
  label,
  sortBy,
  sortDirection,
}) => {
  const labelNode = (
    <span className="TableItemCleanup__HeaderCellLabel">{label}</span>
  );
  if (disableSort) return labelNode;

  let iconType: IconName;
  let iconIntent: Intent | undefined;
  let iconColor;
  if (sortBy === dataKey) {
    iconIntent = 'primary';
    iconType = getSortingIconNames(dataKey as SortableColumnKey)[
      sortDirection === SortDirection.ASC ? 'asc' : 'desc'
    ];
  } else {
    iconColor = Colors.GRAY4;
    iconType = 'double-caret-vertical';
  }

  return (
    <>
      {labelNode}
      <Icon color={iconColor} icon={iconType} intent={iconIntent} />
    </>
  );
};

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
  item,
}: {
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
        dangerouslySetInnerHTML={{__html: item.name}}
        href={`https://kol.coldfront.net/thekolwiki/index.php/Special:Search?search=${item.name}&go=Go`}
        rel="noopener noreferrer"
        target="_blank"
        tabIndex={0}
        title="Visit KoL wiki page"
      ></a>
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
  const handleRuleChange = onRuleChange || defaultRuleChangeHandler;

  // Sorting and filtering
  const {sortBy, sortDirection, updateSortState} = useSortState();

  const [filterText, setFilterText] = useState('');
  const finalItems = useMemo(() => {
    let finalItems;

    // Filter first, sort later. Since our filter code is simple, this is likely
    // faster than the other way around.
    if (filterText) {
      const filterTextLower = filterText.trim().toLowerCase();
      finalItems = items.filter(item =>
        item.name.toLowerCase().includes(filterTextLower)
      );
    } else {
      finalItems = [...items];
    }

    if (sortBy) {
      sortItemsByColumn(finalItems, inventory, sortBy);
      if (sortDirection === SortDirection.DESC) {
        finalItems.reverse();
      }
    }

    return finalItems;
  }, [filterText, inventory, items, sortBy, sortDirection]);

  const rowGetter = useCallback(
    ({index}: {index: number}) => finalItems[index],
    [finalItems]
  );

  const rowClassNameGetter = useCallback(
    ({index}: {index: number}) =>
      index === -1 ? 'TableItemCleanup__HeaderRow' : 'TableItemCleanup__Row',
    []
  );

  /** Helper function for making `<Column/>` elements. */
  const makeColumn = useCallback(
    ({
      className,
      getData,
      renderCell,
      ...restProps
    }: Omit<
      React.ComponentProps<typeof Column>,
      'cellDataGetter' | 'cellRenderer' | 'flexShrink'
    > & {
      /** Optional callback to be used by the `cellDataGetter` */
      getData?: (item: Readonly<ItemInfo>) => number;
      /** Optional callback to be used by the `cellRenderer` */
      renderCell?: (item: Readonly<ItemInfo>) => React.ReactNode;
    }) => (
      <Column
        cellDataGetter={getData && (props => getData(props.rowData))}
        cellRenderer={renderCell && (props => renderCell(props.rowData))}
        className={classNames('TableItemCleanup__Cell', className)}
        flexShrink={0}
        {...restProps}
      />
    ),
    []
  );

  /** Helper function for making sortable `<Column/>` elements. */
  const makeSortableColumn = useCallback(
    ({
      className,
      ...restProps
    }: Omit<Parameters<typeof makeColumn>[0], 'headerRenderer'>) =>
      makeColumn({
        className: classNames(
          sortBy === restProps.dataKey && 'TableItemCleanup__Cell--Sorted',
          className
        ),
        headerRenderer: sortableHeaderRenderer,
        ...restProps,
      }),
    [makeColumn, sortBy]
  );

  const columns = useMemo(
    () => [
      makeSortableColumn({
        className: 'TableItemCleanup__ColumnItemName',
        dataKey: SortableColumnKey.ITEM_NAME,
        flexGrow: 5,
        label: 'Item',
        // eslint-disable-next-line react/display-name
        renderCell: item => <CellItemName item={item} />,
        width: 200,
      }),
      makeSortableColumn({
        className: 'TableItemCleanup__ColumnInventoryAmount',
        dataKey: SortableColumnKey.INVENTORY_AMOUNT,
        getData: item => inventory.inventory[item.id] || 0,
        label: <abbr title="Amount in Inventory">I</abbr>,
        width: 40,
      }),
      makeSortableColumn({
        className: 'TableItemCleanup__ColumnClosetAmount',
        dataKey: SortableColumnKey.CLOSET_AMOUNT,
        getData: item => inventory.closet[item.id] || 0,
        label: <abbr title="Amount in Closet">C</abbr>,
        width: 40,
      }),
      makeSortableColumn({
        className: 'TableItemCleanup__ColumnStorageAmount',
        dataKey: SortableColumnKey.STORAGE_AMOUNT,
        getData: item => inventory.storage[item.id] || 0,
        label: <abbr title="Amount in Storage">S</abbr>,
        width: 40,
      }),
      makeSortableColumn({
        className: 'TableItemCleanup__ColumnDisplayCaseAmount',
        dataKey: SortableColumnKey.DISPLAY_CASE_AMOUNT,
        getData: item => inventory.displayCase[item.id] || 0,
        label: <abbr title="Amount in Display Case">D</abbr>,
        width: 40,
      }),
      makeSortableColumn({
        className: 'TableItemCleanup__ColumnMallPrice',
        dataKey: SortableColumnKey.MALL_PRICE,
        flexGrow: 1,
        label: <abbr title="5th lowest mall price">Price</abbr>,
        // eslint-disable-next-line react/display-name
        renderCell: item => <CellMallPrice item={item} />,
        width: 80,
      }),
      makeColumn({
        // eslint-disable-next-line react/display-name
        renderCell: item => (
          <CellKeepAmount
            item={item}
            onRuleChange={handleRuleChange}
            rule={cleanupRules[item.id]}
          />
        ),
        className: 'TableItemCleanup__ColumnKeepAmount',
        dataKey: 'keepAmount',
        disableSort: true,
        label: 'Keep',
        width: 70,
      }),
      makeColumn({
        // eslint-disable-next-line react/display-name
        renderCell: item => (
          <CellItemAction
            item={item}
            onRuleChange={handleRuleChange}
            rule={cleanupRules[item.id]}
          />
        ),
        className: 'TableItemCleanup__ColumnAction',
        dataKey: 'action',
        disableSort: true,
        flexGrow: 1,
        label: 'Action',
        width: 440,
      }),
    ],
    [cleanupRules, handleRuleChange, inventory, makeColumn, makeSortableColumn]
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
              `${finalItems.length} / ${items.length} match${
                finalItems.length > 1 ? 'es' : ''
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
              rowCount={finalItems.length}
              rowGetter={rowGetter}
              rowHeight={60}
              sort={updateSortState}
              sortBy={sortBy}
              sortDirection={sortDirection}
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
