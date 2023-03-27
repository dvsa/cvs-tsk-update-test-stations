export default {
  aad: {
    baseUrl: process.env.AAD_BASE_URL || 'https://graph.microsoft.com/',
    groupId: process.env.AAD_TESTER_GROUP_ID || '',
    membersToRequest: process.env.AAD_TESTER_GROUP_MEMBERS_TO_REQUEST || 999,
    filterGroupToUsersOnly: process.env.AAD_TESTER_GROUP_USERS_ONLY || true,
  },
  aws: {
    Secret: process.env.AAD_CLIENT_SECRET_NAME || '',
    dynamoTable: process.env.DYNAMO_TABLE || '',
  },
  logger: {
    logLevel: process.env.LOG_LEVEL || 'info',
  },
};
