import { SecretsManager } from 'aws-sdk';
import logger from '../observability/logger';

const getSecret = async (secretName: string): Promise<string> => {
  logger.debug('getSecret starting.');
  const secretsManager = new SecretsManager();
  const secretValue = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  logger.debug('getSecret finishing.');
  return secretValue.SecretString;
};

export { getSecret };
