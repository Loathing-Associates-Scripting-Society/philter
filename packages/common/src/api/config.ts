/**
 * @file Defines requests and responses for OCD-Cleanup settings.
 */

import {OcdCleanupConfig} from '../data/ocd-cleanup-config.js';
import {RequestBase, SuccessResponseBase} from './base.js';

export const CONFIG_ROUTE = '/config' as const;
export type CONFIG_ROUTE = typeof CONFIG_ROUTE;

export type ConfigGetRequest = RequestBase<CONFIG_ROUTE, 'get'>;

export interface ConfigGetResponse extends SuccessResponseBase {
  result: OcdCleanupConfig;
}

export interface ConfigSaveRequest extends RequestBase<CONFIG_ROUTE, 'post'> {
  config: OcdCleanupConfig;
  /**
   * If the user's data files are renamed, this controls whether the old data
   * files will be copied over to the new files.
   */
  shouldCopyDataFiles?: boolean;
}

export interface ConfigSaveResponse extends SuccessResponseBase {
  result: {
    success: true;
  };
}

declare module './base' {
  interface Routes {
    [CONFIG_ROUTE]:
      | RoutesEntry<ConfigGetRequest, ConfigGetResponse>
      | RoutesEntry<ConfigSaveRequest, ConfigSaveResponse>;
  }
}
