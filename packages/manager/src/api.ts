/**
 * @file Methods for communicating with the relay script
 */

import {
  CLEANUP_TABLES_CATEGORIZED_ROUTE,
  CLEANUP_TABLES_UNCATEGORIZED_ROUTE,
  CONFIG_ROUTE,
  ErrorResponseBase,
  INVENTORY_ROUTE,
  OcdCleanupConfig,
  prepareRequestForSerialization,
  ReadonlyOcdRuleset,
  ReadonlyOcdRulesetPatch,
  RELAY_SCRIPT_FILE,
  Request,
  RequestMethodFor,
  Response,
  Routes,
  RULESET_ROUTE,
  STATISTICS_ROUTE,
} from '@ocd-cleanup/common';

/**
 * API error class. Thrown when the API returns an error response.
 */
export class ApiError extends Error {
  /** Error code. This does _not_ map 1:1 to HTTP error codes. */
  readonly code: number;
  /** Error response object returned by the API. */
  readonly response: unknown;

  constructor(message: string, code: number, response: unknown) {
    super(message);
    this.code = code;
    this.response = response;
  }
}
ApiError.prototype.name = 'ApiError';

/**
 * Fetches data using routes and methods defined in `@ocd-cleanup/common`.
 * @param path Request route
 * @param method Request method
 * @return Asynchronous fetcher callback
 * @throws {ApiError}
 */
const fetchFromApi = async <
  Path extends keyof Routes,
  Method extends RequestMethodFor<Path>
>(
  path: Path,
  method: Method,
  body: Readonly<Omit<Request<Path, Method>, 'path' | 'method'>>
) => {
  const preparedRequest = prepareRequestForSerialization({
    path,
    method,
    ...body,
  });

  // KoLmafia requires the `relay=true` parameter in order to execute JavaScript
  // -based relay scripts.
  const fetchResponse = await fetch(`/${RELAY_SCRIPT_FILE}?relay=true`, {
    body: new URLSearchParams(preparedRequest),
    method: 'POST',
  });
  if (!fetchResponse.ok) {
    let text;
    try {
      text = await fetchResponse.text();
    } catch (e) {
      // Crude approach, but text() only fails under rare circumstances...
      console.error(e);
    }
    throw new ApiError(fetchResponse.statusText, fetchResponse.status, text);
  }

  let response;
  try {
    response = (await fetchResponse.json()) as
      | Response<Path, Method>
      | ErrorResponseBase;
  } catch (error) {
    throw new ApiError(
      `Invalid JSON returned from server (${error})\nResponse: ${response}`,
      500,
      response
    );
  }

  if ('error' in response) {
    throw new ApiError(
      response.error.message,
      response.error.code,
      response.error.message
    );
  }
  return response;
};

export const fetchGetCleanupTableCategorized = () =>
  fetchFromApi(CLEANUP_TABLES_CATEGORIZED_ROUTE, 'get', {});

export const fetchGetCleanupTableUncategorized = () =>
  fetchFromApi(CLEANUP_TABLES_UNCATEGORIZED_ROUTE, 'get', {});

export const fetchSaveOcdRuleset = (ocdRules: ReadonlyOcdRuleset) =>
  fetchFromApi(RULESET_ROUTE, 'post', {ocdRules});

export const fetchPatchOcdRuleset = (ocdRulesPatch: ReadonlyOcdRulesetPatch) =>
  fetchFromApi(RULESET_ROUTE, 'patch', {ocdRulesPatch});

export const fetchInventoryState = () =>
  fetchFromApi(INVENTORY_ROUTE, 'get', {});

export const fetchGetOcdCleanupConfig = () =>
  fetchFromApi(CONFIG_ROUTE, 'get', {});

export const fetchSaveOcdCleanupConfig = (
  config: Readonly<OcdCleanupConfig>,
  shouldCopyDataFiles?: boolean
) => fetchFromApi(CONFIG_ROUTE, 'post', {config, shouldCopyDataFiles});

export const fetchGetStatistics = () =>
  fetchFromApi(STATISTICS_ROUTE, 'get', {});
