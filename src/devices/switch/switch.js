import { Device } from '../device';

export class Switch extends Device {

    state = 1;

    constructor(name, config) {
        super(name);
        this.state = config.defaultState;

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