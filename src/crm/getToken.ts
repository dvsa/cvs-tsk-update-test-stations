import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';
import config from '../config';
import { getSecret } from '../utils/getSecret';

export async function getToken() {
  const clientSecretValue = await getSecret(config.crm.ceClientSecret);

  const cca = new ConfidentialClientApplication({
    auth: {
      clientId: config.crm.ceClientId,
      clientSecret: clientSecretValue,
      authority: config.crm.ceAuthority,
    },
  });
  const tokenRequest = {
    scopes: [config.crm.ceResource],
  };

  const response: AuthenticationResult = await cca.acquireTokenByClientCredential(tokenRequest);
  return response.accessToken;
}
