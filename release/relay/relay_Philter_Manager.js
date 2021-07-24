'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var kolmafia = require('kolmafia');
var zlib_ash = require('zlib.ash');
var philter_util_ash = require('philter.util.ash');

/**
 * @file Defines base types for API requests and responses.
 */
function isValidRequestMethod(value) {
    return value === 'get' || value === 'patch' || value === 'post';
}
function isRequestBasePropertyName(value) {
    return value === 'method' || value === 'path';
}
/**
 * Converts a flat object to a `RequestBase`.
 *
 * A server should call this on the return value of `formFields()`
 * (analogous to `request.body` in Express.js).
 * @param wrappedRequest Wrapped request object
 * @throws {Error} If any `RequestBase` properties are missing or invalid
 */
function unwrapDeserializedRequest(wrappedRequest) {
    // Cast to Partial<> so that TypeScript type-checks our property access
    var uncheckedRequest = wrappedRequest;
    if (typeof uncheckedRequest.method !== 'string') {
        throw new Error('Missing URL/form parameter: method');
    }
    else if (!isValidRequestMethod(uncheckedRequest.method)) {
        throw new Error(("Invalid URL/form parameter: method=" + (uncheckedRequest.method)));
    }
    if (typeof uncheckedRequest.path !== 'string') {
        throw new Error('Missing URL/form parameter: path');
    }
    var request = {};
    for (var key of Object.keys(wrappedRequest)) {
        // Known keys are passed as-is.
        // All other keys are deserialized.
        request[key] = isRequestBasePropertyName(key)
            ? wrappedRequest[key]
            : JSON.parse(wrappedRequest[key]);
    }
    return request;
}

/**
 * @file Defines routes for Cleanup Tables.
 */
var CLEANUP_TABLES_CATEGORIZED_ROUTE = '/cleanup-tables/categorized';
var CLEANUP_TABLES_UNCATEGORIZED_ROUTE = '/cleanup-tables/uncategorized';

/**
 * @file Defines requests and responses for Philter settings.
 */
var CONFIG_ROUTE = '/config';

/**
 * @file Defines requests and responses for the player's inventory state.
 */
var INVENTORY_ROUTE = '/inventory';

/**
 * @file Defines requests and responses for rulesets.
 */
var RULESET_ROUTE = '/ruleset';

/**
 * @file Endpoint for general statistics about Philter.
 */
var STATISTICS_ROUTE = '/statistics';

/**
 * @file Provides constants necessary for piecing the application together.
 */
/**
 * Relative path to the directory that contains assets (HTML, CSS, JS) for
 * Philter Manager.
 */
var RELAY_DIR = '/philter-manager';
/**
 * Name of the entrypoint HTML file.
 * The relay API script will serve this page to the user.
 */
var RELAY_HTML_FILE = 'philter-manager.index.html';
/**
 * Relative path to the HTML skeleton page for Philter Manager.
 * The relay API script will serve this page to the user.
 */
var RELAY_HTML_PATH = RELAY_DIR + "/" + RELAY_HTML_FILE;

/**
 * Object whose keys are string values that make up the `CleanupAction` type.
 * Also used to check at runtime if a string belongs to `CleanupAction`.
 * The values are unused; they can be anything.
 */
var _cleanupActions = Object.freeze({
    AUTO: 0,
    BREAK: 0,
    CLAN: 0,
    CLST: 0,
    DISC: 0,
    DISP: 0,
    GIFT: 0,
    KEEP: 0,
    MAKE: 0,
    MALL: 0,
    PULV: 0,
    TODO: 0,
    UNTN: 0,
    USE: 0,
});
/**
 * Checks if the given value is a valid `CleanupAction` type.
 */
var isCleanupAction = (value) => typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(_cleanupActions, value);

/**
 * @file Provides methods for logging colored text.
 */
function error(message) {
    zlib_ash.vprint(message, kolmafia.isDarkMode() ? '#ff0033' : '#cc0033', 1);
}
function warn(message) {
    zlib_ash.vprint(message, kolmafia.isDarkMode() ? '#cc9900' : '#cc6600', 2);
}
function success(message) {
    zlib_ash.vprint(message, kolmafia.isDarkMode() ? '#00cc00' : '#008000', 2);
}
function debug(message) {
    zlib_ash.vprint(message, '#808080', 6);
}

function checkProjectUpdates() {
    // Check version! This will check both scripts and data files.
    // This code is at base level so that the relay script's importation will automatically cause it to be run.
    var PROJECT_NAME = 'Loathing-Associates-Scripting-Society-philter-trunk-release';
    if (kolmafia.svnExists(PROJECT_NAME) &&
        kolmafia.getProperty('_svnUpdated') === 'false' &&
        kolmafia.getProperty('_ocdUpdated') !== 'true') {
        if (!kolmafia.svnAtHead(PROJECT_NAME)) {
            warn('Philter has become outdated. Automatically updating from SVN...');
            kolmafia.cliExecute(("svn update " + PROJECT_NAME));
            success("On the script's next invocation it will be up to date.");
        }
        kolmafia.setProperty('_ocdUpdated', 'true');
    }
}

/**
 * Factory function for functions that parse a text file into a Map using
 * KoLmafia's file I/O API.
 * Any comments and empty lines in the text file are ignored.
 * @param parse Callback used to parse each row.
 *    The callback may accept the following arguments:
 *
 *    - `row`: Array of strings representing each cell
 *    - `rowNum`: Row number, _starts at 1_
 *    - `filename`: Path to the text file being parsed
 *
 *    The callback must return a tuple of `[key, value]`.
 *    If the row is malformed, the callback may throw an exception.
 * @return Function that accepts a file name as a parameter, and returns a Map.
 *    If the file cannot be found or is empty, this function will return an
 *    empty map.
 */
function createMapLoader(parse) {
    return (filename) => {
        var entries = new Map();
        var rawData = kolmafia.fileToArray(filename);
        for (var indexStr of Object.keys(rawData)) {
            var row = rawData[indexStr].split('\t');
            var ref = parse(row, Number(indexStr), filename);
            var key = ref[0];
            var value = ref[1];
            entries.set(key, value);
        }
        return entries.size ? entries : null;
    };
}
/**
 * Encodes an item object as a string for saving to a data (TXT) file.
 */
