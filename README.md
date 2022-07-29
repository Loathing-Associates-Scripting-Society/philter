# 🧹Philter

Philter is an inventory cleanup script for [KoLmafia](https://kolmafia.us/). Run Philter to sell and remove junk items you collected while exploring the Kingdom, after an ascension, or a day of farming.

Philter began as a fork of [OCD Inventory Control](https://kolmafia.us/threads/ocd-inventory-control.1818/) 3.10, created by Bale. Philter is mostly compatible with OCD Inventory Control; it uses the same settings and ruleset files used by OCD Inventory Control.

Report bugs and suggest new features in our [KoLmafia forum thread](https://kolmafia.us/threads/philter-the-inventory-cleanup-script.26027/) or the [issues board](https://github.com/Loathing-Associates-Scripting-Society/philter/issues).

## Installing

**Philter requires KoLmafia r20566 or later.** Download the latest version of KoLmafia by visiting [the latest build page](https://ci.kolmafia.us/job/Kolmafia/lastSuccessfulBuild/) and clicking the "KoLmafia-_NNNNN_.jar" link (where _NNNNN_ is the build number).

### New Users

To install Philter, enter the following into KoLmafia's graphical CLI ("gCLI"):

```
git checkout https://github.com/Loathing-Associates-Scripting-Society/philter.git main
```

### Migrating from OCD-Cleanup

We recently renamed our project to Philter. If you were using OCD-Cleanup, please follow the [renaming guide](https://github.com/Loathing-Associates-Scripting-Society/philter/blob/main/docs/renaming.md).

### Migrating from OCD Inventory Control

Philter can be installed together with OCD Inventory Control. Nevertheless, we recommend uninstalling OCD Inventory Control to avoid any potential problems:

```
svn delete bale-ocd
svn delete Loathing-Associates-Scripting-Society-OCD-Inventory-Control-trunk
```

Then install Philter as normal.

### Migrating from SVN to Git

With Mafia support now implemented for git you can now remove the old SVN repo and convert to git.

```
svn delete Loathing-Associates-Scripting-Society-philter-trunk-release
```

Then install Philter as normal.

## Usage

### 📝Create a ruleset

Philter requires a cleanup ruleset to work. To create one, follow these steps:

(_Note: These instructions are for the "new" Manager UI._)

1. Open the relay browser. In the top menu, click the "-run script-" dropdown, then "Philter Manager".
2. Click on the **Add Items** tab. You will see a table of uncategorized items.
3. For each item, click the "(uncategorized)" dropdown to select a cleanup action (autosell, mall sale, etc.).
   - You don't have to categorize everything now. You can always come back later to finish the job.
   - Some actions are not available on all items. For example, "Mall sale" cannot be used with untradable items.
4. When you're done, click the **Save all** button.
   - To cancel your changes, click **Discard changes**.
5. To modify existing rules, click the **Edit Rules** tab.

If you were using OCD Inventory Control, Philter will automatically use any ruleset files you already have.

### 🧹Cleanse your inventory

To run Philter, type in `philter` in the gCLI. This instructs Philter to look at your ruleset file and clean up items appropriately.

If you haven't categorized all items yet, Philter will ask you whether to continue. If you click "Yes", Philter will quit immediately. If you click "No", Philter will clean up _only those items that have rules in your ruleset file._

## Configuration

Philter can be configured using [ZLib] variables. To set a variable, type `zlib <variable name> = <value>` in the gCLI.

ℹ️ For backwards compatibility with OCD Inventory Control, Most variable names begin with `BaleOCD_`.

### `BaleOCD_MallMulti`

- Default value: (empty string)

Name of the mall multi account to use. This is used if it is not an empty string and [`BaleOCD_UseMallMulti`](#baleocd_usemallmulti) is `true`.

### `BaleOCD_UseMallMulti`

- Accepted values: `true` (default), `false`

If set to `true` and [`BaleOCD_MallMulti`](#baleocd_mallmulti) is not an empty string, Philter will send all "Mall sale" items to a mall multi account.

### `BaleOCD_MultiMessage`

- Accepted values: Any string
- Default value: `Mall multi dump`

Message to use when sending items to the mall multi.

### `BaleOCD_DataFile`

- Accepted values: Any string
- Default value: (Name of your character)

Specifies the name of the cleanup ruleset file.
For example, if `BaleOCD_DataFile = foobar`, then Philter will load cleanup rules from `OCDdata_foobar.txt`.

### `BaleOCD_StockFile`

- Accepted values: Any string
- Default value: (Name of your character)

Specifies the name of the stocking ruleset file.
For example, if `BaleOCD_StockFile = foobar`, then Philter will load the stocking rules from `OCDstock_foobar.txt`.

### `BaleOCD_Stock`

- Accepted values: `0` (default), `1`

If set to `1`, Philter will use the stocking ruleset file to stock up on items.

### `BaleOCD_Pricing`

- Accepted values: `auto` (default), `max`

Controls the pricing mode for "Mall sale" items.

If set to `auto`, Philter will use the lowest mall price for each item (returned by `historical_price()` or `mall_price()`, so it's actually the 5th lowest mall price), subject to minimum price rules.

If set to `max`, Philter will use the maximum mall price (999,999,999), or the current price if the item is already in your store.

### `BaleOCD_Sim`

- Accepted values: `false` (default), `true`

If set to `true`, Philter will run in simulation mode, reporting what items will be cleaned up without actually cleaning up or stocking items.

### `BaleOCD_EmptyCloset`

- Accepted values: `0` (default), `1`

If set to `1` and Hagnk's has not been emptied in the current ascension, Philter will take all items out of your closet for cleanup.
This setting is ignored if you have already emptied Hagnk's.

### `BaleOCD_EmptyHangks`

- Accepted values: `0` (default), `1`

This setting is currently unused. Philter will empty Hagnk's if KoLmafia's `autoSatisfyWithStorage` property is set to `true`.

### `BaleOCD_MallDangerously`

- Accepted values: `false` (default), `true`

If set to `true`, Philter will mallsell uncategorized items.

### `BaleOCD_RunIfRoninOrHC`

- Accepted values: `ask` (default), `never`, `always`

Controls how Philter behaves when your character is in Ronin/Hardcore.

- `ask`: Ask for confirmation to proceed.
- `never`: Philter will refuse to run (no prompts) if in Ronin/HC.
- `always`: Philter will always run, even if in Ronin/HC.

Note: This setting only takes effect when Philter is run directly.
It is not used when `ocd_control()` is called from another script.

## External Links

- Original OCD Inventory Control thread: https://kolmafia.us/threads/ocd-inventory-control.1818/
- Original OCD Inventory Control repository: https://sourceforge.net/projects/ocd.bale.p/

[zlib]: https://kolmafia.us/threads/zlib-zarqons-useful-function-library.2072
