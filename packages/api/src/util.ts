/**
 * @file General-purpose utilities for KoLmafia scripts.
 */

import {fileToArray, toInt} from 'kolmafia';

/**
 * Factory function for functions that parse a text file into an ES2015 Map
 * using KoLmafia's file I/O API.
 * Any comments and empty lines in the text file are ignored.
 * @param parse Callback used to parse each row.
 *    The callback may accept the following arguments:
 *
 *    - `row`: Array of strings representing each cell
 *    - `rowNum`: Row number, _starts at 1_
 *    - `filename`: Path to the text file being parsed
 *
 *    The callback must return a tuple of `[key, value]`.
 *    If the row is malformed, the callback may throw an exception.
 * @return Function that accepts a file name as a parameter, and returns a Map.
 *    If the file cannot be found or is empty, this function will return `null`
 *    instead.
 */
export function createMapLoader<K, V>(
  parse: (row: readonly string[], rowNum: number, filename: string) => [K, V]
) {
  return (filename: string) => {
    const entries = new Map<K, V>();
    const rawData = fileToArray(filename);

    for (const indexStr of Object.keys(rawData)) {
      const row = rawData[indexStr as unknown as number].split('\t');
      const [key, value] = parse(row, Number(indexStr), filename);
      entries.set(key, value);
    }

    return entries.size ? entries : null;
  };
}

/**
 * Encodes an item object as a string for saving to a data (TXT) file.
 */
export function encodeItem(item: Item) {
  return `[${toInt(item)}]${item.name}`;
}

const _MONTH_STR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Converts a given date to Common Log Format string.
 */
export function formatDateClf(date: Date): string {
  // Example format: 05/Apr/2021:15:22:30 +0900
  const dd = String(date.getDate()).padStart(2, '0');
  const mon = _MONTH_STR[date.getMonth()];
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  const tzOffset = date.getTimezoneOffset();
  const tz_hh = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
  const tz_mm = String(Math.abs(tzOffset) % 60).padStart(2, '0');
  // Displayed time zone sign must be reversed
  const timezone = `${tzOffset >= 0 ? '-' : '+'}${tz_hh}${tz_mm}`;

  return `${dd}/${mon}/${yyyy}:${hh}:${mm}:${ss} ${timezone}`;
}

/**
 * Converts a regular JavaScript object keyed by item IDs to an ES6 Map keyed by
 * `Item` objects.
 */
export function idMappingToItemMap<T>(itemMapping: {
  [itemId: number]: T;
}): Map<Item, T> {
  return new Map(
    Object.keys(itemMapping).map(itemId => [
      Item.get(Number(itemId)),
      itemMapping[itemId as unknown as number],
    ])
  );
}

/**
 * Converts an ES6 Map keyed by `Item` objects to a regular JavaScript object
 * keyed by item IDs.
 */
export function itemMapToIdMapping<T>(itemMap: ReadonlyMap<Item, T>): {
  [itemId: number]: T;
} {
  const itemMapping: {[itemId: number]: T} = {};
  for (const [item, value] of itemMap) {
    itemMapping[toInt(item)] = value;
  }
  return itemMapping;
}

/**
 * Converts a mapping of item strings to their amounts (returned by
 * `getInventory()`, `getCloset()`, etc.) to a Map.
 * @param items Mapping of item strings to their amounts
 * @return Mapping of Item to amount
 */
export function toItemMap<T>(items: {[itemStr: string]: T}): Map<Item, T> {
  return new Map(
    Object.keys(items).map(itemStr => [Item.get(itemStr), items[itemStr]])
  );
}