function encodeItem(item) {
    return ("[" + (kolmafia.toInt(item)) + "]" + (item.name));
}
/**
 * Converts an object to a Map, converting each key to an `Item` object.
 * @param items Object whose keys are item names
 * @return Mapping of Item to amount
 */
function toItemMap(items) {
    return new Map(Object.keys(items).map(itemStr => [Item.get(itemStr), items[itemStr]]));
}

/**
 * @file Tools for manipulating cleanup ruleset files.
 */
/**
 * Loads a cleanup ruleset from a text file into a Map.
 * @param filename Path to the data file
 * @return Map of each item to its cleanup rule. If the user's cleanup ruleset
 *    file is empty or missing, returns `null`.
 * @throws {TypeError} If the file contains invalid data
 */
var loadCleanupRulesetFile = createMapLoader((ref, _, filename) => {
    var itemName = ref[0];
    var action = ref[1];
    var keepAmountStr = ref[2];
    var info = ref[3];
    var message = ref[4];

    if (!isCleanupAction(action)) {
        throw new TypeError((action + " is not a valid cleanup action (file: " + filename + ", entry: " + itemName + ")"));
    }
    var rule;
    if (action === 'GIFT') {
        rule = { action: action, recipent: info, message: message };
    }
    else if (action === 'MAKE') {
        rule = {
            action: action,
            targetItem: info,
            shouldUseCreatableOnly: kolmafia.toBoolean(message),
        };
    }
    else if (action === 'MALL') {
        var minPrice = Number(info);
        if (!Number.isInteger(minPrice)) {
            throw new TypeError(("Invalid minimum price " + minPrice + " for MALL rule (file: " + filename + ", entry: " + itemName + ")"));
        }
        rule = { action: action, minPrice: minPrice };
    }
    else if (action === 'TODO') {
        // Curiously, Philter stores the message in the 'info' field
        rule = { action: action, message: info };
    }
    else {
        rule = { action: action };
    }
    var keepAmount = Number(keepAmountStr);
    if (!Number.isInteger(keepAmount)) {
        throw new TypeError(("Invalid keep amount " + keepAmountStr + " (file: " + filename + ", entry: " + itemName + ")"));
    }
    if (keepAmount > 0) {
        rule.keepAmount = keepAmount;
    }
    return [kolmafia.toItem(itemName), rule];
});
/**
 * Saves a Map containing a cleanup ruleset to a text file.
 * @param filepath Path to the data file
 * @param cleanupRulesMap Map of each item to its item info
 */
function saveCleanupRulesetFile(filepath, cleanupRulesMap) {
    // Sort entries by item ID in ascending order when saving
    var buffer = Array.from(cleanupRulesMap.entries())
        .sort((ref, ref$1) => {
            var itemA = ref[0];
            var itemB = ref$1[0];

            return kolmafia.toInt(itemA) - kolmafia.toInt(itemB);
    })
        .map((ref) => {
        var item = ref[0];
        var rule = ref[1];

        var info = '', message = '';
        if (rule.action === 'GIFT') {
            info = rule.recipent;
            message = rule.message;
        }
        else if (rule.action === 'MAKE') {
            info = rule.targetItem;
            message = String(rule.shouldUseCreatableOnly);
        }
        else if (rule.action === 'MALL') {
            info = rule.minPrice ? String(rule.minPrice) : '';
        }
        else if (rule.action === 'TODO') {
            info = rule.message;
        }
        return [
            encodeItem(item),
            rule.action,
            rule.keepAmount || 0,
            info,
            message ].join('\t');
    })
        .join('\n');
    return kolmafia.bufferToFile(buffer, filepath);
}

/**
 * Checks if an item can be cleaned up by Philter.
 *
 * Generally, this rejects most items that cannot be put in the display case
 * (e.g. quest items). However, several items that Philter knows how to handle
 * are exempt from this rule.
 * @param item Item to check
 * @return Whether the item can be cleaned up by Philter
 */
function isCleanable(it) {
    // For some reason Item.get("none") is displayable
    if (it === Item.get('none'))
        { return false; }
    if (Item.get([
        "Boris's key",
        "Jarlsberg's key",
        "Richard's star key",
        "Sneaky Pete's key",
        'digital key',
        "the Slug Lord's map",
        "Dr. Hobo's map",
        "Dolphin King's map",
        'Degrassi Knoll shopping list',
        '31337 scroll',
        'dead mimic',
        "fisherman's sack",
        'fish-oil smoke bomb',
        'vial of squid ink',
        'potion of fishy speed',
        'blessed large box' ]).includes(it)) {
        return true;
    }
    // Let these hide in your inventory until it is time for them to strike!
    // TODO: Revisit how this is handled.
    // Since a player can have multiple DNOTC boxes from different years, and we
    // don't know the associated year of a DNOTC box, our best bet is to try
    // opening them all.
    if (it === Item.get('DNOTC Box')) {
        var today = kolmafia.todayToString();
        if (today.slice(4, 6) === '12' && Number(today.slice(6, 8)) < 25) {
            return false;
        }
    }
    return kolmafia.isDisplayable(it);
}

/**
 * @file Tools for loading and manipulating Philter configuration.
 */
/**
 * Namespace object that maps each config key to their ZLib variable name.
 */
var CONFIG_NAMES = Object.freeze({
    emptyClosetMode: 'BaleOCD_EmptyCloset',
    simulateOnly: 'BaleOCD_Sim',
    mallPricingMode: 'BaleOCD_Pricing',
    mallMultiName: 'BaleOCD_MallMulti',
    mallMultiKmailMessage: 'BaleOCD_MultiMessage',
    canUseMallMulti: 'BaleOCD_UseMallMulti',
    dataFileName: 'BaleOCD_DataFile',
    stockFileName: 'BaleOCD_StockFile',
});
/**
 * Sets up default values for config variables (powered by ZLib).
 */
