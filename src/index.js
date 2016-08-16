'use strict';

var driver = require('ruff-driver');
var kernelModule = require('kernel-module');
var Camera = require('./camera');

var usbDriverName = 'ehci-platform';
var uvcDriverName = 'uvcvideo';

var driverInstalled = false;

module.exports = driver({
    attach: function (intputs, context, next) {
        this._camera = new Camera();
        ensureDriverInstalled(next);
    },
    detach: function (callback) {
        ensureDriverRemoved(callback);
    },
    exports: {
        capture: function () {
            return this._camera.capture.apply(this._camera, arguments);
        }
    }
});

function ensureDriverInstalled(callback) {
    if (driverInstalled) {
        callback && callback();
        return;
    }
    try {
        kernelModule.install(usbDriverName);
        kernelModule.install(uvcDriverName);
        driverInstalled = true;
        callback && callback();
    } catch (error) {
        callback && callback(error);
    }
}

function ensureDriverRemoved(callback) {
    if (!driverInstalled) {
        callback && callback();
    }
    try {
        kernelModule.remove(usbDriverName);
        kernelModule.remove(uvcDriverName);
        driverInstalled = false;
        callback && callback();
    } catch (error) {
        callback && callback(error);
    }
}
