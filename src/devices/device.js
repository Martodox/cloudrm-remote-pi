const assert = require('assert');
import config from '../../config';

export class Device {

    socket = null;

    constructor(name) {

        assert(name, 'Check your config. No name set for some device!!');
        this.deviceId = config.deviceId;
        this.name = name;
    }

    getActions() {
        return this.actions;
    }

    setSocket(socket) {
        this.socket = socket;
    }

    emitChange(device, action, state) {
        console.log(`Sending event: ${this.deviceId}:${device}:${action} with state: `, state);
        this.socket.emit(`${this.deviceId}:${device}:${action}`, state);
    }

}