const assert = require('assert');

export class Device {

    socket = null;

    constructor(name) {

        assert(name, 'Check your config. No name set for some device!!');

        this.name = name;
    }

    getActions() {
        return this.actions;
    }

    setSocket(socket) {
        this.socket = socket;
    }

}