import { Device } from '../device';
import rpio from 'rpio';
import Rx from 'rxjs/Rx';




const assert = require('assert');

export class Button extends Device {

    constructor(name, config) {
        super(name);

        assert(config.pin, `No pin for button ${name}`);
        assert(config.type, `No type for button ${name}. Either PULL_UP or PULL_DOWN`);

        this.throttle = config.throttle ? config.throttle : 1000;

        rpio.open(config.pin, rpio.INPUT, config.type);

        this.pin = config.pin;

        Rx.Observable.create(observer => {
            rpio.poll(this.pin, () => {
                observer.next()
            });
        })
        .throttle(() => Rx.Observable.interval(this.throttle))
        .subscribe(this.touch.bind(this));

        this.actions = {
            touch: this.touch.bind(this),
            getState: this.returnState.bind(this)
        }
        
    }

    touch() {
        this.emitChange(this.name, 'touch', this.throttle)
    }

    returnState() {
        this.emitChange(this.name, 'getState', this.throttle)
    }


}


