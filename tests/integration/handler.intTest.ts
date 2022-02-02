import axios from 'axios-observable';
import { handler } from '../../src/handler';
// import { getSecret } from '../../src/utils';

// mock our config
const ALLOWED_SITE_LIST = 'SITE-1,SITE-2,SITE-3';

const MOCK_DYNAMICS_RESPONSE = [
  {
    '@odata.etag': 'string',
    accountid: 'string',
    address1_composite: 'string',
    address1_line1: 'Address 1',
    address1_line2: 'Address 2',
    telephone1: 'string',
    emailaddress1: 'string',
    dvsa_openingtimes: 'string',
    address1_longitude: 'string',
    address1_latitude: 'string',
    name: 'string',
    dvsa_premisecodes: 'SITE-1',
    address1_postalcode: 'string',
    dvsa_accountstatus: 147160001,
    address1_city: 'string',
    dvsa_testfacilitytype: 147160000,
    modifiedon: '',
  },
  {
    '@odata.etag': 'string',
    accountid: 'string',
    address1_composite: 'string',
    address1_line1: 'Address 1',
    address1_line2: 'Address 2',
    telephone1: 'string',
    emailaddress1: 'string',
    dvsa_openingtimes: null,
    address1_longitude: 'string',
    address1_latitude: 'string',
    name: 'string',
    dvsa_premisecodes: 'SITE-2',
    address1_postalcode: 'string',
    dvsa_accountstatus: 147160001,
    address1_city: 'string',
    dvsa_testfacilitytype: 147160000,
    modifiedon: '',
  },
  {
    '@odata.etag': 'string',
    accountid: 'string',
    address1_composite: 'string',
    address1_line1: 'Address 1',
    address1_line2: 'Address 2',
    telephone1: 'string',
    emailaddress1: 'string',
    dvsa_openingtimes: 'string',
    address1_longitude: 'string',
    address1_latitude: 'string',
    name: 'string',
    dvsa_premisecodes: 'SITE-3',
    address1_postalcode: 'string',
    dvsa_accountstatus: 147160001,
    address1_city: 'string',
    dvsa_testfacilitytype: 147160000,
    modifiedon: '',
  },
  {
    '@odata.etag': 'string',
    accountid: 'string',
    address1_composite: 'string',
    address1_line1: 'Address 1',
    address1_line2: 'Address 2',
    telephone1: 'string',
    emailaddress1: 'string',
    dvsa_openingtimes: 'string',
    address1_longitude: 'string',
    address1_latitude: 'string',
    name: 'string',
    dvsa_premisecodes: 'EXCLUDED-SITE-99',
    address1_postalcode: 'string',
    dvsa_accountstatus: 147160001,
    address1_city: 'string',
    dvsa_testfacilitytype: 147160000,
    modifiedon: '',
  },
];

// mock the external resources
// AWS SecretsManager
jest.mock('aws-sdk', () => ({
  SecretsManager: jest.fn().mockImplementation(() => ({
    getSecretValue: jest.fn().mockImplementation(() => ({
      promise: jest.fn().mockResolvedValue({ SecretString: ALLOWED_SITE_LIST }),
    })),
  })),
  EventBridge: jest.fn().mockImplementation(() => ({
    putEvents: jest.fn().mockImplementation(() => ({
      promise: jest.fn().mockResolvedValue(true),
    })),
  })),
}));

// MSAL (Azure AD) Token Authentication Request
jest.mock('@azure/msal-node', () => ({
  ConfidentialClientApplication: jest.fn().mockImplementation(() => ({
    acquireTokenByClientCredential: jest.fn().mockResolvedValue({ accessToken: 'OPEN SESAME' }),
  })),
}));

// // Dynamics OData Response (axios)
axios.get = jest.fn().mockResolvedValue({ data: { value: MOCK_DYNAMICS_RESPONSE } });

// jest.mock('../../src/config/index', () => ({
//   crm: {
//     ceClientId: '',
//     ceClientSecret: '',
//     ceAuthority: '',
//     ceResource: '',
//     ceAccountUrl: 'http://localhost:1234/',
//     maxRetryAttempts: '',
//     scalingDuration: '',
//     siteList: '',
//   },
//   aws: {
//     eventBusSource: '',
//     eventBusName: '',
//   },
//   logger: {
//     logLevel: 'verbose',
//   },
// }));

describe('Handler integration test', () => {
  // it('Should mock SecretsManager', async () => {
  //   const val = await getSecret('foo');
  //   expect(val).toBe(ALLOWED_SITE_LIST);
  // });
  it('GIVEN all external resources are mocked WHEN called THEN the mocked data be transformed and pushed to EventBridge', () => {
    const callback = jest.fn();

    handler(null, null, callback);

    expect(callback).toHaveBeenCalledWith(1, null, 'Data processed successfully; good: 3, bad: 0');
  });
});
