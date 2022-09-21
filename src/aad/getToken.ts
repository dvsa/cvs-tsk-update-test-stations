import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';
import config from '../config';
import { getSecret } from '../utils/index';

export default async function getToken() {
  const clientSecretValue = await getSecret(config.aad.clientSecret);

  const cca = new ConfidentialClientApplication({
    auth: {
      clientId: config.aad.clientId,
      clientSecret: clientSecretValue,
    },
  });
  const tokenRequest = {
    scopes: [],
  };

  const response: AuthenticationResult = await cca.acquireTokenByClientCredential(tokenRequest);
  return response.accessToken;
}