function setDefaultConfig() {
    zlib_ash.setvar(CONFIG_NAMES.mallMultiName, '');
    zlib_ash.setvar(CONFIG_NAMES.canUseMallMulti, true);
    zlib_ash.setvar(CONFIG_NAMES.mallMultiKmailMessage, 'Mall multi dump');
    zlib_ash.setvar(CONFIG_NAMES.dataFileName, kolmafia.myName());
    zlib_ash.setvar(CONFIG_NAMES.stockFileName, kolmafia.myName());
    zlib_ash.setvar(CONFIG_NAMES.mallPricingMode, 'auto');
    zlib_ash.setvar(CONFIG_NAMES.simulateOnly, false);
    zlib_ash.setvar(CONFIG_NAMES.emptyClosetMode, kolmafia.toInt(0)); // Needed to coerce JS number to ASH int
    // ZLib variables that are not exposed yet
    // TODO: Load and save these variables, too
    // Should items be acquired for stock (0: no, 1: yes)
    zlib_ash.setvar('BaleOCD_Stock', kolmafia.toInt(0)); // Needed to coerce JS number to ASH int
    // Should Hangk's Storange be emptied? (0: no, 1: yes)
    zlib_ash.setvar('BaleOCD_EmptyHangks', kolmafia.toInt(0)); // Needed to coerce JS number to ASH int
    // Whether to mallsell any uncategorized items (DANGEROUS)
    zlib_ash.setvar('BaleOCD_MallDangerously', false);
    // Controls whether to run OCD-Cleanup if the player is in Ronin/Hardcore.
    // -"ask": Ask the user
    // -"never": Never run if in Ronin/Hardcore
    // -"always": Always run, even if in Ronin/Hardcore
    zlib_ash.setvar('BaleOCD_RunIfRoninOrHC', 'ask');
}
// TODO: Validate the return values of getvar(). If they have unexpected values,
// print a warning and use default values
// TODO: Print debug message for each config loaded
function loadCleanupConfig() {
    var emptyClosetMode = parseInt(zlib_ash.getvar(CONFIG_NAMES.emptyClosetMode));
    var mallPricingMode = zlib_ash.getvar(CONFIG_NAMES.mallPricingMode);
    // TODO: Load more ZLib vars here
    // (we don't have to expose them via the web UI; we can only expose configs we
    // want to allow editing)
    return {
        emptyClosetMode: emptyClosetMode === 0 || emptyClosetMode === -1 ? emptyClosetMode : 0,
        simulateOnly: kolmafia.toBoolean(zlib_ash.getvar(CONFIG_NAMES.simulateOnly)),
        mallPricingMode: mallPricingMode === 'auto' || mallPricingMode === 'max'
            ? mallPricingMode
            : 'auto',
        mallMultiName: zlib_ash.getvar(CONFIG_NAMES.mallMultiName),
        mallMultiKmailMessage: zlib_ash.getvar(CONFIG_NAMES.mallMultiKmailMessage),
        canUseMallMulti: kolmafia.toBoolean(zlib_ash.getvar(CONFIG_NAMES.canUseMallMulti)),
        dataFileName: zlib_ash.getvar(CONFIG_NAMES.dataFileName),
        stockFileName: zlib_ash.getvar(CONFIG_NAMES.stockFileName),
    };
}
function saveCleanupConfig(config) {
    var serializedConfig = {};
    for (var key of Object.keys(config)) {
        var varName = CONFIG_NAMES[key];
        if (varName === undefined) {
            throw new Error(("Cannot find ZLib config name for config key '" + key + "'"));
        }
        serializedConfig[varName] = String(config[key]);
    }
    philter_util_ash._updateZlibVars(serializedConfig);
}

/**
 * @file Tools for manipulating stocking ruleset files.
 */
/**
 * Loads a stocking ruleset from a text file into a map.
 * @param fileName Path to the data file
 * @return Map of each item to its stocking rule. If the user's stocking ruleset
 *    file is empty or missing, returns `null`.
 * @throws {TypeError} If the file contains invalid data
 */
var loadStockingRulesetFile = createMapLoader((ref, _, fileName) => {
    var itemName = ref[0];
    var type = ref[1];
    var amountStr = ref[2];
    var category = ref[3]; if ( category === void 0 ) category = '';

    var amount = Number(amountStr);
    if (!Number.isInteger(amount)) {
        throw new TypeError(("Invalid stock-up amount (" + amount + ") for item '" + itemName + "' in file '" + fileName + "'"));
    }
    return [kolmafia.toItem(itemName), { type: type, amount: amount, category: category }];
});
/**
 * Saves a map containing a stocking ruleset to a text file.
 * @param filepath Path to the data file
 * @param stockingRulesMap Map of each item to its stocking rule
 */
function saveStockingRulesetFile(filepath, stockingRulesMap) {
    // Sort entries by item ID in ascending order when saving
    var buffer = Array.from(stockingRulesMap.entries())
        .sort((ref, ref$1) => {
            var itemA = ref[0];
            var itemB = ref$1[0];

            return kolmafia.toInt(itemA) - kolmafia.toInt(itemB);
    })
        .map((ref) => {
            var item = ref[0];
            var rule = ref[1];

            return [encodeItem(item), rule.type, rule.amount, rule.category].join('\t');
    })
        .join('\n');
    if (!kolmafia.bufferToFile(buffer, filepath)) {
        throw new Error(("Failed to save to " + filepath));
    }
}

/**
 * @file Tools for managing `PhilterConfig` objects.
 */
/**
 * Get the full file name of a cleanup ruleset file, including the prefix and
 * file extension.
 */
function getFullDataFileName(fileNameComponent) {
    return ("OCDdata_" + fileNameComponent + ".txt");
}
/**
 * Get the full file name of a cleanup stocking ruleset file, including the
 * prefix and file extension.
 */
function getFullStockFileName(fileNameComponent) {
    return ("OCDstock_" + fileNameComponent + ".txt");
}

/**
 * @file Tools for managing `CleanupRuleset` objects.
 */
/**
 * Loads the cleanup ruleset from the ruleset file of the current player.
 * @return Map of each item to its cleanup rule. If the user's cleanup ruleset
 *    file is empty or missing, returns `null`.
 */
function loadCleanupRulesetForCurrentPlayer() {
    var cleanupRulesMap = loadCleanupRulesetFile(getFullDataFileName(zlib_ash.getvar(CONFIG_NAMES.dataFileName)));
    if (!cleanupRulesMap || cleanupRulesMap.size === 0) {
        // Legacy file name
        // TODO: We inherited this from OCD Inventory Manager. Since nobody seems to
        // be using this anymore, we can probably remove it.
        cleanupRulesMap = loadCleanupRulesetFile(("OCD_" + (kolmafia.myName()) + ".txt"));
    }
    return cleanupRulesMap;
}
/**
 * Writes the stocking ruleset to the ruleset file of the current player.
 * @param cleanupRulesMap Stocking ruleset to save
 */
