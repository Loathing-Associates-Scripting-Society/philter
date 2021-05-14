import {Code, InputGroup} from '@blueprintjs/core';
import React from 'react';
import './InputGroupAffixedFileName.css';

interface InputGroupAffixedFileNameProps
  extends React.ComponentProps<typeof InputGroup> {
  /** File name prefix, if any */
  fileNamePrefix?: string;
  /** File name suffix, if any */
  fileNameSuffix?: string;
}

/**
 * `InputGroup` for a file name with predefined prefix and/or suffix.
 */
export const InputGroupAffixedFileName = React.memo(
  function InputGroupAffixedFileName({
    fileNamePrefix,
    fileNameSuffix,
    className = '',
    ...restProps
  }: InputGroupAffixedFileNameProps) {
    return (
      <InputGroup
        className={`InputGroupAffixedFileName ${className}`}
        leftElement={
          fileNamePrefix ? (
            <Code className="InputGroupAffixedFileName__Prefix">
              {fileNamePrefix}
            </Code>
          ) : undefined
        }
        rightElement={
          fileNameSuffix ? (
            <Code className="InputGroupAffixedFileName__Suffix">
              {fileNameSuffix}
            </Code>
          ) : undefined
        }
        {...restProps}
      />
    );
  }
);
