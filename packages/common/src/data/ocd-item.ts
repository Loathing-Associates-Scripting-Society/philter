/**
 * Represents information about a KoL item that OCD Manager is interested in.
 */
export interface OcdItem {
  canAutosell: boolean;
  canBreak: boolean;
  canCloset: boolean;
  canDiscard: boolean;
  canDisplay: boolean;
  canGift: boolean;
  canMake: boolean;
  canMall: boolean;
  canPulverize: boolean;
  canStash: boolean;
  canUntinker: boolean;
  canUse: boolean;
  descid: string;
  id: number;
  /** Item image file name (e.g. `club.gif`) */
  image: string;
  /**
   * Whether `mallPrice` is the lowest possible mall price for this item.
   * If `mallPrice` is `null`, this should be `false` (which is ignored).
   */
  isMallPriceAtMinimum: boolean;
  isTradable: boolean;
  /**
   * Current 5th lowest mall price.
   * This is `null` if the item is not available at the mall at any price
   * (e.g. untradable or completely sold out).
   */
  mallPrice: number | null;
  name: string;
}
