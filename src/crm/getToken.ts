import { ConfidentialClientApplication, AuthenticationResult } from '@azure/msal-node';
import config from '../config';
import logger from '../observability/logger';
import { getSecret } from '../utils/index';

export async function getToken() {
  logger.debug('getToken starting.');
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
  logger.debug('getToken finishing.');
  return response.accessToken;
}
