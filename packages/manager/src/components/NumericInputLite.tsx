import {Classes} from '@blueprintjs/core';
import classNames from 'classnames';
import React from 'react';
import './NumericInputLite.css';

interface NumericInputLiteProps extends React.ComponentProps<'input'> {
  /**
   * Whether this component should take up the full width of its parent
   * container.
   */
  fill?: boolean;
  small?: boolean;
}

/**
 * A thin wrapper for `<input type="number">` that is styled like an
 * `<InputGroup>` from Blueprint.js.
 */
export const NumericInputLite = ({
  className,
  fill,
  /**
   * Whether this input should use "small" styles.
   */
  small,
  ...props
}: NumericInputLiteProps) => (
  <input
    className={classNames(
      'NumericInputLite',
      Classes.INPUT,
      small && Classes.SMALL,
      fill && Classes.FILL,
      className
    )}
    dir="auto"
    type="number"
    {...props}
  />
);