function saveCleanupRulesetForCurrentPlayer(cleanupRulesMap) {
    return saveCleanupRulesetFile(getFullDataFileName(zlib_ash.getvar(CONFIG_NAMES.dataFileName)), cleanupRulesMap);
}

/**
 * @file General-purpose utilities for KoLmafia scripts.
 */
var _MONTH_STR = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec' ];
/**
 * Converts a given date to Common Log Format string.
 */
function formatDateClf(date) {
    // Example format: 05/Apr/2021:15:22:30 +0900
    var dd = String(date.getDate()).padStart(2, '0');
    var mon = _MONTH_STR[date.getMonth()];
    var yyyy = date.getFullYear();
    var hh = String(date.getHours()).padStart(2, '0');
    var mm = String(date.getMinutes()).padStart(2, '0');
    var ss = String(date.getSeconds()).padStart(2, '0');
    var tzOffset = date.getTimezoneOffset();
    var tz_hh = String(Math.floor(Math.abs(tzOffset) / 60)).padStart(2, '0');
    var tz_mm = String(Math.abs(tzOffset) % 60).padStart(2, '0');
    // Displayed time zone sign must be reversed
    var timezone = "" + (tzOffset >= 0 ? '-' : '+') + tz_hh + tz_mm;
    return (dd + "/" + mon + "/" + yyyy + ":" + hh + ":" + mm + ":" + ss + " " + timezone);
}
/**
 * Converts a regular JavaScript object keyed by item IDs to an ES6 Map keyed by
 * `Item` objects.
 */
function idMappingToItemMap(itemMapping) {
    return new Map(Object.keys(itemMapping).map(itemId => [
        Item.get(Number(itemId)),
        itemMapping[itemId] ]));
}
/**
 * Converts an ES6 Map keyed by `Item` objects to a regular JavaScript object
 * keyed by item IDs.
 */
function itemMapToIdMapping(itemMap) {
    var itemMapping = {};
    for (var [item, value] of itemMap) {
        itemMapping[kolmafia.toInt(item)] = value;
    }
    return itemMapping;
}

/**
 * @file Tools for managing `InventoryState` objects.
 */
/**
 * Returns an ES6 Map of all items in the current player's display case.
 */
function getDisplayCaseMap() {
    // There is no equivalent of getInventory(), getCloset(), etc.
    var displayCaseMap = new Map();
    if (kolmafia.haveDisplay()) {
        for (var item of Item.all()) {
            var amount = kolmafia.displayAmount(item);
            if (amount > 0) {
                displayCaseMap.set(item, amount);
            }
        }
    }
    return displayCaseMap;
}
/**
 * Retrieves the player's current inventory state.
 */
function getInventoryStateMaps() {
    return {
        closet: toItemMap(kolmafia.getCloset()),
        displayCase: getDisplayCaseMap(),
        inventory: toItemMap(kolmafia.getInventory()),
        storage: toItemMap(kolmafia.getStorage()),
    };
}
/**
 * Retrieves the player's current inventory state.
 */
function getInventoryState() {
    return {
        closet: itemMapToIdMapping(toItemMap(kolmafia.getCloset())),
        displayCase: itemMapToIdMapping(getDisplayCaseMap()),
        inventory: itemMapToIdMapping(toItemMap(kolmafia.getInventory())),
        storage: itemMapToIdMapping(toItemMap(kolmafia.getStorage())),
    };
}
/**
 * Retrieves the player's current inventory state, as well as a set of all
 * items in inventory/closet/display case/storage.
 * (the latter is a performance optimization).
 * @return `Tuple of [InventoryState, InventoryStateMap]`.
 *    `itemsSeen` is a `Set<Item>` containing all items in `InventoryState`
 */
function getInventoryStateWithMaps() {
    var inventoryStateMap = getInventoryStateMaps();
    return [
        {
            closet: itemMapToIdMapping(inventoryStateMap.closet),
            displayCase: itemMapToIdMapping(inventoryStateMap.displayCase),
            inventory: itemMapToIdMapping(inventoryStateMap.inventory),
            storage: itemMapToIdMapping(inventoryStateMap.storage),
        },
        inventoryStateMap ];
}

/**
 * @file Tools for managing `ItemInfo` objects.
 */
var BREAKABLE_ITEMS = Item.get([
    'BRICKO hat',
    'BRICKO sword',
    'BRICKO pants' ]);
function isBreakable(item) {
    return BREAKABLE_ITEMS.includes(item);
}
/** Cache used by `isCraftable()` */
var CRAFTABLES = new Set();
/**
 * Checks if the given item can be crafted into another item.
 * @param item Item to check
 * @return Whether `item` is an ingredient
 */
function isCraftable(item) {
    if (CRAFTABLES.size === 0) {
        // Populate the cache on first call
        var rawCrafty = kolmafia.fileToArray('data/concoctions.txt');
        for (var key of Object.keys(rawCrafty)) {
            var row = rawCrafty[key].split('\t');
            // We assume that concoctions.txt looks like this:
            //
            //    <produced item> <TAB> <crafting method> <TAB> <tab-separated list of ingredients>
            var ingredients = row.slice(2);
            for (var ingredientName of ingredients) {
                CRAFTABLES.add(kolmafia.toItem(ingredientName));
            }
        }
        for (var item$1 of Item.get([
            'hot nuggets',
            'cold nuggets',
            'spooky nuggets',
            'stench nuggets',
            'sleaze nuggets',
            'titanium assault umbrella' ])) {
            CRAFTABLES.add(item$1);
        }
    }
    return CRAFTABLES.has(item);
}
var USELESS_POWDER = Item.get('useless powder');
var MALUSABLES = new Set(Item.get([
    'twinkly powder',
    'hot powder',
    'cold powder',
    'spooky powder',
    'stench powder',
    'sleaze powder',
    'twinkly nuggets',
    'hot nuggets',
    'cold nuggets',
    'spooky nuggets',
    'stench nuggets',
    'sleaze nuggets',
    'sewer nuggets',
    'floaty sand',
    'floaty pebbles',
    'floaty gravel' ]));
