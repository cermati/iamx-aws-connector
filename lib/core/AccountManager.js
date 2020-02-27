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

  getUser (iamUser) {
    return this.IAM.getUser({
      UserName: iamUser.username
    }).promise();
  };

  listAttachedPolicies (iamUser) {
    return this.IAM.listAttachedUserPolicies({
      UserName: iamUser.username
    }).promise();
  };

  listAssignedGroups (iamUser) {
    return this.IAM.listGroupsForUser({
      UserName: iamUser.username
    }).promise();
  };

  createUser (iamUser) {
    return this.getUser(iamUser)
      .catch((err) => {
        if (err.code === 'NoSuchEntity') {
          return this.IAM.createUser({
            UserName: iamUser.username
          }).promise();
        }
        throw(err);
      });
  };

  deleteUser (iamUser) {
    if (!iamUser.deleteUser) {
      return Promise.resolve(null);
    }
    return this.IAM.deleteUser({
      UserName: iamUser.username
    }).promise();
  };

  createLoginProfile (iamUser, loginProfile) {
    if (!loginProfile || !loginProfile.password) {
      return Promise.resolve(null);
    }
    return this.IAM.createLoginProfile({
      UserName: iamUser.username,
      Password: loginProfile.password,
      PasswordResetRequired: loginProfile.requirePasswordReset || true
    }).promise()
    .catch((err) => {
      if (err.code !== 'EntityAlreadyExists') {
        throw(err);
      }
      this.IAM.updateLoginProfile({
        UserName: iamUser.username,
        Password: loginProfile.password,
        PasswordResetRequired: loginProfile.requirePasswordReset || true
      }).promise();
    });
  };

  deleteLoginProfile (iamUser) {
    if (!iamUser.deleteUser) {
      return Promise.resolve(null);
    }
    return this.IAM.deleteLoginProfile({
      UserName: iamUser.username
    }).promise();
  };

  attachPolicies (iamUser, accessPolicies) {
    return this._attachUserPolicies(iamUser, accessPolicies && accessPolicies.userPolicyArns || []);
  };

  detachPolicies (iamUser, accessPolicies) {
    if (!iamUser.deleteUser) {
      return this._detachUserPolicies(iamUser, accessPolicies && accessPolicies.userPolicyArns || []);
    }
    return this.listAttachedPolicies(iamUser)
        .then((result) => {
          let attachedPolicies = result.AttachedPolicies.map((o) => o.PolicyArn);
          return this._detachUserPolicies(iamUser, attachedPolicies);
        });
  };

  addToGroups (iamUser, accessPolicies) {
    return this._addToGroups(iamUser, accessPolicies && accessPolicies.groups || []);
  };

  removeFromGroups (iamUser, accessPolicies) {
    if (!iamUser.deleteUser) {
      return this._removeFromGroups(iamUser, accessPolicies && accessPolicies.groups || []);
    }
    return this.listAssignedGroups(iamUser)
        .then((result) => {
          let assignedGroups = result.Groups.map((o) => o.GroupName);
          return this._removeFromGroups(iamUser, assignedGroups);
        });
  };

  _attachUserPolicies (iamUser, userPolicyArns) {
    return Promise.map(userPolicyArns, (policyArn) => {
      return this.IAM.attachUserPolicy({
        UserName: iamUser.username,
        PolicyArn: policyArn
      }).promise();
    });
  };

  _detachUserPolicies (iamUser, userPolicyArns) {
    return Promise.map(userPolicyArns, (policyArn) => {
      return this.IAM.detachUserPolicy({
        UserName: iamUser.username,
        PolicyArn: policyArn
      }).promise();
    });
  };

  _addToGroups (iamUser, groups) {
    return Promise.map(groups, (group) => {
      return this.IAM.addUserToGroup({
        UserName: iamUser.username,
        GroupName: group
      }).promise();
    });
  };

  _removeFromGroups (iamUser, groups) {
    return Promise.map(groups, (group) => {
      return this.IAM.removeUserFromGroup({
        UserName: iamUser.username,
        GroupName: group
      }).promise();
    });
  };
};
