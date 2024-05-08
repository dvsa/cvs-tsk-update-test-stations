import axios from 'axios-observable';
import { of } from 'rxjs';
import MockDate from 'mockdate';
import { mockClient } from 'aws-sdk-client-mock';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import 'aws-sdk-client-mock-jest';
import { handler } from '../../src/handler';
import { MOCK_DYNAMICS_ACCOUNTS_RESPONSE } from './data/mockDynamicsAccountsResponse';
import { MOCK_DYNAMICS_CONNECTIONS_RESPONSE } from './data/mockDynamicsConnectionsResponse';
import { GetExpectedEvent } from './data/mockEventBridgeEvents';

const mockSecretManager = mockClient(SecretsManagerClient);
const mockEventBridge = mockClient(EventBridgeClient);
mockSecretManager.on(GetSecretValueCommand).resolves({ SecretString: '123' });
mockEventBridge.on(PutEventsCommand).resolves({});

// MSAL (Azure AD) Token Authentication Request
jest.mock('@azure/msal-node', () => ({
  ConfidentialClientApplication: jest.fn().mockImplementation(() => ({
    acquireTokenByClientCredential: jest.fn().mockResolvedValue({ accessToken: 'OPEN SESAME' }),
  })),
}));

// Dynamics OData Response (axios)
axios.get = jest
  .fn()
  .mockReturnValueOnce(of(MOCK_DYNAMICS_ACCOUNTS_RESPONSE))
  .mockReturnValueOnce(of(MOCK_DYNAMICS_CONNECTIONS_RESPONSE));

describe('Handler integration test', () => {
  beforeAll(() => {
    MockDate.set(new Date('2022-01-01T12:34:45.000'));
  });
  afterAll(() => {
    MockDate.reset();
  });

  it('GIVEN all external resources are mocked WHEN called THEN the mocked data to be transformed and pushed to EventBridge', async () => {
    const callback = jest.fn();

    handler(null, null, callback);

    // wait for the async/promises to be resolved
    // source: https://stackoverflow.com/a/51045733/5662
    // eslint-disable-next-line @typescript-eslint/unbound-method
    await new Promise(process.nextTick);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(callback.mock.calls[0][1]).toBe('Data processed successfully; good: 3, bad: 0');

    expect(mockEventBridge).toHaveReceivedCommandTimes(PutEventsCommand, 3);
    expect(mockEventBridge).toHaveReceivedNthCommandWith(1, PutEventsCommand, GetExpectedEvent(1));
    expect(mockEventBridge).toHaveReceivedNthCommandWith(2, PutEventsCommand, GetExpectedEvent(2));
    expect(mockEventBridge).toHaveReceivedNthCommandWith(3, PutEventsCommand, GetExpectedEvent(3));
  });
});
