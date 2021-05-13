import {Colors, HTMLSelect} from '@blueprintjs/core';
import {isOcdAction, OcdAction, OcdItem} from '@philter/common';
import classNames from 'classnames';
import React, {memo} from 'react';
import {shouldWarnOnPulverize, typeCheck} from '../util';
import './SelectOcdAction.css';

/**
 * A fallback value used to denote uncategorized items in the `<select>`.
 */
export const UNKNOWN_OCD_ACTION = 'UNKN';
export type OcdActionOrUnknown = OcdAction | typeof UNKNOWN_OCD_ACTION;

const isOcdActionOrUnknown = (value: unknown): value is OcdActionOrUnknown =>
  value === UNKNOWN_OCD_ACTION || isOcdAction(value);

interface SelectOcdActionPropsBase {
  item: Readonly<OcdItem>;
  onChange: (value: OcdActionOrUnknown) => void;
  value: OcdActionOrUnknown;
}

interface SelectOcdActionProps
  extends SelectOcdActionPropsBase,
    Omit<
      React.ComponentProps<typeof HTMLSelect>,
      keyof SelectOcdActionPropsBase
    > {}

/**
 * `<HTMLSelect>` element for picking a Philter action.
 */
// eslint-disable-next-line prefer-arrow-callback
export const SelectOcdAction = memo(function SelectOcdAction({
  className,
  item,
  onChange,
  value,
  ...restProps
}: SelectOcdActionProps) {
  return (
    <HTMLSelect
      className={classNames(`OcdRulePicker__SelectAction`, className)}
      onChange={e =>
        isOcdActionOrUnknown(e.target.value) && onChange(e.target.value)
      }
      value={value}
      {...restProps}
    >
      <option value={typeCheck<OcdActionOrUnknown>(UNKNOWN_OCD_ACTION)}>
        (uncategorized)
      </option>
      <option value={typeCheck<OcdActionOrUnknown>('KEEP')}>Keep all</option>
      {item.canMall && (
        <option value={typeCheck<OcdActionOrUnknown>('MALL')}>Mall sale</option>
      )}
      {item.canBreak && (
        <option value={typeCheck<OcdActionOrUnknown>('BREAK')}>
          Break apart
        </option>
      )}
      {item.canAutosell && (
        <option value={typeCheck<OcdActionOrUnknown>('AUTO')}>Autosell</option>
      )}
      {item.canDiscard && (
        <option
          style={{color: Colors.ORANGE2}}
          value={typeCheck<OcdActionOrUnknown>('DISC')}
        >
          Discard
        </option>
      )}
      {item.canGift && (
        <option value={typeCheck<OcdActionOrUnknown>('GIFT')}>
          Send as gift
        </option>
      )}
      {item.canStash && (
        <option value={typeCheck<OcdActionOrUnknown>('CLAN')}>
          Put in clan stash
        </option>
      )}
      {item.canPulverize && (
        <option
          style={
            shouldWarnOnPulverize(item) ? {color: Colors.ORANGE2} : undefined
          }
          value={typeCheck<OcdActionOrUnknown>('PULV')}
        >
          Pulverize
        </option>
      )}
      {item.canMake && (
        <option value={typeCheck<OcdActionOrUnknown>('MAKE')}>Craft...</option>
      )}
      {item.canUntinker && (
        <option value={typeCheck<OcdActionOrUnknown>('UNTN')}>Untinker</option>
      )}
      {item.canUse && (
        <option value={typeCheck<OcdActionOrUnknown>('USE')}>Use</option>
      )}
      {item.canCloset && (
        <option value={typeCheck<OcdActionOrUnknown>('CLST')}>Closet</option>
      )}
      {item.canDisplay && (
        <option value={typeCheck<OcdActionOrUnknown>('DISP')}>Display</option>
      )}
      <option value={typeCheck<OcdActionOrUnknown>('TODO')}>Reminder</option>
    </HTMLSelect>
  );
});
