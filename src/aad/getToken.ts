import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';
import config from '../config';
import { getSecret } from '../utils/index';
import { AadSecret } from './AadSecret';

export default async function getToken() {
  const secret = JSON.parse(await getSecret(config.aad.Secret)) as AadSecret;

  const cca = new ConfidentialClientApplication({
    auth: {
      clientId: secret.CVS_AAD_Client,
      clientSecret: secret.CVS_AAD_Secret,
    },
  });
  const tokenRequest = {
    scopes: ['https://graph.microsoft.com/.default'],
  };

  const response: AuthenticationResult = await cca.acquireTokenByClientCredential(tokenRequest);
  return response.accessToken;
}
