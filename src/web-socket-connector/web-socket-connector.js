import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import URLSafeBase64 from 'urlsafe-base64';
import ioClient from 'socket.io-client';
import config from '../../config';
import request from 'request';

const keyLocation = './key.rsa';

export default class webSocketConnector {

  actions = [];
  devices = {};

  connection = null;

  connect() {
    return new Promise((resolve, reject) => {

        this._attemptConnection().then(result => {
          resolve(result)
        }, error => {
            console.error(error);
            this._attemptRegistration().then(resolve, reject);
        })
    });

  }

  registerDevicesActions(devices) {
      this.devices = devices;

      this.actions = []

      for (let device in this.devices) {
          try {
              this.actions.push({
                  name: device,
                  type: this.devices[device]['type'],
                  actions: Object.keys(this.devices[device]['class']['actions'])
              })
          } catch (error) {

          }

      }

      this.connection.emit('availableActions', this.actions)
  }

  _gatherMetadata() {
    this.connectionVerifyString = this._createVerificationString();
    this.privateKey = this._getPrivateKey();

    this.remoteId = this._getDeviceId();
  }

  _createVerificationString() {
    return URLSafeBase64.encode(new Buffer(Date.now().toString()));
  }

  _getPrivateKey() {
    return fs.readFileSync(keyLocation, 'utf8');
  }

  _getDeviceId() {
    return config.deviceId || npmos.networkInterfaces()['en0'][0].address;
  }

  _attemptConnection() {
    return new Promise((resolve, reject) => {

      console.log('Attempting connection');

      this._gatherMetadata();


      const encrypted = crypto.privateEncrypt(this.privateKey, new Buffer(this.connectionVerifyString));

      const escaped = URLSafeBase64.encode(encrypted);

      const connectionQuery = `handshake=${escaped}&verificationString=${this.connectionVerifyString}&remoteId=${this.remoteId}`;

      this.connection = ioClient.connect(config.server, {query: connectionQuery});

      this.connection.on('error', msg => {
        console.error(`Connection error: ${msg}`);
        reject();
      });

      this.connection.on('connect', () => {
        console.log(`Successful connected to: ${config.server}`);

        resolve(this.connection);
      });

      this.connection.on('invokeAction', payload => {
          try {
              this.devices[payload.device]['class']['actions'][payload.action]()
          } catch (e) {
              console.log(`${payload.device} or ${payload.action} not found on the device. Sorry`);
              console.error(e);
          }

      });

      this.connection.on('disconnect', () => {
        console.log(`Disconnected from: ${config.server}`)
      })
    });
  }

  _attemptRegistration() {

    return new Promise((resolve, reject) => {

      console.log('Remote not found on the server. Attempting registration');

      request.post({url:`${config.server}/api/v1/new-remote`, form: {deviceId:this._getDeviceId()}}, (error, responseCode, body) => {

        if (!!error) {
            console.error(error);
            return reject(error);
        }

        const response = JSON.parse(body);

        fs.writeFile(keyLocation, response.key, (err) => {
          if(err) {
            console.log('Writing error', err);
            return reject('Writing error')
          }
          console.log("The file was saved!. Retrying");

              this._attemptConnection().then(resolve, error => {
                  reject('Connection failed after registration. Aborting');
                  console.log('Connection failed after registration. Aborting', error)
              });

        });

      });
    });
  }




};
