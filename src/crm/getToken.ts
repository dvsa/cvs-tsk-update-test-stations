import msal from '@azure/msal-node';

export const getToken = async (): Promise<string> => {
  const cca = new msal.ConfidentialClientApplication({
    auth: {
      clientId: process.env.CE_CLIENT_ID,
      clientSecret: process.env.CE_SECRET_NAME,
      authority: process.env.CE_TENANT_ID,
    },
  });
  const tokenRequest = {
    scopes: [process.env.CE_RESOURCE],
  };

  return (await cca.acquireTokenByClientCredential(tokenRequest)).accessToken;
};
