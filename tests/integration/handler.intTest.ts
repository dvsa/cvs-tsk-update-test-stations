import axios from 'axios-observable';
import { of } from 'rxjs';
import MockDate from 'mockdate';
import { handler } from '../../src/handler';
import { MOCK_DYNAMICS_ACCOUNTS_RESPONSE } from './data/mockDynamicsAccountsResponse';
import { MOCK_DYNAMICS_CONNECTIONS_RESPONSE } from './data/mockDynamicsConnectionsResponse';
import { GetExpectedEvent } from './data/mockEventBridgeEvents';

// mock the external resources
// AWS
const putEventsFn = jest.fn();
jest.mock('aws-sdk', () => ({
  SecretsManager: jest.fn().mockImplementation(() => ({
    getSecretValue: jest.fn().mockImplementation(() => ({
      promise: jest.fn().mockResolvedValue({}),
    })),
  })),
  EventBridge: jest.fn().mockImplementation(() => ({
    putEvents: jest.fn().mockImplementation((params: unknown) => {
      putEventsFn(params); // allows us to test the event payload
      return {
        promise: jest.fn(),
      };
    }),
  })),
}));

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
  .mockReturnValueOnce(of(MOCK_DYNAMICS_CONNECTIONS_RESPONSE[0]))
  .mockReturnValueOnce(of(MOCK_DYNAMICS_CONNECTIONS_RESPONSE[1]))
  .mockReturnValueOnce(of(MOCK_DYNAMICS_CONNECTIONS_RESPONSE[2]));

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

    expect(callback).toHaveBeenCalledWith(null, 'Data processed successfully; good: 3, bad: 0');

    expect(putEventsFn).toHaveBeenCalledTimes(3);
    expect(putEventsFn).toHaveBeenNthCalledWith(1, GetExpectedEvent(1));
    expect(putEventsFn).toHaveBeenNthCalledWith(2, GetExpectedEvent(2));
    expect(putEventsFn).toHaveBeenNthCalledWith(3, GetExpectedEvent(3));
  });
});
