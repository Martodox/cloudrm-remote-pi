import { Device } from '../device';
const assert = require('assert');

export class Button extends Device {

    constructor(name, config) {
        super(name);

        assert(config.gpio, `No default GPIO for button ${name}`);

        process.stdin.on('keypress', (ch, key) => {
            if (key.name == 'n') {
                this._notifySocket();
            }
        });

    }

    _notifySocket() {
        console.log('notify');
        if (this.socket) {
            this.socket.emit('somethingHappen', this.name);
        }
    }


}