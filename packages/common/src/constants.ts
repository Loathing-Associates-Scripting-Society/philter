/**
 * @file Provides constants necessary for piecing the application together.
 */

/**
 * Relative path to the directory that contains assets (HTML, CSS, JS) for
 * OCD-Cleanup Manager.
 *
 * Note: This must be kept in sync with `BUILD_PATH` in `/packages/manager/.env`
 */
export const RELAY_DIR = '/ocd-cleanup-manager-2' as const;

/**
 * Relative path to the HTML skeleton page for OCD-Cleanup Manager.
 * The relay API script will serve this page to the user.
 */
export const RELAY_HTML_PATH = `${RELAY_DIR}/index.html` as const;

/**
 * Name of the relay API script file for OCD-Cleanup.
 * OCD-Cleanup Manager uses this to construct the request URL.
 * This is also used by build/release scripts.
 */
export const RELAY_SCRIPT_FILE = 'relay_OCD-Cleanup_Manager_2_(alpha).js' as const;
