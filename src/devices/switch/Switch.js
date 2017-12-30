import { Device } from '../device';
import rpio from 'rpio';
import is from 'is_js';

const assert = require('assert');


export class Switch extends Device {

    actions = {};

    constructor(name, config) {
        super(name);

        assert(config.pin, `No default GPIO for switch ${name}`);
        assert(is.not.undefined(config.defaultState), `No default state for switch ${name}`);

        this.pin = config.pin;

        rpio.open(this.pin, rpio.OUTPUT, config.defaultState);

        this.actions = {
            toggleState: this.toggleState.bind(this),
            getState: this.getState.bind(this)
        }

    }

    setState(state = this.readState(), silent=false) {

        rpio.write(this.pin, state);

        if (!silent) {
            this.emitChange(this.name, 'setState', this.readState())
        }

        console.log(`${this.name} has changed to state: ${state}`);

    }

    toggleState() {

        let state = this.readState();

        this.setState(state ? rpio.LOW : rpio.HIGH, true);

        this.emitChange(this.name, 'toggleState', this.readState())
    }

    getState() {
        this.emitChange(this.name, 'getState', this.readState())
    }

    readState() {
        return rpio.read(this.pin);
    }

}