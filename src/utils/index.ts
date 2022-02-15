import { SecretsManager } from 'aws-sdk';

const getSecret = async (secretName: string): Promise<string> => {
  const secretsManager = new SecretsManager();
  const secretValue = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
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
