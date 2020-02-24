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

  createUser (iamUser) {
    return this.IAM.createUser({
      UserName: iamUser.username
    }).promise();
  };

  deleteUser (iamUser) {
    return this.IAM.deleteUser({
      UserName: iamUser.username
    }).promise();
  }

  createLoginProfile (iamUser, loginProfile) {
    return this.IAM.createLoginProfile({
      UserName: iamUser.username,
      Password: loginProfile.password,
      PasswordResetRequired: loginProfile.requirePasswordReset
    }).promise();
  };

  deleteLoginProfile (iamUser) {
    return this.IAM.deleteLoginProfile({
      UserName: iamUser.username
    }).promise();
  };

  attachPolicies (iamUser, policies) {
    return this._attachUserPolicies(iamUser, policies.userPolicyArns || [])
      .then(this._attachGroupPolicies(iamUser, policies.groupPolicyArns || []))
      .then(this._attachRolePolicies(iamUser, policies.rolePolicyArns || []))
  };

  detachPolicies (iamUser, policies) {
    return this._detachUserPolicies(iamUser, policies.userPolicyArns || [])
      .then(this._detachGroupPolicies(iamUser, policies.groupPolicyArns || []))
      .then(this._detachRolePolicies(iamUser, policies.rolePolicyArns || []))
  };

  _attachUserPolicies(iamUser, userPolicyArns) {
    return Promise.map(userPolicyArns, (policyArn) => {
      return this.IAM.attachUserPolicy({
        UserName: iamUser.username,
        PolicyArn: policyArn
      }).promise();
    });
  };

  _attachGroupPolicies(iamUser, groupPolicyArns) {
    return Promise.map(groupPolicyArns, (policyArn) => {
      return this.IAM.attachGroupPolicy({
        UserName: iamUser.username,
        PolicyArn: policyArn
      }).promise();
    });
  };

  _attachRolePolicies(iamUser, rolePolicyArns) {
    return Promise.map(rolePolicyArns, (policyArn) => {
      return this.IAM.attachRolePolicy({
        UserName: iamUser.username,
        PolicyArn: policyArn
      }).promise();
    });
  };

  _detachUserPolicies(iamUser, userPolicyArns) {
    return Promise.map(userPolicyArns, (policyArn) => {
      return this.IAM.detachUserPolicy({
        UserName: iamUser.username,
        PolicyArn: policyArn
      }).promise();
    });
  };

  _detachGroupPolicies(iamUser, groupPolicyArns) {
    return Promise.map(groupPolicyArns, (policyArn) => {
      return this.IAM.detachGroupPolicy({
        UserName: iamUser.username,
        PolicyArn: policyArn
      }).promise();
    });
  };

  _detachRolePolicies(iamUser, rolePolicyArns) {
    return Promise.map(rolePolicyArns, (policyArn) => {
      return this.IAM.detachRolePolicy({
        UserName: iamUser.username,
        PolicyArn: policyArn
      }).promise();
    });
  };
};
