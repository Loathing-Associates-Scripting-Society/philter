/**
 * @file Utility methods for logging to the gCLI.
 */

import {isDarkMode} from 'kolmafia';
import {vprint} from 'zlib.ash';

/**
 * Prints a debug message to the gCLI, obeying the current verbosity setting
 * (`zlib verbosity`).
 * @param message Message to print
 */
export function debug(message: string) {
  vprint(message, '#808080', 6);
}

/**
 * Prints an error message to the gCLI, obeying the current verbosity setting
 * (`zlib verbosity`).
 * @param message Message to print
 */
export function error(message: string) {
  vprint(message, isDarkMode() ? '#ff0033' : '#cc0033', 1);
}