function isPulverizable(item) {
    var pulvy = toItemMap(kolmafia.getRelated(item, 'pulverize'));
    return !pulvy.has(USELESS_POWDER) && (pulvy.size > 0 || MALUSABLES.has(item));
}
/**
 * Converts a native `Item` to an `ItemInfo` object.
 */
function toItemInfo(item) {
    return {
        canAutosell: item.discardable && kolmafia.autosellPrice(item) > 0,
        canBreak: isBreakable(item),
        canCloset: kolmafia.isDisplayable(item),
        canDiscard: item.discardable,
        canDisplay: kolmafia.isDisplayable(item),
        canGift: kolmafia.isGiftable(item),
        canMake: isCraftable(item),
        canMall: item.tradeable,
        canPulverize: isPulverizable(item),
        canStash: kolmafia.isGiftable(item),
        canUntinker: kolmafia.craftType(item) === 'Meatpasting',
        canUse: item.usable || item.multi,
        descid: item.descid,
        id: kolmafia.toInt(item),
        image: item.image,
        isMallPriceAtMinimum: kolmafia.historicalPrice(item) <= Math.max(kolmafia.autosellPrice(item) * 2, 100),
        isTradable: item.tradeable,
        mallPrice: kolmafia.historicalPrice(item) || null,
        name: item.name,
    };
}

/**
 * @file Tools for managing `StockingRuleset` objects.
 */
/**
 * Loads the stocking ruleset from the stocking ruleset file of the current
 * player.
 * @return Map of each item to its stocking rule. If the user's stocking ruleset
 *    file is empty or missing, returns `null`.
 */
function loadStockingRulesetForCurrentPlayer() {
    return loadStockingRulesetFile(getFullStockFileName(zlib_ash.getvar(CONFIG_NAMES.stockFileName)));
}

/**
 * Tokenize input string.
 */
function lexer(str) {
    var tokens = [];
    var i = 0;
    while (i < str.length) {
        var char = str[i];
        if (char === "*" || char === "+" || char === "?") {
            tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
            continue;
        }
        if (char === "\\") {
            tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
            continue;
        }
        if (char === "{") {
            tokens.push({ type: "OPEN", index: i, value: str[i++] });
            continue;
        }
        if (char === "}") {
            tokens.push({ type: "CLOSE", index: i, value: str[i++] });
            continue;
        }
        if (char === ":") {
            var name = "";
            var j = i + 1;
            while (j < str.length) {
                var code = str.charCodeAt(j);
                if (
                // `0-9`
                (code >= 48 && code <= 57) ||
                    // `A-Z`
                    (code >= 65 && code <= 90) ||
                    // `a-z`
                    (code >= 97 && code <= 122) ||
                    // `_`
                    code === 95) {
                    name += str[j++];
                    continue;
                }
                break;
            }
            if (!name)
                { throw new TypeError("Missing parameter name at " + i); }
            tokens.push({ type: "NAME", index: i, value: name });
            i = j;
            continue;
        }
        if (char === "(") {
            var count = 1;
            var pattern = "";
            var j = i + 1;
            if (str[j] === "?") {
                throw new TypeError("Pattern cannot start with \"?\" at " + j);
            }
            while (j < str.length) {
                if (str[j] === "\\") {
                    pattern += str[j++] + str[j++];
                    continue;
                }
                if (str[j] === ")") {
                    count--;
                    if (count === 0) {
                        j++;
                        break;
                    }
                }
                else if (str[j] === "(") {
                    count++;
                    if (str[j + 1] !== "?") {
                        throw new TypeError("Capturing groups are not allowed at " + j);
                    }
                }
                pattern += str[j++];
            }
            if (count)
                { throw new TypeError("Unbalanced pattern at " + i); }
            if (!pattern)
                { throw new TypeError("Missing pattern at " + i); }
            tokens.push({ type: "PATTERN", index: i, value: pattern });
            i = j;
            continue;
        }
        tokens.push({ type: "CHAR", index: i, value: str[i++] });
    }
    tokens.push({ type: "END", index: i, value: "" });
    return tokens;
}
/**
 * Parse a string for the raw tokens.
 */
function parse(str, options) {
    if (options === void 0) { options = {}; }
    var tokens = lexer(str);
    var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
    var defaultPattern = "[^" + escapeString(options.delimiter || "/#?") + "]+?";
    var result = [];
    var key = 0;
    var i = 0;
    var path = "";
    var tryConsume = function (type) {
        if (i < tokens.length && tokens[i].type === type)
            { return tokens[i++].value; }
    };
    var mustConsume = function (type) {
        var value = tryConsume(type);
        if (value !== undefined)
            { return value; }
        var _a = tokens[i], nextType = _a.type, index = _a.index;
        throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
    };
    var consumeText = function () {
        var result = "";
        var value;
        // tslint:disable-next-line
        while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
            result += value;
        }
        return result;
    };
    while (i < tokens.length) {
        var char = tryConsume("CHAR");
        var name = tryConsume("NAME");
        var pattern = tryConsume("PATTERN");
        if (name || pattern) {
            var prefix = char || "";
            if (prefixes.indexOf(prefix) === -1) {
                path += prefix;
                prefix = "";
            }
            if (path) {
                result.push(path);
                path = "";
            }
            result.push({
                name: name || key++,
                prefix: prefix,
                suffix: "",
                pattern: pattern || defaultPattern,
                modifier: tryConsume("MODIFIER") || ""
            });
            continue;
        }
        var value = char || tryConsume("ESCAPED_CHAR");
        if (value) {
            path += value;
            continue;
        }
        if (path) {
            result.push(path);
            path = "";
        }
        var open = tryConsume("OPEN");
        if (open) {
            var prefix = consumeText();
            var name_1 = tryConsume("NAME") || "";
            var pattern_1 = tryConsume("PATTERN") || "";
            var suffix = consumeText();
            mustConsume("CLOSE");
            result.push({
                name: name_1 || (pattern_1 ? key++ : ""),
                pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
                prefix: prefix,
                suffix: suffix,
                modifier: tryConsume("MODIFIER") || ""
            });
            continue;
        }
        mustConsume("END");
    }
    return result;
}
/**
 * Create path match function from `path-to-regexp` spec.
 */
function match(str, options) {
    var keys = [];
    var re = pathToRegexp(str, keys, options);
    return regexpToFunction(re, keys, options);
}
/**
 * Create a path match function from `path-to-regexp` output.
 */
