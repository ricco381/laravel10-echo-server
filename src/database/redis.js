"use strict";
exports.__esModule = true;
exports.RedisDatabase = void 0;
var Redis = require('ioredis');
var RedisDatabase = /** @class */ (function () {
    /**
     * Create a new cache instance.
     */
    function RedisDatabase(options) {
        this.options = options;
        this._redis = new Redis(options.databaseConfig.redis);
    }
    /**
     * Retrieve data from redis.
     */
    RedisDatabase.prototype.get = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._redis.get(key).then(function (value) { return resolve(JSON.parse(value)); });
        });
    };
    /**
     * Store data to cache.
     */
    RedisDatabase.prototype.set = function (key, value) {
        this._redis.set(key, JSON.stringify(value));
        if (this.options.databaseConfig.publishPresence === true && /^presence-.*:members$/.test(key)) {
            this._redis.publish('PresenceChannelUpdated', JSON.stringify({
                "event": {
                    "channel": key,
                    "members": value
                }
            }));
        }
    };
    return RedisDatabase;
}());
exports.RedisDatabase = RedisDatabase;
