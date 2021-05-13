/**
 * Object whose keys define what string constants make up the `OcdAction` type.
 * Also used to check at runtime if a string belongs to the `OcdAction` type.
 * The values are unused; they can be anything.
 */
const _ocdActions = Object.freeze({
  AUTO: 0,
  BREAK: 0,
  CLAN: 0,
  CLST: 0,
  DISC: 0,
  DISP: 0,
  GIFT: 0,
  KEEP: 0,
  MAKE: 0,
  MALL: 0,
  PULV: 0,
  TODO: 0,
  UNTN: 0,
  USE: 0,
});

export type OcdAction = keyof typeof _ocdActions;

/**
 * Checks if the given value is a valid `OcdAction` type.
 */
export const isOcdAction = (value: unknown): value is OcdAction =>
  typeof value === 'string' &&
  Object.prototype.hasOwnProperty.call(_ocdActions, value);

/** Base interface for OCD rule interfaces. */
interface OcdRuleBase<OcdActionType extends OcdAction> {
  action: OcdActionType;
  keepAmount?: number;
}

interface OcdGiftRule extends OcdRuleBase<'GIFT'> {
  /** User to send the item to */
  recipent: string;
  /** Message to use when sending the kmail */
  message: string;
}

interface OcdMakeRule extends OcdRuleBase<'MAKE'> {
  /** Target item to create */
  targetItem: string;
  /**
   * If `true`, Philter will only use available ingredients to create the target
   * items. Otherwise, Philter will attempt to obtain any other ingredients
   * necessary to spend all of the item being cleaned up.
   */
  shouldUseCreatableOnly: boolean;
}

interface OcdMallRule extends OcdRuleBase<'MALL'> {
  /** Minimum price to use when selling the item in the mall store. */
  minPrice: number;
}

interface OcdTodoRule extends OcdRuleBase<'TODO'> {
  /** Reminder message to display in the gCLI when Philter executes. */
  message: string;
}

/**
 * Union of all specialized OCD rule interfaces.
 * This is a helper type used to build the `OcdRule` union type.
 */
type OcdSpecializedRule = OcdGiftRule | OcdMakeRule | OcdMallRule | OcdTodoRule;

/** Union of all OCD rule interfaces. */
export type OcdRule =
  | OcdSpecializedRule
  | OcdRuleBase<Exclude<OcdAction, OcdSpecializedRule['action']>>;

export interface OcdRuleset {
  [itemId: number]: OcdRule;
}

export interface ReadonlyOcdRuleset {
  readonly [itemId: number]: Readonly<OcdRule>;
}
