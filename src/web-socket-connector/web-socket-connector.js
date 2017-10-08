import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import URLSafeBase64 from 'urlsafe-base64';
import ioClient from 'socket.io-client';
import config from '../../config';
import request from 'request';

const keyLocation = './key.rsa';

export default class webSocketConnector {

  constructor() {

    try {
      this._attemptConnection();
    } catch (e) {
      console.log('Connection atempt fail. Trying to regester');
      this._attemptRegistration();
    }

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
    return os.networkInterfaces()['en0'][0].address;
  }

  _attemptConnection() {

    console.log('Attempting connection');

    this._gatherMetadata();


    const encrypted = crypto.privateEncrypt(this.privateKey, new Buffer(this.connectionVerifyString));

    const escaped = URLSafeBase64.encode(encrypted);

    const connectionQuery = `handshake=${escaped}&verificationString=${this.connectionVerifyString}&remoteId=${this.remoteId}`;

    this.connection = ioClient.connect(config.server, {query: connectionQuery});

    this.connection.on('error', msg => {
      console.error(`Connection error: ${msg}`);
      this._attemptRegistration()
    });

    this.connection.on('connect', () => {
      console.log(`Successful connected to: ${config.server}`)
    });

    this.connection.on('disconnect', () => {
      console.log(`Disconnected from: ${config.server}`)
    })

  }

  _attemptRegistration() {

    console.log('Remote not found on the server. Attempting registration');

    request.post({url:`${config.server}/api/v1/remotes/new`, form: {deviceId:this._getDeviceId()}}, (error, responseCode, body) => {

      if (!!error) {
        return console.error(error);
      }

      const response = JSON.parse(body);

      fs.writeFile(keyLocation, response.key, (err) => {
        if(err) {
          return console.log('Writing error', err);
        }
        console.log("The file was saved!. Retrying");

        try {
            this._attemptConnection();
        } catch (e) {
            console.log('Connection failed after registration. Aborting')

        }


      });


    });
  }



};