function regexpToFunction(re, keys, options) {
    if (options === void 0) { options = {}; }
    var _a = options.decode, decode = _a === void 0 ? function (x) { return x; } : _a;
    return function (pathname) {
        var m = re.exec(pathname);
        if (!m)
            { return false; }
        var path = m[0], index = m.index;
        var params = Object.create(null);
        var _loop_1 = function (i) {
            // tslint:disable-next-line
            if (m[i] === undefined)
                { return "continue"; }
            var key = keys[i - 1];
            if (key.modifier === "*" || key.modifier === "+") {
                params[key.name] = m[i].split(key.prefix + key.suffix).map(function (value) {
                    return decode(value, key);
                });
            }
            else {
                params[key.name] = decode(m[i], key);
            }
        };
        for (var i = 1; i < m.length; i++) {
            _loop_1(i);
        }
        return { path: path, index: index, params: params };
    };
}
/**
 * Escape a regular expression string.
 */
function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
/**
 * Get the flags for a regexp from the options.
 */
function flags(options) {
    return options && options.sensitive ? "" : "i";
}
/**
 * Pull out keys from a regexp.
 */
function regexpToRegexp(path, keys) {
    if (!keys)
        { return path; }
    var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
    var index = 0;
    var execResult = groupsRegex.exec(path.source);
    while (execResult) {
        keys.push({
            // Use parenthesized substring match if available, index otherwise
            name: execResult[1] || index++,
            prefix: "",
            suffix: "",
            modifier: "",
            pattern: ""
        });
        execResult = groupsRegex.exec(path.source);
    }
    return path;
}
/**
 * Transform an array into a regexp.
 */
function arrayToRegexp(paths, keys, options) {
    var parts = paths.map(function (path) { return pathToRegexp(path, keys, options).source; });
    return new RegExp("(?:" + parts.join("|") + ")", flags(options));
}
/**
 * Create a path regexp from string input.
 */
function stringToRegexp(path, keys, options) {
    return tokensToRegexp(parse(path, options), keys, options);
}
/**
 * Expose a function for taking tokens and returning a RegExp.
 */
function tokensToRegexp(tokens, keys, options) {
    if (options === void 0) { options = {}; }
    var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function (x) { return x; } : _d;
    var endsWith = "[" + escapeString(options.endsWith || "") + "]|$";
    var delimiter = "[" + escapeString(options.delimiter || "/#?") + "]";
    var route = start ? "^" : "";
    // Iterate over the tokens and create our regexp string.
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        if (typeof token === "string") {
            route += escapeString(encode(token));
        }
        else {
            var prefix = escapeString(encode(token.prefix));
            var suffix = escapeString(encode(token.suffix));
            if (token.pattern) {
                if (keys)
                    { keys.push(token); }
                if (prefix || suffix) {
                    if (token.modifier === "+" || token.modifier === "*") {
                        var mod = token.modifier === "*" ? "?" : "";
                        route += "(?:" + prefix + "((?:" + token.pattern + ")(?:" + suffix + prefix + "(?:" + token.pattern + "))*)" + suffix + ")" + mod;
                    }
                    else {
                        route += "(?:" + prefix + "(" + token.pattern + ")" + suffix + ")" + token.modifier;
                    }
                }
                else {
                    route += "(" + token.pattern + ")" + token.modifier;
                }
            }
            else {
                route += "(?:" + prefix + suffix + ")" + token.modifier;
            }
        }
    }
    if (end) {
        if (!strict)
            { route += delimiter + "?"; }
        route += !options.endsWith ? "$" : "(?=" + endsWith + ")";
    }
    else {
        var endToken = tokens[tokens.length - 1];
        var isEndDelimited = typeof endToken === "string"
            ? delimiter.indexOf(endToken[endToken.length - 1]) > -1
            : // tslint:disable-next-line
                endToken === undefined;
        if (!strict) {
            route += "(?:" + delimiter + "(?=" + endsWith + "))?";
        }
        if (!isEndDelimited) {
            route += "(?=" + delimiter + "|" + endsWith + ")";
        }
    }
    return new RegExp(route, flags(options));
}
/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 */
function pathToRegexp(path, keys, options) {
    if (path instanceof RegExp)
        { return regexpToRegexp(path, keys); }
    if (Array.isArray(path))
        { return arrayToRegexp(path, keys, options); }
    return stringToRegexp(path, keys, options);
}

/*! Universal Router | MIT License | https://www.kriasoft.com/universal-router/ */

function decode(val) {
  try {
    return decodeURIComponent(val);
  } catch (err) {
    return val;
  }
}

function matchRoute(route, baseUrl, options, pathname, parentParams) {
  var matchResult;
  var childMatches;
  var childIndex = 0;
  return {
    next: function next(routeToSkip) {
      if (route === routeToSkip) {
        return {
          done: true,
          value: false
        };
      }

      if (!matchResult) {
        var rt = route;
        var end = !rt.children;

        if (!rt.match) {
          rt.match = match(rt.path || '', Object.assign({
            end: end
          }, options));
        }

        matchResult = rt.match(pathname);

        if (matchResult) {
          var _matchResult = matchResult,
              path = _matchResult.path;
          matchResult.path = !end && path.charAt(path.length - 1) === '/' ? path.substr(1) : path;
          matchResult.params = Object.assign({}, parentParams, matchResult.params);
          return {
            done: false,
            value: {
              route: route,
              baseUrl: baseUrl,
              path: matchResult.path,
              params: matchResult.params
            }
          };
        }
      }

      if (matchResult && route.children) {
        while (childIndex < route.children.length) {
          if (!childMatches) {
            var childRoute = route.children[childIndex];
            childRoute.parent = route;
            childMatches = matchRoute(childRoute, baseUrl + matchResult.path, options, pathname.substr(matchResult.path.length), matchResult.params);
          }

          var childMatch = childMatches.next(routeToSkip);

          if (!childMatch.done) {
            return {
              done: false,
              value: childMatch.value
            };
          }

          childMatches = null;
          childIndex++;
        }
      }

      return {
        done: true,
        value: false
      };
    }
  };
}

function resolveRoute(context, params) {
  if (typeof context.route.action === 'function') {
    return context.route.action(context, params);
  }

  return undefined;
}

function isChildRoute(parentRoute, childRoute) {
  var route = childRoute;

  while (route) {
    route = route.parent;

    if (route === parentRoute) {
      return true;
    }
  }

  return false;
}

