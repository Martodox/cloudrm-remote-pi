import webSocketConnector from '/web-socket-connector/web-socket-connector';
const assert = require('assert');
const keypress = require('keypress');
keypress(process.stdin);

import {Switch} from './devices/switch/Switch';
import {Button} from './devices/button/Button'
import {devices} from '../devices';

const importedDevices = {
    Switch,
    Button
};

const socketConnection = new webSocketConnector();

for (let device in devices) {

    const deviceConstructor = importedDevices[devices[device]['type']];

    assert(deviceConstructor, `${device} class ${devices[device]['type']} is not a proper class name. Check your config`);

    devices[device]['class'] = new deviceConstructor(device, devices[device]['config']);
}

function registerDevicesActions(connection, socketConnection) {

    for (let device in devices) {
        devices[device]['class'].setSocket(connection);
    }

    socketConnection.registerDevicesActions(devices)
}

socketConnection.connect().then(connection => {


    registerDevicesActions(connection, socketConnection);

    connection.on('connect', () => {
        registerDevicesActions(connection, socketConnection);
    });

});





