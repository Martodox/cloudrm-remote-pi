import { Device } from '../device';
const assert = require('assert');

export class Switch extends Device {

    state = 1;
    actions = {};

    constructor(name, config) {
        super(name);
        assert(config.gpio, `No default GPIO for switch ${name}`);
        assert(config.defaultState, `No default state for switch ${name}`);

        this.state = config.defaultState;
        this.gpio = config.gpio;

        this.actions = {
            setState: this.setState.bind(this),
            toggleState: this.toggleState.bind(this)
        }

    }

    setState(state) {
        this.state = state;

        console.log(`${this.name} has changed to state: ${state}`);

    }

    toggleState() {

        this.setState(1 - this.state)

    }

}