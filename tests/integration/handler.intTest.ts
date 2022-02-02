/* eslint-disable no-var */
import axios from 'axios-observable';
import { of } from 'rxjs';
import { handler } from '../../src/handler';
import { MOCK_DYNAMICS_RESPONSE } from './data/mock_dynamics_ce_response';

// mock our config
const ALLOWED_SITE_LIST = 'SITE-1,SITE-2,SITE-3';

var mockPutEventsPromise = jest.fn().mockResolvedValue(true);
var mockPutEvents = jest.fn().mockImplementation(() => ({ promise: mockPutEventsPromise }));

// mock the external resources
// AWS
// const mockPutEvents = jest.fn().mockImplementation(() => ({
//   promise: jest.fn().mockResolvedValue(true),
// }));

jest.mock('aws-sdk', () => ({
  SecretsManager: jest.fn().mockImplementation(() => ({
    getSecretValue: jest.fn().mockImplementation(() => ({
      promise: jest.fn().mockResolvedValue({ SecretString: ALLOWED_SITE_LIST }),
    })),
  })),
  EventBridge: jest.fn().mockImplementation(() => ({
    putEvents: mockPutEvents,
    // putEvents: jest.fn().mockImplementation(() => ({
    //   promise: mockPutEventsPromise,
    // })),
  })),
}));

// MSAL (Azure AD) Token Authentication Request
jest.mock('@azure/msal-node', () => ({
  ConfidentialClientApplication: jest.fn().mockImplementation(() => ({
    acquireTokenByClientCredential: jest.fn().mockResolvedValue({ accessToken: 'OPEN SESAME' }),
  })),
}));

// Dynamics OData Response (axios)
axios.get = jest.fn().mockReturnValue(of(MOCK_DYNAMICS_RESPONSE));

describe('Handler integration test', () => {
  beforeAll(() => {

  });

  it('GIVEN all external resources are mocked WHEN called THEN the mocked data be transformed and pushed to EventBridge', async () => {
    const callback = jest.fn();

    handler(null, null, callback);

    // wait for the async/promises to be resolved
    // source: https://stackoverflow.com/a/51045733/5662
    // eslint-disable-next-line @typescript-eslint/unbound-method
    await new Promise(process.nextTick);

    expect(callback).toHaveBeenCalledWith(null, 'Data processed successfully; good: 3, bad: 0');

    expect(mockPutEventsPromise).toHaveBeenCalledTimes(3);
    expect(mockPutEvents).toHaveBeenNthCalledWith(1, { Entries: [] });
    expect(mockPutEvents).toHaveBeenNthCalledWith(2, { Entries: [] });
    expect(mockPutEvents).toHaveBeenNthCalledWith(3, { Entries: [] });
  });
});
