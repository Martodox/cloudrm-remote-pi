import { Device } from '../device';
import rpio from 'rpio';
import is from 'is_js';

const assert = require('assert');


export class Switch extends Device {

    state = rpio.LOW;
    actions = {};

    constructor(name, config) {
        super(name);

        assert(config.pin, `No default GPIO for switch ${name}`);
        assert(is.not.undefined(config.defaultState), `No default state for switch ${name}`);

        this.state = config.defaultState;
        this.pin = config.pin;

        rpio.open(this.pin, rpio.OUTPUT, this.state);

        this.actions = {
            setState: this.setState.bind(this),
            toggleState: this.toggleState.bind(this),
            getState: this.getState.bind(this)
        }

    }

    setState(state, silent=false) {
        this.state = state;

        rpio.write(this.pin, this.state);

        if (!silent) {
            this.emitChange(this.name, 'setState', this.state)
        }

        console.log(`${this.name} has changed to state: ${state}`);

    }

    toggleState() {
        this.setState(this.state ? rpio.LOW : rpio.HIGH, true);

        this.emitChange(this.name, 'toggleState', this.state)
    }

    getState() {
        this.emitChange(this.name, 'getState', this.state)
    }

}