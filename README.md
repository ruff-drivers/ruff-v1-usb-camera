[![Build Status](https://travis-ci.org/ruff-drivers/ruff-v1-usb-camera.svg)](https://travis-ci.org/ruff-drivers/ruff-v1-usb-camera)

# USB Camera Driver for Ruff

The driver of camera with USB interfae that is compatible with the protocol of UVC(USB Video Class)

## Supported Engines

* Ruff: >=1.4.0 <1.5.0

## Supported Models

- [UVC](https://rap.ruff.io/devices/ruff-v1-usb-camera)

## Installing

1. Execute following command and enter a **supported model** to install.

```sh
# Please replace `<device-id>` with a proper ID.
# And this will be what you are going to query while `$('#<device-id>')`.
rap device add <device-id>

# Then enter a supported model, for example:
# ? model: uvc-01
```

## Usage

Here is the basic usage of this driver.

```js
var resolution = {
    width: 800,
    height: 600
};
var picture = camera.capture(resolution, callback);

picture.on('data', function (data) {
 // ...
});

picture.on('end', function () {
 // ...
});
```
## FAQ
If your get error message `Cannot find USB camera`, please confirm your camera has been pluged, and power down the ruff board and then power on it agagin.

## API References

### Methods

#### `capture([resolution][, callback])`

Capture a picture and return an object which emits `data` and `end` events.

The `data` event supplies the data of captured picture with JPEG format, and the `end` event informs the data is ended.

- **resolution:** It is an object which contains `width` and `height` properties, i.e. the resolution is `width`x`height`.
Due to memory limitation, the `resolution` must be less than `1280x720`.
If you set some resolution that is not supported by the camera, this driver will change your setting to one supported resolution.

- **callback:** No argument other than a possible error is given to the completion callback. The callback will be invoked when the capture operation is finished.

Both `resolution` and `callback` are optional parameters. The default `resolution` is 320x240.

## Contributing

Contributions to this project are warmly welcome. But before you open a pull request, please make sure your changes are passing code linting and tests.

You will need the latest [Ruff SDK](https://ruff.io/) to install rap dependencies and then to run tests.

### Installing Dependencies

```sh
npm install
rap install
```

### Running Tests

```sh
npm test
```

## License

The MIT License (MIT)

Copyright (c) 2016 Nanchao Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
