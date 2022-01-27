import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';
import config from '../config';

export async function getToken() {
  const cca = new ConfidentialClientApplication({
    auth: {
      clientId: config.crm.ceClientId,
      clientSecret: config.crm.ceClientSecret,
      authority: config.crm.ceAuthority,
    },
  });
  const tokenRequest = {
    scopes: [config.crm.ceResource],
  };

  const response: AuthenticationResult = await cca.acquireTokenByClientCredential(tokenRequest);
  return response.accessToken;
}
