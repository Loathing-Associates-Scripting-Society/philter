# OCD Inventory Control

This is a fork of [OCD Inventory Control](https://kolmafia.us/threads/ocd-inventory-control.1818/) 3.10, created by Bale.

## Installing

To install this script, type the following into KoLmafia's gCLI:

```
svn checkout https://github.com/Loathing-Associates-Scripting-Society/OCD-Inventory-Control/trunk/release/
```

## Usage

OCD Inventory Control provides a relay script for configuration.

1. Open the relay browser. In the top menu, click the "-run script-" dropdown, then "OCD dB Manager".
2. If this is your first time, OCD will display "**All item information is corrupted or missing.**"
   Don't worry! Click on the "Add Items" tab to proceed.
4. You will be presented with a gigantic table of `(uncategorized)` items.
3. For each item, choose what you want to do with the item.
   - *You don't need to categorize everything now*. You can always come back and finish the list later.
4. When you're done, click the "Save All" button at the top (or bottom) of the table.
   - Your changes are not saved until you hit "Save All". To discard your changes, click any other link (e.g. Main Map) to exit the script.
   - You can also click the "Edit Database" tab to modify your choices.

To actually run OCD, go to KoLmafia's main UI. From the top menu, select "Scripts", then "OCD Inventory Control.ash". (You can also run it by typing <kbd>OCD Inventory Control</kbd> in the gCLI).

- If you haven't categorized all items yet, OCD asks you whether to continue. Click "Yes" to stop the script and go back to categorize other items. Click "No" to allow OCD to process items you have categorized.

## External Links

- Original OCD Inventory Control thread: https://kolmafia.us/threads/ocd-inventory-control.1818/
- Original OCD Inventory Control repository: https://sourceforge.net/projects/ocd.bale.p/
