import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import logger from '../observability/logger';

const getSecret = async (secretName: string): Promise<string> => {
  logger.debug('getSecret starting.');
  const secretsManager = new SecretsManagerClient();
  const secretValue = await secretsManager.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    }),
  );
  logger.debug('getSecret finishing.');
  return secretValue.SecretString;
};
const createMajorVersionNumber = (num: string): string => {
  if (!num) {
    throw new Error("Invalid format number given, it must match 'x.x.x' format.");
  }
  return num.split('.')[0];
};
const createHandlerBasePath = (s: string): string => `v${s}`;

export { createMajorVersionNumber, createHandlerBasePath, getSecret };
