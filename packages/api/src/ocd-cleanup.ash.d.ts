/**
 * @file Type definitions for functions provided by `ocd-cleanup.ash`.
 */

declare module 'ocd-cleanup.ash' {
  /**
   * Checks if an item can be processed by OCD-Cleanup.
   *
   * Generally, this rejects most items that cannot be put in the display case
   * (e.g. quest items). However, several items that OCD-Cleanup knows how to
   * handle are exempt from this rule.
   * @param item Item to check
   * @return Whether the item can be processed by OCD-Cleanup
   */
  function isOCDable(item: Item): boolean;
}
