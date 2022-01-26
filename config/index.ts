export default {
  crm: {
    ceClientId: process.env.CE_CLIENT_ID || '',
    ceClientSecret: process.env.CE_CLIENT_SECRET || '',
    ceTenantId: process.env.CE_TENANT_ID || '',
    ceResource: process.env.CE_RESOURCE || '',
    ceAccountUrl: process.env.CE_ACCOUNT_URL || '',
    maxRetryAttempts: process.env.MAX_RETRY_ATTEMPTS || '',
    scalingDuration: process.env.MAX_SCALING_DURATION || '',
  },
  aws: {
    eventBusSource: process.env.AWS_EVENT_BUS_SOURCE || '',
    eventBusName: process.env.AWS_EVENT_BUS_NAME || '',
  },
  logger: {
    logLevel: process.env.LOG_LEVEL || 'info',
  },
};
