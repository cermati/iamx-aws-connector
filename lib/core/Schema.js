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
      required: [ 'username', 'password' ]
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
    loginContext: {
      type: 'object',
      properties: {
        password: { type: 'string' },
        requirePasswordReset: { type: 'boolean', default: true }
      },
      required: [ 'password' ]
    },
    policies: {
      type: 'object',
      properties: {
        userPolicyArns: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        groupPolicyArns: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        rolePolicyArns: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    }
  },
  required: [ 'username' ]
};

const ReadOnlyWorkflowContextSchema = {
  type: "object",
  properties: {
    keyword: { type: 'string' },
    page: { type: 'integer', default: 1 }
  },
  required: [ 'keyword' ]
};

exports.CredentialsRegistryDataSchema = CredentialsRegistryDataSchema;
exports.MutatingWorkflowContextSchema = MutatingWorkflowContextSchema;
exports.ReadOnlyWorkflowContextSchema = ReadOnlyWorkflowContextSchema;
