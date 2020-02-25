'use strict';

const CredentialsRegistryDataSchema = {
  type: 'object',
  properties: {
    credentials: {
      type: 'object',
      properties: {
        accessKeyId: { type: 'string' },
        accessKeySecret: { type: 'string' }
      },
      required: [ 'accessKeyId', 'accessKeySecret' ]
    },
    region: { type: 'string' }
  },
  required: [ 'credentials', 'region' ]
};

const MutatingWorkflowContextSchema = {
  type: "object",
  properties: {
    iamUser: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        deleteUser: { type: 'boolean', default: false }
      },
      required: [ 'username' ]
    },
    loginProfile: {
      type: 'object',
      properties: {
        password: { type: 'string' },
        requirePasswordReset: { type: 'boolean', default: true }
      },
      required: [ 'password' ]
    },
    accessPolicies: {
      type: 'object',
      properties: {
        userPolicyArns: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        groups: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    }
  }
};

const ReadOnlyWorkflowContextSchema = {
  type: 'object',
  properties: {
    iamUser: {
      type: 'object',
      properties: {
        username: { type: 'string' }
      },
      required: [ 'username' ]
    }
  }
};

exports.CredentialsRegistryDataSchema = CredentialsRegistryDataSchema;
exports.MutatingWorkflowContextSchema = MutatingWorkflowContextSchema;
exports.ReadOnlyWorkflowContextSchema = ReadOnlyWorkflowContextSchema;
