'use strict';

const Promise = require('bluebird');
const AccountManager = require('./AccountManager').AccountManager;
const Schema = require('./Schema');
const Metadata = require('./Metadata').ModuleMetadata;
const TimeoutDelay = 1000;

exports.Connector = class AWSConnector {
  constructor (config) {
    this.accountManager = new AccountManager(config);
  };

  engine () {
    return Metadata.Engine;
  };

  version () {
    return Metadata.Version;
  };

  name () {
    return Metadata.Name;
  };

  supportedExecution () {
    return Metadata.SupportedExecution;
  };

  registryFormat () {
    return Schema.CredentialsRegistryDataSchema;
  };

  readContextFormat () {
    return Schema.ReadOnlyWorkflowContextSchema;
  };

  writeContextFormat () {
    return Schema.MutatingWorkflowContextSchema;
  };

  provision (context) {
    let mContext = { ...context };
    return this.accountManager.createUser(mContext.iamUser)
      .then(() => {
        return new Promise((resolve, reject) => {
          const asyncOps = [
            this.accountManager.attachPolicies(mContext.iamUser, mContext.accessPolicies),
            this.accountManager.addToGroups(mContext.iamUser, mContext.accessPolicies),
            this.accountManager.createLoginProfile(mContext.iamUser, mContext.loginProfile)
          ]

          Promise.all(asyncOps)
            .then(() => {
              setTimeout(resolve, TimeoutDelay);
            })
            .catch(error => { reject(error); });
        });
      })
      .then(() => Promise.resolve(mContext));
  };

  revoke (context) {
    let mContext = { ...context };
    return this.accountManager.deleteLoginProfile(mContext.iamUser, mContext.loginProfile)
      .then(this.accountManager.removeFromGroups(mContext.iamUser, mContext.accessPolicies))
      .then(this.accountManager.detachPolicies(mContext.iamUser, mContext.accessPolicies))
      .then(() => {
        return Promise.resolve(setTimeout(() => {
          this.accountManager.deleteUser(mContext.iamUser);
        }, TimeoutDelay));
      })
      .then(() => Promise.resolve(mContext));
  };

  show (context) {
    let mContext = { ...context };
    return this.accountManager.getUser(mContext.iamUser);
  };
};
