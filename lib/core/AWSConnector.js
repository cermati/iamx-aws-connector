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
        return Promise.resolve(setTimeout(() => {
          this.accountManager.attachPolicies(mContext.iamUser, mContext.policies);
          this.accountManager.createLoginProfile(mContext.iamUser, mContext.loginProfile);
        }, TimeoutDelay));
      })
      .then(() => Promise.resolve(mContext));
  };
  
  revoke (context) {
    let mContext = { ...context };
    return this.accountManager.deleteLoginProfile(mContext.iamUser, mContext.loginProfile)
      .then(this.accountManager.detachPolicies(mContext.iamUser, mContext.policies))
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
