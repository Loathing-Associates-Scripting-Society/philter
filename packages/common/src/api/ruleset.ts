/**
 * @file Defines requests and responses for OCD rulesets.
 */

import type {OcdRule, OcdRuleset} from '../data/ocd-rule.js';
import type {RequestBase, SuccessResponseBase} from './base.js';

export const RULESET_ROUTE = '/ruleset' as const;
export type RULESET_ROUTE = typeof RULESET_ROUTE;

export interface RulesetSaveRequest extends RequestBase<RULESET_ROUTE, 'post'> {
  ocdRules: OcdRuleset;
}

export interface RulesetSaveResponse extends SuccessResponseBase {
  result: {
    success: true;
  };
}

export interface OcdRulesetPatch {
  [itemId: number]: OcdRule | null;
}

export interface ReadonlyOcdRulesetPatch {
  readonly [itemId: number]: Readonly<OcdRule> | null;
}

/**
 * Request that updates the current ruleset, adding/updating/deleting rules.
 * This request _should_ be idempotent.
 */
export interface RulesetPatchRequest
  extends RequestBase<RULESET_ROUTE, 'patch'> {
  /**
   * Object that maps of item ID (number) to an OCD rule or `null`.
   * If the value is `null`, any previous rule is deleted.
   * Otherwise, the value is used to create a new rule or overwrite an existing
   * rule.
   */
  ocdRulesPatch: OcdRulesetPatch;
}

export interface RulesetPatchResponse extends SuccessResponseBase {
  result: {
    success: true;
  };
}

declare module './base' {
  interface Routes {
    [RULESET_ROUTE]:
      | RoutesEntry<RulesetSaveRequest, RulesetSaveResponse>
      | RoutesEntry<RulesetPatchRequest, RulesetPatchResponse>;
  }
}
