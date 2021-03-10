# OCD-Cleanup

OCD-Cleanup allows you to configure how to sell, pulverize, use, or dispose every item in KoL.

OCD-Cleanup is a fork of [OCD Inventory Control](https://kolmafia.us/threads/ocd-inventory-control.1818/) 3.10, created by Bale.

## Installing

**OCD-Cleanup requires KoLmafia r20566 or later.**

### Migrating from OCD Inventory Control

If you are upgrading from Bale's original script, run the following commands in KoLmafia to delete old versions of OCD:

```
svn delete bale-ocd
svn delete Loathing-Associates-Scripting-Society-OCD-Inventory-Control-trunk
```

Then proceed below.

### New Users

To install OCD-Cleanup, type the following into KoLmafia's gCLI:

```
svn checkout https://github.com/Loathing-Associates-Scripting-Society/OCD-Cleanup/trunk/release/
```

## Usage

OCD-Cleanup provides a relay script for configuration.

1. Open the relay browser. In the top menu, click the "-run script-" dropdown, then "OCD-Cleanup Manager".
2. If this is your first time, you will see "**All item information is corrupted or missing.**"
   Don't worry! This is normal.
3. Click on the "Add Items" tab. You will see a table of uncategorized items.
4. Select what you want to do (autosell, mall, etc.) for each item. Note that you can always come back and do this later.
5. When you're done, click the "Save All" button.
   - Your changes are not saved until you hit "Save All". To discard your changes, click any other link (e.g. Main Map) to exit the script.
   - You can also click the "Edit Database" tab to modify your choices.

To actually run OCD, go to KoLmafia's main UI. From the top menu, select "Scripts", then "ocd-cleanup.ash". (You can also run it by typing `ocd-cleanup` in the gCLI).

- If you haven't categorized all items yet, OCD asks you whether to continue. Click "Yes" to stop the script and go back to categorize other items. Click "No" to allow OCD to process items you have categorized.

## Configuration

OCD-Cleanup can be configured using [ZLib] variables. To set a variable, type
`zlib <variable name> = <value>` in the gCLI.

Note: For backwards compatibility with OCD Inventory Control, most variable
names begin with `BaleOCD_`.

### `BaleOCD_MallMulti`

- Default value: (empty string)

Name of the mall multi account to use. This is used if it is not an empty string
and [`BaleOCD_UseMallMulti`](#baleocd_usemallmulti) is `true`.

### `BaleOCD_UseMallMulti`

- Accepted values: `true` (default), `false`

If set to `true` and [`BaleOCD_MallMulti`](#baleocd_mallmulti) is not an empty
string, OCD-Cleanup will send all "Mall sale" items to a mall multi account.

### `BaleOCD_MultiMessage`

- Accepted values: Any string
- Default value: `Mall multi dump`

Message to use when sending items to the mall multi.

### `BaleOCD_DataFile`

- Accepted values: Any string
- Default value: (Name of your character)

Specifies the name of the OCD ruleset file.
For example, if `BaleOCD_DataFile = foobar`, then OCD-Cleanup will load OCD
rules from `OCDdata_foobar.txt`.

### `BaleOCD_StockFile`

- Accepted values: Any string
- Default value: (Name of your character)

Specifies the name of the OCD stocking ruleset file.
For example, if `BaleOCD_StockFile = foobar`, then OCD-Cleanup will load the OCD
stocking rules from `OCDstock_foobar.txt`.

### `BaleOCD_Stock`

- Accepted values: `0` (default), `1`

If set to `1`, OCD-Cleanup will use the stocking ruleset file to stock up on
items.

### `BaleOCD_Pricing`

- Accepted values: `auto` (default), `max`

Controls the pricing mode for "Mall sale" items.

If set to `auto`, OCD-Cleanup will use the lowest mall price for each item
(returned by `historical_price()` or `mall_price()`, so it's actually the 5th
lowest mall price), subject to minimum price rules.

If set to `max`, OCD-Cleanup will use the maximum mall price (999,999,999), or
the current price if the item is already in your store.

### `BaleOCD_Sim`

- Accepted values: `false` (default), `true`

If set to `true`, OCD-Cleanup will run in simulation mode, reporting what items
will be cleaned up without actually cleaning up or stocking items.

### `BaleOCD_EmptyCloset`

- Accepted values: `0` (default), `1`

If set to `1` and Hagnk's has not been emptied in the current ascension,
OCD-Cleanup will take all items out of your closet for cleanup.
This setting is ignored if you have already emptied Hagnk's.

### `BaleOCD_EmptyHangks`

- Accepted values: `0` (default), `1`

This setting is currently unused. OCD-Cleanup will empty Hagnk's if KoLmafia's
`autoSatisfyWithStorage` property is set to `true`.

### `BaleOCD_MallDangerously`

- Accepted values: `false` (default), `true`

If set to `true`, OCD-Cleanup will mallsell uncategorized items.

### `BaleOCD_RunIfRoninOrHC`

- Accepted values: `ask` (default), `never`, `always`

Controls how OCD-Cleanup behaves when your character is in Ronin/Hardcore.

- `ask`: Ask for confirmation to proceed.
- `never`: OCD-Cleanup will refuse to run (no prompts) if in Ronin/HC.
- `always`: OCD-Cleanup will always run, even if in Ronin/HC.

Note: This setting only takes effect when OCD-Cleanup is run directly.
It is not used when `ocd_control()` is called from another script.

## External Links

- Original OCD Inventory Control thread: https://kolmafia.us/threads/ocd-inventory-control.1818/
- Original OCD Inventory Control repository: https://sourceforge.net/projects/ocd.bale.p/

[zlib]: https://kolmafia.us/threads/zlib-zarqons-useful-function-library.2072
