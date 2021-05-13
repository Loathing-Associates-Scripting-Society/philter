import {
  Button,
  ButtonGroup,
  Checkbox,
  Classes,
  Code,
  Dialog,
  Divider,
  FormGroup,
  H3,
  InputGroup,
  Radio,
  RadioGroup,
} from '@blueprintjs/core';
import {CONFIG_ROUTE, OcdCleanupConfig} from '@philter/common';
import classNames from 'classnames';
import {dequal} from 'dequal/lite';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {useAsyncCallback} from 'react-async-hook';
import useSWR from 'swr';
import {fetchGetOcdCleanupConfig, fetchSaveOcdCleanupConfig} from '../api';
import {setErrorToast, setSavingToast} from '../toaster';
import {MAX_MALL_PRICE, ZWSP} from '../util';
import {InputGroupAffixedFileName} from './InputGroupAffixedFileName';
import './PanelConfig.css';

const OCD_RULESET_PREFIX = 'OCDdata_';
const OCD_STOCK_PREFIX = 'OCDstock_';
const TXT_SUFFIX = '.txt';

interface ChangedFileEntry {
  /** Label for this entry, shown to the user. */
  label: string;
  newName: string;
  oldName: string;
}

/**
 * A `<Dialog>` that asks whether to copy over existing data or start fresh when
 * the user changes the name of an OCD data file.
 * To properly animate closing transitions, this must be rendered even if the
 * dialog is closed.
 */
// eslint-disable-next-line prefer-arrow-callback
const DialogAskCopyOnSave = memo(function DialogAskCopyOnSave({
  changedFiles = [],
  isOpen,
  onCancel,
  onSaveWithCopy,
  onSaveWithoutCopy,
}: {
  /** Array of data files changed. */
  changedFiles?: readonly Readonly<ChangedFileEntry>[];
  isOpen?: boolean;
  onCancel?: () => void;
  onSaveWithCopy?: () => void;
  onSaveWithoutCopy?: () => void;
}) {
  return (
    <Dialog
      canEscapeKeyClose
      canOutsideClickClose
      icon="warning-sign"
      isOpen={isOpen}
      onClose={onCancel}
      title={`Changing data file name${changedFiles.length > 1 ? 's' : ''}`}
    >
      <div className={Classes.DIALOG_BODY}>
        You are about the change your data file
        {changedFiles.length > 1 ? "s' names" : "'s name"}:
        <ul>
          {changedFiles.map((entry, index) => (
            <li key={index}>
              {entry.label}: <Code>{entry.oldName}</Code> &rArr;{' '}
              <Code>{entry.newName}</Code>
            </li>
          ))}
        </ul>
        Do you want to copy the contents of your previous data file
        {changedFiles.length > 1 && 's'}?
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button
            icon="duplicate"
            text="Copy contents"
            onClick={onSaveWithCopy}
          />
          <Button
            icon="exchange"
            text={`Change file name${changedFiles.length > 1 ? 's' : ''} only`}
            onClick={onSaveWithoutCopy}
          />
          <Button intent="danger" text="Cancel" onClick={onCancel} />
        </div>
      </div>
    </Dialog>
  );
});

/**
 * Helper function that checks if first value is identical to any of the values
 * in the given array.
 */
const isOneOf = <T extends unknown>(
  value: unknown,
  compareWith: readonly T[]
): value is T => compareWith.includes(value as T);

