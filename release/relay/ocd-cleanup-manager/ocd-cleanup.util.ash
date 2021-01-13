/**
 * @file This script provides utility methods for both the OCD Cleanup script
 * and the Relay Manager UI.
 *
 * All function names defined here are prefixed with "_ocd_" to avoid possible
 * conflicts with KoLmafia's library functions and/or scripts.
 */

// Uses is_dark_mode()
since r20566;

/**
 * @return Appropriate color code for error messages.
 */
string _ocd_color_error() {
    return is_dark_mode() ? "#ff0033" : "#cc0033";
}

/**
 * @return Appropriate color code for warning messages.
 */
string _ocd_color_warning() {
    return is_dark_mode() ? "#cc9900" : "#cc6600";
}

/**
 * @return Appropriate color code for informational messages.
 */
string _ocd_color_info() {
    return is_dark_mode() ? "#0099ff" : "3333ff";
}

/**
 * @return Appropriate color code for success messages.
 */
string _ocd_color_success() {
    return is_dark_mode() ? "#00cc00" : "#008000";
}

/**
 * @return Appropriate color code for (unimportant) debug messages.
 */
string _ocd_color_debug() {
    return "#808080";
}
