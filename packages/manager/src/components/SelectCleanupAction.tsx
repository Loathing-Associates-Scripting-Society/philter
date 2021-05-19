import {Colors, HTMLSelect} from '@blueprintjs/core';
import {isCleanupAction, CleanupAction, ItemInfo} from '@philter/common';
import classNames from 'classnames';
import React, {memo} from 'react';
import {shouldWarnOnPulverize, typeCheck} from '../util';
import './SelectCleanupAction.css';

/**
 * A fallback value used to denote uncategorized items in the `<select>`.
 */
export const UNKNOWN_CLEANUP_ACTION = 'UNKN';
export type CleanupActionOrUnknown =
  | CleanupAction
  | typeof UNKNOWN_CLEANUP_ACTION;

const isCleanupActionOrUnknown = (
  value: unknown
): value is CleanupActionOrUnknown =>
  value === UNKNOWN_CLEANUP_ACTION || isCleanupAction(value);

interface SelectCleanupActionPropsBase {
  item: Readonly<ItemInfo>;
  onChange: (value: CleanupActionOrUnknown) => void;
  value: CleanupActionOrUnknown;
}

interface SelectCleanupActionProps
  extends SelectCleanupActionPropsBase,
    Omit<
      React.ComponentProps<typeof HTMLSelect>,
      keyof SelectCleanupActionPropsBase
    > {}

/**
 * `<HTMLSelect>` element for picking a cleanup action.
 */
// eslint-disable-next-line prefer-arrow-callback
export const SelectCleanupAction = memo(function SelectCleanupAction({
  className,
  item,
  onChange,
  value,
  ...restProps
}: SelectCleanupActionProps) {
  return (
    <HTMLSelect
      className={classNames(`SelectCleanupAction`, className)}
      onChange={e =>
        isCleanupActionOrUnknown(e.target.value) && onChange(e.target.value)
      }
      value={value}
      {...restProps}
    >
      <option value={typeCheck<CleanupActionOrUnknown>(UNKNOWN_CLEANUP_ACTION)}>
        (uncategorized)
      </option>
      <option value={typeCheck<CleanupActionOrUnknown>('KEEP')}>
        Keep all
      </option>
      {item.canMall && (
        <option value={typeCheck<CleanupActionOrUnknown>('MALL')}>
          Mall sale
        </option>
      )}
      {item.canBreak && (
        <option value={typeCheck<CleanupActionOrUnknown>('BREAK')}>
          Break apart
        </option>
      )}
      {item.canAutosell && (
        <option value={typeCheck<CleanupActionOrUnknown>('AUTO')}>
          Autosell
        </option>
      )}
      {item.canDiscard && (
        <option
          style={{color: Colors.ORANGE2}}
          value={typeCheck<CleanupActionOrUnknown>('DISC')}
        >
          Discard
        </option>
      )}
      {item.canGift && (
        <option value={typeCheck<CleanupActionOrUnknown>('GIFT')}>
          Send as gift
        </option>
      )}
      {item.canStash && (
        <option value={typeCheck<CleanupActionOrUnknown>('CLAN')}>
          Put in clan stash
        </option>
      )}
      {item.canPulverize && (
        <option
          style={
            shouldWarnOnPulverize(item) ? {color: Colors.ORANGE2} : undefined
          }
          value={typeCheck<CleanupActionOrUnknown>('PULV')}
        >
          Pulverize
        </option>
      )}
      {item.canMake && (
        <option value={typeCheck<CleanupActionOrUnknown>('MAKE')}>
          Craft...
        </option>
      )}
      {item.canUntinker && (
        <option value={typeCheck<CleanupActionOrUnknown>('UNTN')}>
          Untinker
        </option>
      )}
      {item.canUse && (
        <option value={typeCheck<CleanupActionOrUnknown>('USE')}>Use</option>
      )}
      {item.canCloset && (
        <option value={typeCheck<CleanupActionOrUnknown>('CLST')}>
          Closet
        </option>
      )}
      {item.canDisplay && (
        <option value={typeCheck<CleanupActionOrUnknown>('DISP')}>
          Display
        </option>
      )}
      <option value={typeCheck<CleanupActionOrUnknown>('TODO')}>
        Reminder
      </option>
    </HTMLSelect>
  );
});
