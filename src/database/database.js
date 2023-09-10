"use strict";
exports.__esModule = true;
exports.Database = void 0;
var sqlite_1 = require("./sqlite");
var redis_1 = require("./redis");
var log_1 = require("./../log");
/**
 * Class that controls the key/value data store.
 */
var Database = /** @class */ (function () {
    /**
     * Create a new database instance.
     */
    function Database(options) {
        this.options = options;
        if (options.database == 'redis') {
            this.driver = new redis_1.RedisDatabase(options);
        }
        else if (options.database == 'sqlite') {
            this.driver = new sqlite_1.SQLiteDatabase(options);
        }
        else {
            log_1.Log.error('Database driver not set.');
        }
    }
    /**
     * Get a value from the database.
     */
    Database.prototype.get = function (key) {
        return this.driver.get(key);
    };
    ;
    /**
     * Set a value to the database.
     */
    Database.prototype.set = function (key, value) {
        this.driver.set(key, value);
    };
    ;
    return Database;
}());
exports.Database = Database;
