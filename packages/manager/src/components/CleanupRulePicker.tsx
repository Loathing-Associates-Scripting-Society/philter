import {Checkbox, Classes, FormGroup, Intent} from '@blueprintjs/core';
import {ItemInfo, CleanupRule} from '@philter/common';
import classNames from 'classnames';
import React, {useCallback} from 'react';
import {MAX_MALL_PRICE, shouldWarnOnPulverize} from '../util';
import './CleanupRulePicker.css';
import {NumericInputLite} from './NumericInputLite';
import {
  CleanupActionOrUnknown,
  SelectCleanupAction,
  UNKNOWN_CLEANUP_ACTION,
} from './SelectCleanupAction';

// Note: We use one condition per each conditional option, which allows the
// backend to decide what can be done with each item.
export const CleanupRulePicker = ({
  item,
  rule,
  onChange,
}: {
  item: Readonly<ItemInfo>;
  /**
   * Callback that accepts a new rule, or `null` if the user changed the rule
   * to "(uncategorized)".
   * The argument is the new rule, or an updater function that takes the
   * previous rule as argument and returns a new rule.
   */
  onChange?: (
    newRuleOrReducer: React.SetStateAction<CleanupRule | null>
  ) => void;
  rule: Readonly<CleanupRule> | null;
}): JSX.Element => {
  const handleActionChange = useCallback(
    (action: CleanupActionOrUnknown) => {
      if (!onChange) return;
      onChange(oldRule => {
        if (action === oldRule?.action) return oldRule;

        // If the action type changes to another action that requires additional
        // parameters, initialize these parameters.
        // Note: This means that additional parameters are NOT remembered when
        // the user switches an action. This may be undesirable...perhaps use
        // some internal state to maintain this, or let the parent component
        // handle it?
        if (action === UNKNOWN_CLEANUP_ACTION) {
          return null;
        } else if (action === 'GIFT') {
          return {...oldRule, action, message: '', recipent: ''};
        } else if (action === 'MAKE') {
          return {
            ...oldRule,
            action,
            shouldUseCreatableOnly: false,
            targetItem: '',
          };
        } else if (action === 'MALL') {
          return {...oldRule, action, minPrice: 0};
        } else if (action === 'TODO') {
          return {...oldRule, action, message: ''};
        } else {
          return {...oldRule, action};
        }
      });
    },
    [onChange]
  );

  let helperText;
  let intent;

  if (rule) {
    if (rule.action === 'PULV' && shouldWarnOnPulverize(item)) {
      helperText = 'You will pulverize an untradable item.';
      intent = Intent.WARNING;
    } else if (rule.action === 'DISC') {
      helperText = 'You will gain no meat from discarding.';
      intent = Intent.WARNING;
    }
  }

  return (
    <FormGroup
      className="CleanupRulePicker"
      helperText={helperText}
      intent={intent}
    >
      {/* Wrap child elements inside a <div>. This separates them from the
          helper text <div>, which is injected by the outer <FormGroup>.
          This separation allows the children to be arranged on a single "row"
          with the helper text under them. */}
      <div className="CleanupRulePicker__Inputs">
        <SelectCleanupAction
          className="CleanupRulePicker__Child"
          item={item}
          onChange={handleActionChange}
          value={rule ? rule.action : UNKNOWN_CLEANUP_ACTION}
        />

        {!rule ? null : rule.action === 'GIFT' ? (
          <>
            <FormGroup
              className="CleanupRulePicker__Child"
              contentClassName="CleanupRulePicker__InputGiftRecipent"
              helperText={!rule.recipent && 'No recipent name'}
              inline
              intent={rule.recipent ? undefined : Intent.DANGER}
              label="to"
            >
              <input
                className={classNames(
                  Classes.INPUT,
                  Classes.SMALL,
                  !rule.recipent && Classes.INTENT_DANGER,
                  'CleanupRulePicker__InputText'
                )}
                onChange={e => onChange?.({...rule, recipent: e.target.value})}
                placeholder="Player name"
                type="text"
                value={rule.recipent}
              />
            </FormGroup>
            <FormGroup
              className="CleanupRulePicker__Child"
              contentClassName="CleanupRulePicker__InputGiftMessage"
              inline
              label="with"
            >
              <input
                className={classNames(
                  Classes.INPUT,
                  Classes.SMALL,
                  'CleanupRulePicker__InputText'
                )}
                onChange={e => onChange?.({...rule, message: e.target.value})}
                placeholder="Kmail message"
                type="text"
                value={rule.message}
              />
            </FormGroup>
          </>
        ) : rule.action === 'MAKE' ? (
          <>
            <FormGroup
              className="CleanupRulePicker__Child"
              contentClassName="CleanupRulePicker__InputMakeTarget"
              helperText={!rule.targetItem && 'No item name'}
              inline
              intent={!rule.targetItem ? Intent.DANGER : undefined}
              label="into"
            >
              <input
                className={classNames(
                  Classes.INPUT,
                  Classes.SMALL,
                  'CleanupRulePicker__InputText'
                )}
                onChange={e =>
                  onChange?.({...rule, targetItem: e.target.value})
                }
                placeholder="Item name"
                type="text"
                value={rule.targetItem}
              />
            </FormGroup>
            <Checkbox
              checked={rule.shouldUseCreatableOnly}
              className="CleanupRulePicker__Child CleanupRulePicker__Checkbox"
              onChange={e =>
                onChange?.({
                  ...rule,
                  shouldUseCreatableOnly: e.currentTarget.checked,
                })
              }
            >
              <span className="CleanupRulePicker__CheckBoxText">
                Only use available ingredients
              </span>
            </Checkbox>
          </>
        ) : rule.action === 'MALL' ? (
          <FormGroup
            className="CleanupRulePicker__Child"
            contentClassName="CleanupRulePicker__InputMallMinPrice"
            inline
            label="min price"
          >
            <NumericInputLite
              max={MAX_MALL_PRICE}
              min={0}
              onChange={event => {
                const value = Number(event.target.value);
                if (Number.isInteger(value)) {
                  onChange?.({
                    ...rule,
                    minPrice: Math.max(0, Math.min(MAX_MALL_PRICE, value)),
                  });
                }
              }}
              value={rule.minPrice}
            />
          </FormGroup>
        ) : rule.action === 'TODO' ? (
          <FormGroup
            className="CleanupRulePicker__Child"
            contentClassName="CleanupRulePicker__InputTodoMessage"
            inline
            label="with message:"
          >
            <input
              className={classNames(
                Classes.INPUT,
                Classes.SMALL,
                'CleanupRulePicker__InputText'
              )}
              onChange={e => onChange?.({...rule, message: e.target.value})}
              placeholder="Enter reminder message"
              type="text"
              value={rule.message}
            />
          </FormGroup>
        ) : null}
      </div>
    </FormGroup>
  );
};
