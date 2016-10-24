import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import URLSafeBase64 from 'urlsafe-base64';
import ioClient from 'socket.io-client';
import config from '../../config';

export default class webSocketConnector {

  constructor() {

    this.connectionVerifyString = this._createVerificationString();
    this.privateKey = this._getPrivateKey();
    this.remoteId = this._getDeviceId();

    this._attemptConnection();
  }

  _createVerificationString() {
    return URLSafeBase64.encode(new Buffer(Date.now().toString()));
  }

  _getPrivateKey() {
    return fs.readFileSync(config.privateKey, 'utf8');
  }

  _getDeviceId() {
    return os.networkInterfaces()['en0'][0].address;
  }

  _attemptConnection() {

    const encrypted = crypto.privateEncrypt(this.privateKey, new Buffer(this.connectionVerifyString));
    const escaped = URLSafeBase64.encode(encrypted);

    const connectionQurey = `handshake=${escaped}&verificationString=${this.connectionVerifyString}&remoteId=${this.remoteId}`;

    this.connection = ioClient.connect(config.server, {query: connectionQurey});

    this.connection.on('error', msg => {
      console.log(`Connection error: ${msg}`);
    });

    this.connection.on('connect', () => {
      console.log(`Successful connected to: ${config.server}`)
    })

  }



};
