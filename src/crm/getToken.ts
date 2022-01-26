import msal from '@azure/msal-node';
import config from '../../config';

export const getToken = async (): Promise<string> => {
  const cca = new msal.ConfidentialClientApplication({
    auth: {
      clientId: config.crm.ceClientId,
      clientSecret: config.crm.ceClientSecret,
      authority: config.crm.ceTenantId,
    },
  });
  const tokenRequest = {
    scopes: [config.crm.ceResource],
  };

  return (await cca.acquireTokenByClientCredential(tokenRequest)).accessToken;
};