export const PanelConfig = (): JSX.Element => {
  const {data: baseConfig, error: loadingError, mutate} = useSWR(
    CONFIG_ROUTE,
    async () => (await fetchGetOcdCleanupConfig()).result
  );

  const [config, setConfig] = useState<OcdCleanupConfig | null>(null);
  // When the data is loaded for the first time, synchronize config with
  // the server-sent config
  useEffect(() => {
    if (baseConfig && !config) {
      setConfig(baseConfig);
    }
  }, [baseConfig, config]);

  // Saving config is a complicated process that can open a popup dialog asking
  // for the user's confirmation
  // This is why we jump through loops and hoops...

  const [dialogProps, setDialogProps] = useState<
    React.ComponentProps<typeof DialogAskCopyOnSave>
  >({});
  const closeDialog = useCallback(() => setDialogProps({}), []);

  const {
    loading: isSaving,
    execute: saveConfig,
    error: savingError,
  } = useAsyncCallback(
    useCallback(
      async (shouldCopyDataFiles?: boolean) => {
        // These are logical errors and should never happen.
        // If they do, we don't want to catch them
        if (!config) {
          throw new Error('Cannot save empty config');
        }
        if (!baseConfig) {
          throw new Error('Cannot overwrite an empty config object');
        }

        const changedFiles: ChangedFileEntry[] = [];
        if (config.dataFileName !== baseConfig.dataFileName) {
          changedFiles.push({
            label: 'Ruleset file',
            oldName: OCD_RULESET_PREFIX + baseConfig.dataFileName + TXT_SUFFIX,
            newName: OCD_RULESET_PREFIX + config.dataFileName + TXT_SUFFIX,
          });
        }
        if (config.stockFileName !== baseConfig.stockFileName) {
          changedFiles.push({
            label: 'Stock file',
            oldName: OCD_STOCK_PREFIX + baseConfig.stockFileName + TXT_SUFFIX,
            newName: OCD_STOCK_PREFIX + config.stockFileName + TXT_SUFFIX,
          });
        }

        // If shouldCopyDataFiles is not explicitly given, display a dialog asking
        // the user what to do
        if (changedFiles.length && shouldCopyDataFiles === undefined) {
          setDialogProps({isOpen: true, changedFiles});
          return;
        }

        const response = await fetchSaveOcdCleanupConfig(
          config,
          shouldCopyDataFiles
        );
        if (!response?.result?.success) {
          throw new Error(`Unexpected response: ${JSON.stringify(response)}`);
        }
        mutate(config);
      },
      [baseConfig, config, mutate]
    )
  );

  const hasChanges = !dequal(config, baseConfig);
  const setConfigSafe = useCallback(
    (configOrReducer: React.SetStateAction<OcdCleanupConfig>) =>
      setConfig(
        typeof configOrReducer === 'function'
          ? config => config && configOrReducer(config)
          : configOrReducer
      ),
    []
  );

  const isDisabled = !baseConfig || !config || isSaving;

  useEffect(
    () => setErrorToast('loadingError', loadingError, 'Cannot load config'),
    [loadingError]
  );
  useEffect(
    () => setErrorToast('savingError', savingError, 'Cannot save config'),
    [savingError]
  );
  useEffect(() => setSavingToast('isSaving', isSaving, 'Saving config...'), [
    isSaving,
  ]);

  const isMallMultiInputDisabled = isDisabled || !config?.canUseMallMulti;
  return (
    <>
      <DialogAskCopyOnSave
        onCancel={() => closeDialog()}
        onSaveWithCopy={() => {
          closeDialog();
          saveConfig(true);
        }}
        onSaveWithoutCopy={() => {
          closeDialog();
          saveConfig(false);
        }}
        {...dialogProps}
      />
      <H3>Configure Philter</H3>

      <fieldset className="PanelConfig__Section">
        <legend className="PanelConfig__SectionTitle">General settings</legend>

        <RadioGroup
          disabled={isDisabled}
          inline
          label="Empty closet first before cleanup:"
          onChange={useCallback(
            ({currentTarget: {value}}) => {
              const emptyClosetMode = Number(value);
              if (isOneOf(emptyClosetMode, [0, -1] as const)) {
                setConfigSafe(config => ({...config, emptyClosetMode}));
              }
            },
            [setConfigSafe]
          )}
          selectedValue={config?.emptyClosetMode}
        >
          <Radio
            className={!config ? Classes.SKELETON : undefined}
            label="Never"
            value={0}
          />
          <Radio
            className={!config ? Classes.SKELETON : undefined}
            label="Before Emptying Hangk's (recommended)"
            value={-1}
          />
        </RadioGroup>

        <Divider className="PanelConfig__Divider" />

        <RadioGroup
          disabled={isDisabled}
          inline
          label="Mall pricing: "
          onChange={useCallback(
            ({currentTarget: {value}}) => {
              if (isOneOf(value, ['auto', 'max'] as const)) {
                setConfigSafe(config => ({...config, mallPricingMode: value}));
              }
            },
            [setConfigSafe]
          )}
          selectedValue={config?.mallPricingMode}
        >
          <Radio
            className={!config ? Classes.SKELETON : undefined}
            label="Automatic"
            value="auto"
          />
          <Radio
            className={!config ? Classes.SKELETON : undefined}
            label={`${MAX_MALL_PRICE.toLocaleString()} meat (ignores "min price")`}
            value="max"
          />
        </RadioGroup>

        <Divider className="PanelConfig__Divider" />

        <Checkbox
          checked={Boolean(config?.simulateOnly)}
          className={!config ? Classes.SKELETON : undefined}
          disabled={isDisabled}
          onChange={({currentTarget: {checked}}) =>
            setConfigSafe(config => ({...config, simulateOnly: checked}))
          }
        >
          Simulate only <small>(no items will be cleaned up)</small>
        </Checkbox>
      </fieldset>

      <fieldset className="PanelConfig__Section">
        <legend className="PanelConfig__SectionTitle">Mall multi setup</legend>
        <Checkbox
          checked={Boolean(config?.canUseMallMulti)}
          className={!config ? Classes.SKELETON : undefined}
          disabled={isDisabled}
          onChange={({currentTarget: {checked}}) =>
            setConfigSafe(config => ({...config, canUseMallMulti: checked}))
          }
        >
          Use mall multi
        </Checkbox>
        <FormGroup
          className="PanelConfig__FormGroupAligned"
          disabled={isMallMultiInputDisabled}
          inline
          intent={
            !isMallMultiInputDisabled && !config?.mallMultiName
              ? 'warning'
              : undefined
          }
          label="Mall multi name:"
          helperText={
            !isMallMultiInputDisabled && !config?.mallMultiName
              ? 'No multi account'
              : ZWSP
          }
        >
          <InputGroup
            className={!config ? Classes.SKELETON : undefined}
            disabled={isMallMultiInputDisabled}
            onChange={({target: {value}}) =>
              setConfigSafe(config => ({...config, mallMultiName: value}))
            }
            placeholder={isMallMultiInputDisabled ? '' : 'Enter player name'}
            value={config?.mallMultiName || ''}
          />
        </FormGroup>
        <FormGroup
          className="PanelConfig__FormGroupAligned"
          disabled={isDisabled || !config?.canUseMallMulti}
          inline
          label="Mall multi Kmail text:"
        >
          <InputGroup
            className={!config ? Classes.SKELETON : undefined}
            disabled={isDisabled || !config?.canUseMallMulti}
            onChange={({target: {value}}) =>
              setConfigSafe(config => ({
                ...config,
                mallMultiKmailMessage: value,
              }))
            }
            placeholder={isMallMultiInputDisabled ? '' : 'Enter Kmail message'}
            value={config?.mallMultiKmailMessage || ''}
          />
        </FormGroup>
      </fieldset>

      <fieldset className="PanelConfig__Section">
        <legend className="PanelConfig__SectionTitle">Data files</legend>
        <FormGroup
          className="PanelConfig__FormGroupAligned"
          disabled={isDisabled}
          inline
          label="Ruleset file:"
        >
          <InputGroupAffixedFileName
            className={classNames(
              'PanelConfig_InputFileName',
              !config && Classes.SKELETON
            )}
            disabled={isDisabled}
            fileNamePrefix={OCD_RULESET_PREFIX}
            fileNameSuffix={TXT_SUFFIX}
            onChange={useCallback(
              ({target: {value}}) =>
                setConfigSafe(config => ({...config, dataFileName: value})),
              [setConfigSafe]
            )}
            value={config?.dataFileName || ''}
          />
        </FormGroup>
        <FormGroup
          className="PanelConfig__FormGroupAligned"
          disabled={isDisabled}
          inline
          label="Stock file:"
        >
          <InputGroupAffixedFileName
            className={classNames(
              'PanelConfig_InputFileName',
              !config && Classes.SKELETON
            )}
            disabled={isDisabled}
            fileNamePrefix={OCD_STOCK_PREFIX}
            fileNameSuffix={TXT_SUFFIX}
            onChange={useCallback(
              ({target: {value}}) =>
                setConfigSafe(config => ({...config, stockFileName: value})),
              [setConfigSafe]
            )}
            value={config?.stockFileName || ''}
          />
        </FormGroup>
      </fieldset>

      <ButtonGroup>
        <Button
          disabled={isDisabled || !hasChanges}
          icon="floppy-disk"
          onClick={useCallback(() => saveConfig(), [saveConfig])}
          text="Save"
        />
        <Button
          disabled={isDisabled || !hasChanges}
          icon="reset"
          onClick={useCallback(() => baseConfig && setConfig(baseConfig), [
            baseConfig,
          ])}
          text="Discard changes"
        />
      </ButtonGroup>
    </>
  );
};
