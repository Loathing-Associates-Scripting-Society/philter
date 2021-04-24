/** Base interface for OCD stocking rule. */
export interface StockingRule {
  /**
   * Type of stocking rule (i.e. "Purpose" in OCD-Cleanup manager).
   * This is used to sort and group stocking rules in the OCD-Cleanup Manager.
   * It does not have any significance during the execution of OCD-Cleanup.
   */
  type: string;
  /** Quantity of item to stock up. */
  amount: number;
  /**
   * This field appears to be unused. Currently, the only available values are
   * `"basic"` and the empty string (`""`).
   */
  category: string;
}

export interface StockingRuleset {
  [itemId: number]: StockingRule;
}

export interface ReadonlyStockingRuleset {
  readonly [itemId: number]: Readonly<ReadonlyStockingRuleset>;
}
