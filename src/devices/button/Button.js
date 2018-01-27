import { Device } from '../device';
const assert = require('assert');

export class Button extends Device {

    constructor(name, config) {
        super(name);

        assert(config.gpio, `No default GPIO for button ${name}`);

        process.stdin.on('keypress', (ch, key) => {
            if (key.name == 'n') {
                this.emitChange(this.name, 'press');
            }
        });

    }




}