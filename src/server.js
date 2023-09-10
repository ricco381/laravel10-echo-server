"use strict";
exports.__esModule = true;
exports.Server = void 0;
var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var url = require('url');
var SocketServer = require('socket.io').Server;
var log_1 = require("./log");
var Server = /** @class */ (function () {
    /**
     * Create a new server instance.
     */
    function Server(options) {
        this.options = options;
    }
    /**
     * Start the Socket.io server.
     *
     * @return {void}
     */
    Server.prototype.init = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.serverProtocol().then(function () {
                var host = _this.options.host || 'localhost';
                log_1.Log.success("Running at " + host + " on port " + _this.getPort());
                resolve(_this.io);
            }, function (error) { return reject(error); });
        });
    };
    /**
     * Sanitize the port number from any extra characters
     *
     * @return {number}
     */
    Server.prototype.getPort = function () {
        var portRegex = /([0-9]{2,5})[\/]?$/;
        var portToUse = String(this.options.port).match(portRegex); // index 1 contains the cleaned port number only
        return Number(portToUse[1]);
    };
    /**
     * Select the http protocol to run on.
     *
     * @return {Promise<any>}
     */
    Server.prototype.serverProtocol = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.options.protocol == 'https') {
                _this.secure().then(function () {
                    resolve(_this.httpServer(true));
                }, function (error) { return reject(error); });
            }
            else {
                resolve(_this.httpServer(false));
            }
        });
    };
    /**
     * Load SSL 'key' & 'cert' files if https is enabled.
     *
     * @return {void}
     */
    Server.prototype.secure = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.options.sslCertPath || !_this.options.sslKeyPath) {
                reject('SSL paths are missing in server config.');
            }
            Object.assign(_this.options, {
                cert: fs.readFileSync(_this.options.sslCertPath),
                key: fs.readFileSync(_this.options.sslKeyPath),
                ca: (_this.options.sslCertChainPath) ? fs.readFileSync(_this.options.sslCertChainPath) : '',
                passphrase: _this.options.sslPassphrase
            });
            resolve(_this.options);
        });
    };
    /**
     * Create a socket.io server.
     *
     * @return {any}
     */
    Server.prototype.httpServer = function (secure) {
        var _this = this;
        this.express = express();
        this.express.use(function (req, res, next) {
            for (var header in _this.options.headers) {
                res.setHeader(header, _this.options.headers[header]);
            }
            next();
        });
        if (secure) {
            var httpServer = https.createServer(this.options, this.express);
        }
        else {
            var httpServer = http.createServer(this.express);
        }
        httpServer.listen(this.getPort(), this.options.host);
        this.authorizeRequests();
        return this.io = new SocketServer(httpServer, this.options.socketio);
    };
    /**
     * Attach global protection to HTTP routes, to verify the API key.
     */
    Server.prototype.authorizeRequests = function () {
        var _this = this;
        this.express.param('appId', function (req, res, next) {
            if (!_this.canAccess(req)) {
                return _this.unauthorizedResponse(req, res);
            }
            next();
        });
    };
    /**
     * Check is an incoming request can access the api.
     *
     * @param  {any} req
     * @return {boolean}
     */
    Server.prototype.canAccess = function (req) {
        var appId = this.getAppId(req);
        var key = this.getAuthKey(req);
        if (key && appId) {
            var client = this.options.clients.find(function (client) {
                return client.appId === appId;
            });
            if (client) {
                return client.key === key;
            }
        }
        return false;
    };
    /**
     * Get the appId from the URL
     *
     * @param  {any} req
     * @return {string|boolean}
     */
    Server.prototype.getAppId = function (req) {
        if (req.params.appId) {
            return req.params.appId;
        }
        return false;
    };
    /**
     * Get the api token from the request.
     *
     * @param  {any} req
     * @return {string|boolean}
     */
    Server.prototype.getAuthKey = function (req) {
        if (req.headers.authorization) {
            return req.headers.authorization.replace('Bearer ', '');
        }
        if (url.parse(req.url, true).query.auth_key) {
            return url.parse(req.url, true).query.auth_key;
        }
        return false;
    };
    /**
     * Handle unauthorized requests.
     *
     * @param  {any} req
     * @param  {any} res
     * @return {boolean}
     */
    Server.prototype.unauthorizedResponse = function (req, res) {
        res.statusCode = 403;
        res.json({ error: 'Unauthorized' });
        return false;
    };
    return Server;
}());
exports.Server = Server;
