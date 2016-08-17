
'use strict';

var util = require('util');
var EventEmitter = require('events');
var Poll = require('poll');
var fs = require('fs');
var async = require('ruff-async');

var MODE_666 = parseInt('666', 8);
var FIFO_NAME = 'pic.fifo';
var FIFO_PATH = '/tmp/' + FIFO_NAME;

var CHECK_DEVICE_INTERVAL = 100;
var CHECK_DEVICE_TIMES = 100;
var CHUNK_SIZE = 4096;

function mkfifo(name, callback) {
    uv.spawn('/usr/bin/mkfifo', [name], '/tmp/', -1, -1, -1, function (code) {
        if (code === 0) {
            callback && callback();
            return;
        }
        callback && callback(new Error('Camera initialize step 1 failed'));
    });
}

function rmfifo(name, callback) {
    uv.spawn('/bin/rm', ['-f', name], '/tmp/', -1, -1, -1, function (code) {
        if (code === 0) {
            callback && callback();
            return;
        }
        callback && callback(new Error('Camera initialize step 2 failed'));
    });
}

function grabPicture(device, resolution, callback) {
    var args = [];
    args.push('-v');
    args.push('--skip', '3');
    args.push('-d', device);
    args.push('-r', resolution);
    args.push('--save', FIFO_NAME);
    uv.spawn('/usr/bin/fswebcam', args, '/tmp/', -1, -1, -1, function (code) {
        if (code === 0) {
            callback && callback();
            return;
        }
        callback && callback(new Error('Camera capture failed'));
    });
}

function Camera(option) {
    this._device = option && option.device || '/dev/video0';
    this._fifoFd = -1;
    this._captureQueue = new async.Queue(this._captureHandler);
    this._grabFinish = false;
    this._readFinish = false;
    this._checkDeviceInterval = CHECK_DEVICE_INTERVAL;
    this._checkDeviceIntervalHandler = undefined;
    this._checkDeviceTimes = 0;
}

function Picture() {
    EventEmitter.call(this);
}
util.inherits(Picture, EventEmitter);

Camera.prototype._checkDevice = function (callback) {
    var that = this;
    checkCameraExisted();

    function checkCameraExisted() {
        if (that._checkDeviceTimes >= CHECK_DEVICE_TIMES) {
            checkFinish(new Error('Cannot find USB camera'));
            return;
        }
        that._checkDeviceTimes++;
        try {
            fs.statSync(that._device);
            checkFinish();
            return;
        } catch (error) {
        }
        if (!that._checkDeviceIntervalHandler) {
            that._checkDeviceIntervalHandler = setInterval(checkCameraExisted, that._checkDeviceInterval);
        }
    }

    function checkFinish(error) {
        clearInterval(that._checkDeviceIntervalHandler);
        that._checkDeviceTimes = 0;
        callback && callback(error);
    }
};

Camera.prototype._grabInit = function (callback) {
    var that = this;
    async.series([
        rmfifo.bind(undefined, FIFO_NAME),
        mkfifo.bind(undefined, FIFO_NAME),
        function (next) {
            fs.open(FIFO_PATH, 'rn', MODE_666, function (error, fd) {
                if (error) {
                    next(error);
                    return;
                }
                that._fifoFd = fd;
                next();
            });
        }
    ], function (error) {
        if (error) {
            callback && callback(error);
            return;
        }
        that._readPoll = new Poll(that._fifoFd);
        callback && callback();
    });
};

Camera.prototype._grab = function (option, picture, callback) {
    var width = option && option.width || 320;
    var height = option && option.height || 240;
    var resolution = width + 'x' + height;
    var that = this;
    var buffer = new Buffer(CHUNK_SIZE);

    this._readPoll.start(Poll.READ_EVENT, function (error, event) {
        if (error) {
            callback && callback(error);
            return;
        }
        if (event === Poll.READ_EVENT) {
            var length = fs.readSync(that._fifoFd, buffer, 0, CHUNK_SIZE, -1);
            if (length === 0) {
                that._readPoll.stop();
                that._readPoll.close();
                fs.closeSync(that._fifoFd);
                picture.emit('end');
                that._readCleanup(callback);
                return;
            }
            picture.emit('data', buffer.slice(0, length));
        }
    });
    grabPicture(this._device, resolution, this._grabCleanup.bind(this, callback));
    return picture;
};

Camera.prototype._grabCleanup = function (callback) {
    this._grabFinish = true;
    this._cleanup(callback);
};

Camera.prototype._readCleanup = function (callback) {
    this._readFinish = true;
    this._cleanup(callback);
};

Camera.prototype._cleanup = function (callback) {
    if (this._readFinish && this._grabFinish) {
        this._readFinish = false;
        this._grabFinish = false;
        callback && callback();
        return;
    }
};

Camera.prototype._captureHandler = function (option, picture, callback) {
    async.series([
        this._checkDevice.bind(this),
        this._grabInit.bind(this),
        this._grab.bind(this, option, picture)
    ], callback);
};

Camera.prototype.capture = function () {
    var option;
    var callback;
    if (arguments.length >= 2) {
        option = arguments[0];
        callback = arguments[1];
    }
    if (arguments.length === 1) {
        if (typeof arguments[0] === 'object') {
            option = arguments[0];
        }
        if (typeof arguments[0] === 'function') {
            callback = arguments[0];
        }
    }

    var picture = new Picture();
    this._captureQueue.push(this, [option, picture], callback);
    return picture;
};

module.exports = Camera;
