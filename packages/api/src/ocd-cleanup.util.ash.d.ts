/**
 * @file Type definitions for functions provided by `ocd-cleanup.util.ash`.
 * This is needed for JavaScript <-> ASH interop.
 */

declare module 'ocd-cleanup.util.ash' {
  /**
   * Updates multiple ZLib variables.
   * This will only update variables whose values have been changed.
   * This is primarily intended to be called from JavaScript code.
   *
   * Note: If a variable does not exist, this will print a warning to the gCLI
   * but will not throw an exception!
   * @param newVars Names and values of variables to update
   */
  function _updateZlibVars(newVars: {[varName: string]: string}): void;
}
