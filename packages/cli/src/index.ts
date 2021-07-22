import {
  checkProjectUpdates,
  loadCleanupConfig,
  logger,
  setDefaultConfig,
} from '@philter/common/kol';
import {canInteract, userConfirm, wait} from 'kolmafia';
import {getvar, rnum} from 'zlib.ash';
import {philter} from './philter';

/**
 * Check if your character is in Ronin/Hardcore. If so, ask for confirmation to
 * proceed.
 * @return Whether Philter should be executed now
 */
function canInteractCheck(): boolean {
  if (canInteract()) return true;

  const action = getvar('BaleOCD_RunIfRoninOrHC');
  if (action === 'never') return false;
  if (action === 'always') return true;

  logger.info('Ronin/Hardcore detected. Asking confirmation to proceed...');
  return userConfirm(
    'You are in Ronin/Hardcore. Do you want to run Philter anyway?'
  );
}

// TODO: Parse CLI arguments, merge them with ZLib configs, and make the rest of
// the app use the merged config instead of accessing settings directly.
export function main(): void {
  // TODO: Remove this warning when ocd-cleanup.ash is deprecated
  logger.warn(
    'Philter.js is currently in alpha. It may contain bugs which could destroy your items.'
  );
  logger.warn(
    "If you want to stay on the safe side, halt this script and run 'ocd-cleanup.ash' instead."
  );
  wait(10);

  setDefaultConfig();
  checkProjectUpdates();

  if (!canInteractCheck()) {
    logger.error("Whoa! Don't run this until you break the prism!");
    return;
  }

  const meatGain = philter(Object.freeze(loadCleanupConfig()));
  if (meatGain < 0) {
    logger.error('Philter was unable to cleanse your inventory.');
  } else if (meatGain === 0)
    logger.warn('Nothing to do. I foresee no additional meat in your future.');
  else {
    logger.success(
      `Anticipated monetary gain from inventory cleansing: ${rnum(
        meatGain
      )} meat.`
    );
  }
}