var UniversalRouterSync = function () {
  function UniversalRouterSync(routes, options) {
    if (!routes || typeof routes !== 'object') {
      throw new TypeError('Invalid routes');
    }

    this.options = Object.assign({
      decode: decode
    }, options);
    this.baseUrl = this.options.baseUrl || '';
    this.root = Array.isArray(routes) ? {
      path: '',
      children: routes,
      parent: null
    } : routes;
    this.root.parent = null;
  }

  var _proto = UniversalRouterSync.prototype;

  _proto.resolve = function resolve(pathnameOrContext) {
    var context = Object.assign({
      router: this
    }, this.options.context, typeof pathnameOrContext === 'string' ? {
      pathname: pathnameOrContext
    } : pathnameOrContext);
    var matchResult = matchRoute(this.root, this.baseUrl, this.options, context.pathname.substr(this.baseUrl.length));
    var resolve = this.options.resolveRoute || resolveRoute;
    var matches;
    var nextMatches;
    var currentContext = context;

    function next(resume, parent, prevResult) {
      if (parent === void 0) {
        parent = !matches.done && matches.value.route;
      }

      var routeToSkip = prevResult === null && !matches.done && matches.value.route;
      matches = nextMatches || matchResult.next(routeToSkip);
      nextMatches = null;

      if (!resume) {
        if (matches.done || !isChildRoute(parent, matches.value.route)) {
          nextMatches = matches;
          return null;
        }
      }

      if (matches.done) {
        var error = new Error('Route not found');
        error.status = 404;
        throw error;
      }

      currentContext = Object.assign({}, context, matches.value);
      var result = resolve(currentContext, matches.value.params);

      if (result !== null && result !== undefined) {
        return result;
      }

      return next(resume, parent, result);
    }

    context.next = next;

    try {
      return next(true, this.root);
    } catch (error) {
      if (this.options.errorHandler) {
        return this.options.errorHandler(error, currentContext);
      }

      throw error;
    }
  };

  return UniversalRouterSync;
}();

/**
 * @file Basic type-safe routing framework built on top of universal-router.
 */
/**
 * Utility function for validating a context object that universal-router passes
 * to each route handler.
 */
function isValidContext(context) {
    return (typeof context === 'object' && context !== null && 'content' in context);
}
/**
 * Creates a route for typed-router in a declarative, type-safe manner.
 * @param path Route path (must be defined in `common` package).
 * @param handlers Object containing handlers for each method type.
 *    Each handler must return a valid response object.
 */
function createRoute(path, handlers) {
    return {
        path: path,
        action: function action(context) {
            if (!isValidContext(context)) {
                throw new Error('Invalid context');
            }
            var method = context.content.method;
            if (Object.prototype.hasOwnProperty.call(handlers, method)) {
                var handler = handlers[method];
                return handler(context.content);
            }
            else {
                return {
                    error: {
                        code: 405,
                        message: 'Method not allowed',
                        content: JSON.stringify(context.content),
                    },
                };
            }
        },
    };
}
/**
 * Factory function for typed-router.
 * @param routes A route or an array of routes created with `createRoute()`
 * @param options Options object for universal-router. Note that typed-router
 *    provides an error handler so you don't have to.
 */
function createRouter() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var routes = args[0];
    var options = args[1];
    var restArgs = args.slice(2);
    return new (Function.prototype.bind.apply( UniversalRouterSync, [ null ].concat( [routes], [Object.assign({}, {errorHandler: function errorHandler(error) {
            return { error: { code: error.status || 500, message: error.message } };
        }},
        options)], restArgs) ));
}

/**
 * @file Routes for the app
 */
var routes = [
    createRoute(CLEANUP_TABLES_CATEGORIZED_ROUTE, {
        get: function get() {
            var cleanupRulesMap = loadCleanupRulesetForCurrentPlayer();
            if (!cleanupRulesMap || cleanupRulesMap.size === 0) {
                throw new Error('All item information is corrupted or missing. Either you have not yet saved any item data or you lost it.');
            }
            var ref = getInventoryStateWithMaps();
            var inventory = ref[0];
            var inventoryMaps = ref[1];
            var categorizedItems = new Set(cleanupRulesMap.keys());
            for (var key of Object.keys(inventoryMaps)) {
                var itemMap = inventoryMaps[key];
                for (var item of itemMap.keys()) {
                    categorizedItems.add(item);
                }
            }
            return {
                result: {
                    cleanupRules: itemMapToIdMapping(cleanupRulesMap),
                    inventory: inventory,
                    items: Array.from(categorizedItems, item => toItemInfo(item)),
                },
            };
        },
    }),
    createRoute(CLEANUP_TABLES_UNCATEGORIZED_ROUTE, {
        get: () => {
            var cleanupRulesMap = loadCleanupRulesetForCurrentPlayer() || new Map();
            var ref = getInventoryStateWithMaps();
            var inventory = ref[0];
            var inventoryMaps = ref[1];
            var uncategorizedItems = new Set();
            for (var key of Object.keys(inventoryMaps)) {
                var itemMap = inventoryMaps[key];
                for (var item of itemMap.keys()) {
                    if (!cleanupRulesMap.has(item) && isCleanable(item)) {
                        uncategorizedItems.add(item);
                    }
                }
            }
            return {
                result: {
                    inventory: inventory,
                    items: Array.from(uncategorizedItems, item => toItemInfo(item)),
                },
            };
        },
    }),
    createRoute(RULESET_ROUTE, {
        post: function post(params) {
            var cleanupRulesMap = idMappingToItemMap(params.cleanupRules);
            var success = saveCleanupRulesetForCurrentPlayer(cleanupRulesMap);
            return success
                ? { result: { success: success } }
                : { error: { code: 500, message: 'Cannot save cleanup ruleset' } };
        },
        patch: function patch(params) {
            var cleanupRulesMap = loadCleanupRulesetForCurrentPlayer() || new Map();
            for (var [item, patch] of idMappingToItemMap(params.cleanupRulesPatch)) {
                if (patch === null) {
                    cleanupRulesMap.delete(item);
                }
                else {
                    cleanupRulesMap.set(item, patch);
                }
            }
            var success = saveCleanupRulesetForCurrentPlayer(cleanupRulesMap);
            return success
                ? { result: { success: success } }
                : { error: { code: 500, message: 'Cannot update cleanup ruleset' } };
        },
    }),
    createRoute(CONFIG_ROUTE, {
        get: () => ({ result: loadCleanupConfig() }),
        post: function post(request) {
            var config = request.config;
            if (request.shouldCopyDataFiles) {
                if (config.dataFileName !== zlib_ash.getvar(CONFIG_NAMES.dataFileName)) {
                    // "Copy" file even if the original stocking file is missing or empty
                    if (!saveCleanupRulesetFile(getFullDataFileName(config.dataFileName), loadCleanupRulesetForCurrentPlayer() ||
                        new Map())) {
                        throw new Error(("Cannot copy cleanup ruleset from " + (CONFIG_NAMES.dataFileName) + " to " + (config.dataFileName)));
                    }
                }
                if (config.stockFileName !== zlib_ash.getvar(CONFIG_NAMES.stockFileName)) {
                    // "Copy" file even if the original stocking file is missing or empty
                    saveStockingRulesetFile(getFullStockFileName(config.stockFileName), loadStockingRulesetForCurrentPlayer() ||
                        new Map());
                }
            }
            saveCleanupConfig(config);
            return { result: { success: true } };
        },
    }),
    createRoute(INVENTORY_ROUTE, {
        get: () => ({ result: getInventoryState() }),
    }),
    createRoute(STATISTICS_ROUTE, {
        get: () => {
            var cleanupRulesMap = loadCleanupRulesetForCurrentPlayer() || new Map();
            var ref = getInventoryStateWithMaps();
            var inventoryMaps = ref[1];
            var categorizedItemCounts = {
                AUTO: 0,
                BREAK: 0,
                CLAN: 0,
                CLST: 0,
                DISC: 0,
                DISP: 0,
                GIFT: 0,
                KEEP: 0,
                MAKE: 0,
                MALL: 0,
                PULV: 0,
                TODO: 0,
                UNTN: 0,
                USE: 0,
            };
            for (var rule of cleanupRulesMap.values()) {
                ++categorizedItemCounts[rule.action];
            }
            var uncategorizedItems = new Set();
            for (var key of Object.keys(inventoryMaps)) {
                var itemMap = inventoryMaps[key];
                for (var item of itemMap.keys()) {
                    if (!cleanupRulesMap.has(item) && isCleanable(item)) {
                        uncategorizedItems.add(item);
                    }
                }
            }
            return {
                result: {
                    categorizedItemCounts: categorizedItemCounts,
                    uncategorizedItemCount: uncategorizedItems.size,
                },
            };
        },
    }) ];

