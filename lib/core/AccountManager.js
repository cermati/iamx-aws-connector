'use strict';

const Promise = require('bluebird');
const AWS = require('aws-sdk');

exports.AccountManager = class AccountManager {
  constructor (config) {
    this.config = config;

    AWS.config.setPromisesDependency(Promise);
    AWS.config.update({
      accessKeyId: this.config.credentials.accessKeyId,
      secretAccessKey: this.config.credentials.secretAccessKey,
      region: this.config.region
    });

    this.IAM = new AWS.IAM({ apiVersion: '2010-05-08' });
  };

  createUser (username) {
    return this.IAM.createUser({
      UserName: username
    }).promise();
  };

  deleteUser (username) {
    return this.IAM.deleteUser({
      UserName: username
    }).promise();
  }

  createLoginProfile (username, password) {
    return this.IAM.createLoginProfile({
      UserName: username,
      Password: password,
      PasswordResetRequired: true
    }).promise();
  };

  deleteLoginProfile (username) {
    return this.IAM.deleteLoginProfile({
      UserName: username
    }).promise();
  };

  attachPolicies (username, policies) {
    return this.IAM.attachUserPolicy({
      UserName: username,
      PolicyArn: policies.userPolicyArns
    }).promise();
  };

  detachPolicy (username, policies) {
    return this.IAM.detachUserPolicy({
      UserName: username,
      PolicyArn: policies.userPolicyArns
    }).promise();
  };
};
