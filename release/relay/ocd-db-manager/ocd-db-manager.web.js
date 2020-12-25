/**
 * @file Supporting script for relay_OCD_dB_Manager.ash.
 * This is meant to be served to a web browser, not executed by KoLmafia!
 */

/**
 * Open a small popup showing an item's in-game description.
 * @param {number | string} desc Item descid
 */
function descitem(desc) {
  newwindow = window.open(
    "/desc_item.php?whichitem=" + desc,
    "name",
    "height=200,width=214"
  );
  if (window.focus) {
    newwindow.focus();
  }
}

/**
 * Open a new window showing the KoL wiki page for an item.
 * @param {string} desc Item name (= KoL wiki page name)
 */
function wikiitem(desc) {
  newwindow = window.open(
    "https://kol.coldfront.net/thekolwiki/index.php/Special:Search?search=" +
      desc +
      "&go=Go"
  );
  if (window.focus) {
    newwindow.focus();
  }
}
