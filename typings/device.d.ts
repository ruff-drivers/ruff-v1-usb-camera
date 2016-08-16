import { EventEmitter } from 'events';

export declare class Camera extends RuffDevice {
    /**
     * Capture one picture.
     * @param resolution - the resolution of picture, has `width` and `height` propertities.
     * @param callback - The callback.
     */
    capture(resolution?: {width: number, height: number}, callback?: (error : Error) => void): PictureStream;
}

export declare class PictureStream extends EventEmitter { }

export default Camera;
