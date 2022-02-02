import { getSecret } from '../../src/utils';

// mock the external resources
// AWS SecretsManager
jest.mock('aws-sdk', () => ({
  SecretsManager: jest.fn().mockImplementation(() => ({
    getSecretValue: jest.fn().mockImplementation(() => ({
      promise: jest.fn().mockResolvedValue({ SecretString: 'MY SECRET' }),
    })),
  })),
}));

describe('Handler integration test', () => {
  it('Should mock SecretsManager', async () => {
    const val = await getSecret('foo');
    expect(val).toBe('MY SECRET');
  });
});
