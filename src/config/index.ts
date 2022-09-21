export default {
  aad: {
    clientId: process.env.AAD_CLIENT_ID || '',
    clientSecret: process.env.AAD_CLIENT_SECRET || '',
    authorityId: process.env.AAD_AUTHORITY_ID || '',
    baseUrl: process.env.AAD_BASE_URL || 'https://graph.microsoft.com/',
    groupId: process.env.AAD_TESTER_GROUP_ID || ''
  },
  aws: {
    dynamoTable: process.env.DYNAMO_TABLE || '',
  },
  logger: {
    logLevel: process.env.LOG_LEVEL || 'info',
  },
};
