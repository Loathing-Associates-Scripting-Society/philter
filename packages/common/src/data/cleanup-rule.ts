/**
 * Object whose keys are string values that make up the `CleanupAction` type.
 * Also used to check at runtime if a string belongs to `CleanupAction`.
 * The values are unused; they can be anything.
 */
const _cleanupActions = Object.freeze({
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

export type CleanupAction = keyof typeof _cleanupActions;

/**
 * Checks if the given value is a valid `CleanupAction` type.
 */
export const isCleanupAction = (value: unknown): value is CleanupAction =>
  typeof value === 'string' &&
  Object.prototype.hasOwnProperty.call(_cleanupActions, value);

/** Base interface for cleanup rule interfaces. */
interface CleanupRuleBase<ActionType extends CleanupAction> {
  action: ActionType;
  keepAmount?: number;
}

interface CleanupGiftRule extends CleanupRuleBase<'GIFT'> {
  /** User to send the item to */
  recipent: string;
  /** Message to use when sending the kmail */
  message: string;
}

interface CleanupMakeRule extends CleanupRuleBase<'MAKE'> {
  /** Target item to create */
  targetItem: string;
  /**
   * If `true`, Philter will only use available ingredients to create the target
   * items. Otherwise, Philter will attempt to obtain any other ingredients
   * necessary to spend all of the item being cleaned up.
   */
  shouldUseCreatableOnly: boolean;
}

interface CleanupMallRule extends CleanupRuleBase<'MALL'> {
  /** Minimum price to use when selling the item in the mall store. */
  minPrice: number;
}

interface CleanupTodoRule extends CleanupRuleBase<'TODO'> {
  /** Reminder message to display in the gCLI when Philter executes. */
  message: string;
}

/**
 * Union of all specialized cleanup rule interfaces.
 * This is a helper type used to build the `CleanupRule` union type.
 */
type CleanupSpecializedRule =
  | CleanupGiftRule
  | CleanupMakeRule
  | CleanupMallRule
  | CleanupTodoRule;

/** Union of all cleanup rule interfaces. */
export type CleanupRule =
  | CleanupSpecializedRule
  | CleanupRuleBase<Exclude<CleanupAction, CleanupSpecializedRule['action']>>;

export interface CleanupRuleset {
  [itemId: number]: CleanupRule;
}

export interface ReadonlyCleanupRuleset {
  readonly [itemId: number]: Readonly<CleanupRule>;
}
