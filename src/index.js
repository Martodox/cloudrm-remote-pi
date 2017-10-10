import webSocketConnector from '/web-socket-connector/web-socket-connector';
import { Switch } from './devices/switch/switch';
import { devices } from '../devices';

const importedDevices = {
    'Switch': Switch
};


for (let device in devices) {
    devices[device]['class'] = new importedDevices[devices[device]['type']](device, devices[device]['config']);
}

const socketConnection = new webSocketConnector(devices);