function objectWithoutProperties (obj, exclude) { var target = {}; for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k]; return target; }
/**
 * Sends a response to the client. If the value is not a string, it is
 * serialized using `JSON.stringify()`.
 *
 * This is a thin wrapper around `write()`.
 * The generic type argument can be used to type-check the value being passed.
 */
function send(value) {
    // JSON.stringify() can return undefined if the input is undefined.
    // TypeScript currently doesn't check this, so we must do so manually.
    if (value === undefined) {
        throw new TypeError('Cannot send undefined');
    }
    var str = typeof value === 'string' ? value : JSON.stringify(value);
    kolmafia.write(str);
}
/**
 * Parses the URL and form submission parameters in the current request.
 *
 * - The `relay=true` parameter is stripped.
 * - All other parameters are parsed as JSON, except for `path` and `method`.
 * @return Object that contains the deserialized parameters.
 *    If there are no parameters (i.e. the request is from a direct link),
 *    returns `null` instead.
 */
function parseRequestParameters() {
    var ref = kolmafia.formFields();
    var relay = ref.relay;
    var rest$1 = objectWithoutProperties( ref, ["relay"] );
    var rest = rest$1;
    if (relay !== 'true') {
        throw new Error("Missing expected 'relay' parameter. Has KoLmafia's relay script protocol changed?");
    }
    if (Object.keys(rest).length === 0)
        { return null; }
    return unwrapDeserializedRequest(rest);
}
/**
 * Generate a HTML page that immediately redirects the client to the URL.
 * This is needed because we can't respond with HTTP redirect codes.
 */
function generateRedirectPage(url) {
    return ('<!DOCTYPE html>' +
        '<html>' +
        "<head><meta http-equiv=\"refresh\" content=\"0;url=" + url + "\"></head>" +
        "<body>If your browser does not redirect you immediately, <a href=\"" + url + "\">click here</a></body>" +
        '</html>');
}
function main() {
    // TODO: Add require() to kolmafia-types if possible
    // @ts-expect-error No require()
    var __filename = require.main.id;
    var safeScriptPath = __filename.replace(/(.*?)(?=\/relay\/)/i, '');
    debug(("Started " + safeScriptPath + "..."));
    var startTime = kolmafia.gametimeToInt();
    setDefaultConfig();
    checkProjectUpdates();
    var requestParameters;
    try {
        var router = createRouter(routes);
        requestParameters = parseRequestParameters();
        if (requestParameters === null) {
            // If there are no URL parameters, this is probably a request made by a
            // user navigating to our app.
            // We send the HTML skeleton of the Philter Manager.
            send(generateRedirectPage(RELAY_HTML_PATH));
        }
        else {
            send(router.resolve({
                pathname: requestParameters.path,
                content: requestParameters,
            }));
        }
    }
    catch (e) {
        send({ error: { code: 500, message: String(e) } });
        // Interestingly, KoLmafia will still return a response if the script aborts
        // or throws after calling send(). Unfortunately, the stack trace is all but
        // lost at this point, so there's little point in re-throwing the exception.
        error(("[" + safeScriptPath + "] " + (e instanceof Error ? e : '[ERROR] ' + e)));
    }
    var endTime = kolmafia.gametimeToInt();
    var clfDate = formatDateClf(new Date());
    var name = kolmafia.myName() || '-';
    var extraComment;
    if (requestParameters) {
        var ref = requestParameters || {};
        var method = ref.method;
        var path = ref.path;
        extraComment = "simulated method: " + method + ", path: " + path;
    }
    else {
        extraComment = 'home page requested';
    }
    debug((name + " [" + clfDate + "] \"" + safeScriptPath + " HTTP\" (" + extraComment + ")"));
    debug(("Took " + (endTime - startTime) + "ms to generate response"));
}

exports.main = main;
