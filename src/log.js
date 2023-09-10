"use strict";
exports.__esModule = true;
exports.Log = void 0;
var colors = require('colors');
colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'cyan',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red',
    h1: 'grey',
    h2: 'yellow'
});
var Log = /** @class */ (function () {
    function Log() {
    }
    /**
     * Console log heading 1.
     *
     * @param  {string|object} message
     * @return {void}
     */
    Log.title = function (message) {
        console.log(colors.bold(message));
    };
    /**
     * Console log heaing 2.
     *
     * @param  {string|object} message
     * @return {void}
     */
    Log.subtitle = function (message) {
        console.log(colors.h2.bold(message));
    };
    /**
     * Console log info.
     *
     * @param  {string|object} message
     * @return {void}
     */
    Log.info = function (message) {
        console.log(colors.info(message));
    };
    /**
     * Console log success.
     *
     * @param  {string|object} message
     * @return {void}
     */
    Log.success = function (message) {
        console.log(colors.green('\u2714 '), message);
    };
    /**
     *
     *
     * Console log info.
     *
     * @param  {string|object} message
     * @return {void}
     */
    Log.error = function (message) {
        console.log(colors.error(message));
    };
    /**
     * Console log warning.
     *
     * @param  {string|object} message
     * @return {void}
     */
    Log.warning = function (message) {
        console.log(colors.warn('\u26A0 ' + message));
    };
    return Log;
}());
exports.Log = Log;
