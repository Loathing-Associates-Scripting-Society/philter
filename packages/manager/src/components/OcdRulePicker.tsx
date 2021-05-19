import {
  Checkbox,
  FormGroup,
  InputGroup,
  Intent,
  NumericInput,
} from '@blueprintjs/core';
import {OcdItem, OcdRule} from '@philter/common';
import React, {useCallback} from 'react';
import {MAX_MALL_PRICE, shouldWarnOnPulverize} from '../util';
import './OcdRulePicker.css';
import {
  OcdActionOrUnknown,
  SelectOcdAction,
  UNKNOWN_OCD_ACTION,
} from './SelectOcdAction';

// Note: We use one condition per each conditional option, which allows the
// backend to decide what can be done with each item.
export const OcdRulePicker = ({
  item,
  rule,
  onChange,
}: {
  item: Readonly<OcdItem>;
  /**
   * Callback that accepts a new rule, or `null` if the user changed the rule
   * to "(uncategorized)".
   * The argument is the new rule, or an updater function that takes the
   * previous OCD rule as argument and returns a new OCD rule.
   */
  onChange?: (newRuleOrReducer: React.SetStateAction<OcdRule | null>) => void;
  rule: Readonly<OcdRule> | null;
}): JSX.Element => {
  const handleActionChange = useCallback(
    (action: OcdActionOrUnknown) => {
      if (!onChange) return;
      onChange(oldRule => {
        if (action === oldRule?.action) return oldRule;

        // If the action type changes to another action that requires additional
        // parameters, initialize these parameters.
        // Note: This means that additional parameters are NOT remembered when
        // the user switches an action. This may be undesirable...perhaps use
        // some internal state to maintain this, or let the parent component
        // handle it?
        if (action === UNKNOWN_OCD_ACTION) {
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
      className="OcdRulePicker"
      helperText={helperText}
      intent={intent}
    >
      {/* Wrap child elements inside a <div>. This separates them from the
          helper text <div>, which is injected by the outer <FormGroup>.
          This separation allows the children to be arranged on a single "row"
          with the helper text under them. */}
      <div className="OcdRulePicker__Inputs">
        <SelectOcdAction
          className="OcdRulePicker__Child"
          item={item}
          onChange={handleActionChange}
          value={rule ? rule.action : UNKNOWN_OCD_ACTION}
        />

        {!rule ? null : rule.action === 'GIFT' ? (
          <>
            <FormGroup
              className="OcdRulePicker__Child"
              contentClassName="OcdRulePicker__InputGiftRecipent"
              helperText={!rule.recipent && 'No recipent name'}
              inline
              intent={rule.recipent ? undefined : Intent.DANGER}
              label="to"
            >
              <InputGroup
                className="OcdRulePicker__InputText"
                intent={rule.recipent ? undefined : Intent.DANGER}
                onChange={e => onChange?.({...rule, recipent: e.target.value})}
                placeholder="Player name"
                small
                value={rule.recipent}
              />
            </FormGroup>
            <FormGroup
              className="OcdRulePicker__Child"
              contentClassName="OcdRulePicker__InputGiftMessage"
              inline
              label="with"
            >
              <InputGroup
                className="OcdRulePicker__InputText"
                onChange={e => onChange?.({...rule, message: e.target.value})}
                placeholder="Kmail message"
                small
                value={rule.message}
              />
            </FormGroup>
          </>
        ) : rule.action === 'MAKE' ? (
          <>
            <FormGroup
              className="OcdRulePicker__Child"
              contentClassName="OcdRulePicker__InputMakeTarget"
              helperText={!rule.targetItem && 'No item name'}
              inline
              intent={!rule.targetItem ? Intent.DANGER : undefined}
              label="into"
            >
              <InputGroup
                className="OcdRulePicker__InputText"
                intent={!rule.targetItem ? Intent.DANGER : undefined}
                onChange={e =>
                  onChange?.({...rule, targetItem: e.target.value})
                }
                placeholder="Item name"
                small
                value={rule.targetItem}
              />
            </FormGroup>
            <Checkbox
              checked={rule.shouldUseCreatableOnly}
              className="OcdRulePicker__Child OcdRulePicker__Checkbox"
              onChange={e =>
                onChange?.({
                  ...rule,
                  shouldUseCreatableOnly: e.currentTarget.checked,
                })
              }
            >
              <span className="OcdRulePicker__CheckBoxText">
                Only use available ingredients
              </span>
            </Checkbox>
          </>
        ) : rule.action === 'MALL' ? (
          <FormGroup
            className="OcdRulePicker__Child"
            contentClassName="OcdRulePicker__InputMallMinPrice"
            inline
            label="min price"
          >
            <NumericInput
              majorStepSize={100}
              max={MAX_MALL_PRICE}
              min={0}
              minorStepSize={null}
              onValueChange={value => {
                if (Number.isInteger(value)) {
                  onChange?.({
                    ...rule,
                    minPrice: Math.max(0, Math.min(MAX_MALL_PRICE, value)),
                  });
                }
              }}
              stepSize={1}
              value={rule.minPrice}
            />
          </FormGroup>
        ) : rule.action === 'TODO' ? (
          <FormGroup
            className="OcdRulePicker__Child"
            contentClassName="OcdRulePicker__InputTodoMessage"
            inline
            label="with message:"
          >
            <InputGroup
              className="OcdRulePicker__InputText"
              onChange={e => onChange?.({...rule, message: e.target.value})}
              placeholder="Enter reminder message"
              small
              value={rule.message}
            />
          </FormGroup>
        ) : null}
      </div>
    </FormGroup>
  );
};
