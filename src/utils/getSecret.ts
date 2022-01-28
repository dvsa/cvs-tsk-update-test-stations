import { SecretsManager } from 'aws-sdk';

async function getSecret(secretName: string): Promise<string> {
  const secretsManager = new SecretsManager();
  const secretValue = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return secretValue.SecretString;
}
export { getSecret };
