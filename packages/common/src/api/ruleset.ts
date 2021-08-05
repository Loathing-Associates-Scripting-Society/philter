/**
 * @file Defines requests and responses for rulesets.
 */

import type {CleanupRuleset} from '../data/cleanup-rule.js';
import type {RequestBase, SuccessResponseBase} from './base.js';

export const RULESET_ROUTE = '/ruleset' as const;
export type RULESET_ROUTE = typeof RULESET_ROUTE;

export interface RulesetSaveRequest extends RequestBase<RULESET_ROUTE, 'post'> {
  cleanupRules: CleanupRuleset;
}

export interface RulesetSaveResponse extends SuccessResponseBase {
  result: {
    success: true;
  };
}

declare module './base' {
  interface Routes {
    [RULESET_ROUTE]: RoutesEntry<RulesetSaveRequest, RulesetSaveResponse>;
  }
}
