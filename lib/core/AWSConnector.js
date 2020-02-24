'use strict';

const Promise = require('bluebird');
const AccountManager = require('./AccountManager').AccountManager;
const Schema = require('./Schema');
const Metadata = require('./Metadata').ModuleMetadata;

exports.Connector = class AWSConnector {
  constructor (config) {
    this.config = config;
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
      .then(this.accountManager.attachPolicies(mContext.iamUser, mContext.policies))
      .then(this.accountManager.createLoginProfile(mContext.iamUser, mContext.loginProfile))
      .then(() => Promise.resolve(mContext));
  };
  
  revoke (context) {
    let mContext = { ...context };
    return this.accountManager.deleteLoginProfile(mContext.iamUser, mContext.loginProfile)
      .then(this.accountManager.detachPolicy(mContext.iamUser, mContext.policies))
      .then(this.accountManager.deleteUser(mContext.iamUser))
      .then(() => Promise.resolve(mContext));
  };

  show (context) {
    let mContext = { ...context };
    return this.accountManager.deleteLoginProfile(mContext)
      .then(this.accountManager.detachPolicy(mContext))
      .then(this.accountManager.deleteUser(mContext))
      .then(() => Promise.resolve(mContext));
  };
};
