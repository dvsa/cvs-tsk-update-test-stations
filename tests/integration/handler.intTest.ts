import axios from 'axios-observable';
import { of } from 'rxjs';
import MockDate from 'mockdate';
import { handler } from '../../src/handler';

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

describe('Handler integration test', () => {
  beforeAll(() => {
    MockDate.set(new Date('2022-01-01T12:34:45.000'));
  });
  afterAll(() => {
    MockDate.reset();
  });
});
