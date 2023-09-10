"use strict";
exports.__esModule = true;
exports.Channel = void 0;
var presence_channel_1 = require("./presence-channel");
var private_channel_1 = require("./private-channel");
var log_1 = require("./../log");
var Channel = /** @class */ (function () {
    /**
     * Create a new channel instance.
     */
    function Channel(io, options) {
        this.io = io;
        this.options = options;
        /**
         * Channels and patters for private channels.
         */
        this._privateChannels = ['private-*', 'presence-*'];
        /**
         * Allowed client events
         */
        this._clientEvents = ['client-*'];
        this.private = new private_channel_1.PrivateChannel(options);
        this.presence = new presence_channel_1.PresenceChannel(io, options);
        if (this.options.devMode) {
            log_1.Log.success('Channels are ready.');
        }
    }
    /**
     * Join a channel.
     */
    Channel.prototype.join = function (socket, data) {
        if (data.channel) {
            if (this.isPrivate(data.channel)) {
                this.joinPrivate(socket, data);
            }
            else {
                socket.join(data.channel);
                this.onJoin(socket, data.channel);
            }
        }
    };
    /**
     * Trigger a client message
     */
    Channel.prototype.clientEvent = function (socket, data) {
        try {
            data = JSON.parse(data);
        }
        catch (e) {
            data = data;
        }
        if (data.event && data.channel) {
            if (this.isClientEvent(data.event) &&
                this.isPrivate(data.channel) &&
                this.isInChannel(socket, data.channel)) {
                this.io.sockets.connected[socket.id]
                    .broadcast.to(data.channel)
                    .emit(data.event, data.channel, data.data);
            }
        }
    };
    /**
     * Leave a channel.
     */
    Channel.prototype.leave = function (socket, channel, reason) {
        if (channel) {
            if (this.isPresence(channel)) {
                this.presence.leave(socket, channel);
            }
            socket.leave(channel);
            if (this.options.devMode) {
                log_1.Log.info("[" + new Date().toISOString() + "] - " + socket.id + " left channel: " + channel + " (" + reason + ")");
            }
        }
    };
    /**
     * Check if the incoming socket connection is a private channel.
     */
    Channel.prototype.isPrivate = function (channel) {
        var isPrivate = false;
        this._privateChannels.forEach(function (privateChannel) {
            var regex = new RegExp(privateChannel.replace('\*', '.*'));
            if (regex.test(channel))
                isPrivate = true;
        });
        return isPrivate;
    };
    /**
     * Join private channel, emit data to presence channels.
     */
    Channel.prototype.joinPrivate = function (socket, data) {
        var _this = this;
        this.private.authenticate(socket, data).then(function (res) {
            socket.join(data.channel);
            if (_this.isPresence(data.channel)) {
                var member = res.channel_data;
                try {
                    member = JSON.parse(res.channel_data);
                }
                catch (e) { }
                _this.presence.join(socket, data.channel, member);
            }
            _this.onJoin(socket, data.channel);
        }, function (error) {
            if (_this.options.devMode) {
                log_1.Log.error(error.reason);
            }
            _this.io.sockets.to(socket.id)
                .emit('subscription_error', data.channel, error.status);
        });
    };
    /**
     * Check if a channel is a presence channel.
     */
    Channel.prototype.isPresence = function (channel) {
        return channel.lastIndexOf('presence-', 0) === 0;
    };
    /**
     * On join a channel log success.
     */
    Channel.prototype.onJoin = function (socket, channel) {
        if (this.options.devMode) {
            log_1.Log.info("[" + new Date().toISOString() + "] - " + socket.id + " joined channel: " + channel);
        }
    };
    /**
     * Check if client is a client event
     */
    Channel.prototype.isClientEvent = function (event) {
        var isClientEvent = false;
        this._clientEvents.forEach(function (clientEvent) {
            var regex = new RegExp(clientEvent.replace('\*', '.*'));
            if (regex.test(event))
                isClientEvent = true;
        });
        return isClientEvent;
    };
    /**
     * Check if a socket has joined a channel.
     */
    Channel.prototype.isInChannel = function (socket, channel) {
        return !!socket.rooms[channel];
    };
    return Channel;
}());
exports.Channel = Channel;
