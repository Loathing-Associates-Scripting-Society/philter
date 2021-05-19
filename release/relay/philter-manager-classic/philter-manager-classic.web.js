/**
 * @file Supporting script for Philter Manager classic.
 * This is meant to be served to a web browser, not executed by KoLmafia!
 */

/**
 * Open a small popup showing an item's in-game description.
 * @param {number | string} desc Item descid
 */
// eslint-disable-next-line no-unused-vars
function descitem(desc) {
  const newwindow = window.open(
    '/desc_item.php?whichitem=' + desc,
    'name',
    'height=200,width=214'
  );
  if (window.focus) {
    newwindow.focus();
  }
}

/**
 * Open a new window showing the KoL wiki page for an item.
 * @param {string} desc Item name (= KoL wiki page name)
 */
// eslint-disable-next-line no-unused-vars
function wikiitem(desc) {
  const popupWindow = window.open(
    'https://kol.coldfront.net/thekolwiki/index.php/Special:Search?search=' +
      desc +
      '&go=Go'
  );
  if (window.focus) {
    popupWindow.focus();
  }
}
