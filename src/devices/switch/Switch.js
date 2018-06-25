import { Device } from '../device';
import rpio from 'rpio';
import is from 'is_js';

const assert = require('assert');


export class Switch extends Device {

    actions = {};
    reversed = false;

    constructor(name, config) {
        super(name);

        assert(config.pin, `No pin for switch ${name}`);
        assert(is.not.undefined(config.defaultState), `No default state for switch ${name}`);

        if (config.reversed) {
            this.reversed = config.reversed;
        }

        this.pin = config.pin;

        rpio.open(this.pin, rpio.OUTPUT, config.defaultState);

        this.actions = {
            toggleState: this.toggleState.bind(this),
            getState: this.getState.bind(this)
        }

    }

    emitSwitchState(action) {

        let state = this.readState();

        if (this.reversed) {
            state = state === 1 ? 0 : 1;
        }

        this.emitChange(this.name, action, state)
    }

    setState(state, silent=false) {

        rpio.write(this.pin, state);

        if (!silent) {
            this.emitSwitchState('setState')
        }

        console.log(`${new Date()} | ${this.name} has changed to state: ${state}`);

    }

    toggleState() {

        this.setState(this.readState() ? rpio.LOW : rpio.HIGH, true);

        this.emitSwitchState('toggleState')
    }

    getState() {
        this.emitSwitchState('getState')
    }

    readState() {
        return rpio.read(this.pin);
    }

}