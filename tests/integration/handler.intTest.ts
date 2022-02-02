import { AxiosResponse } from 'axios';
import axios from 'axios-observable';
import { of } from 'rxjs';
import { handler } from '../../src/handler';

// mock our config
const ALLOWED_SITE_LIST = 'SITE-1,SITE-2,SITE-3';

const MOCK_DYNAMICS_RESPONSE: AxiosResponse = {
  data: {
    value: [
      {
        '@odata.etag': 'SITE-1 etag',
        accountid: 'SITE-1-id',
        address1_composite: 'SITE-1 address composite',
        address1_line1: 'SITE-1 Address 1',
        address1_line2: 'SITE-1 Address 2',
        telephone1: 'SITE-1 telephone',
        emailaddress1: 'SITE-1 email',
        dvsa_openingtimes: 'SITE-1 opening times',
        address1_longitude: '1',
        address1_latitude: '1',
        name: 'SITE-1 name',
        dvsa_premisecodes: 'SITE-1',
        address1_postalcode: 'SITE-1 postcode',
        dvsa_accountstatus: 147160001,
        address1_city: 'SITE-1 city',
        dvsa_testfacilitytype: 147160000,
        modifiedon: '2022-02-02',
      },
      {
        '@odata.etag': 'SITE-2 etag',
        accountid: 'SITE-2-id',
        address1_composite: 'SITE-2 address composite',
        address1_line1: 'SITE-2 address 1',
        address1_line2: 'SITE-2 address 2',
        telephone1: 'SITE-2 telephone',
        emailaddress1: 'SITE-2 email',
        dvsa_openingtimes: 'SITE-2',
        address1_longitude: '2',
        address1_latitude: '2',
        name: 'SITE-2 name',
        dvsa_premisecodes: 'SITE-2',
        address1_postalcode: 'SITE-2 postcode',
        dvsa_accountstatus: 147160001,
        address1_city: 'SITE-2 city',
        dvsa_testfacilitytype: 147160000,
        modifiedon: '',
      },
      {
        '@odata.etag': 'SITE-3 etag',
        accountid: 'SITE-3-id',
        address1_composite: 'SITE-3 address composite',
        address1_line1: 'SITE-3 address 1',
        address1_line2: 'SITE-3 address 2',
        telephone1: 'SITE-3 telephone',
        emailaddress1: 'SITE-3 email',
        dvsa_openingtimes: 'SITE-3',
        address1_longitude: '3',
        address1_latitude: '3',
        name: 'SITE-3 name',
        dvsa_premisecodes: 'SITE-3',
        address1_postalcode: 'SITE-3 postcode',
        dvsa_accountstatus: 147160001,
        address1_city: 'SITE-3 city',
        dvsa_testfacilitytype: 147160000,
        modifiedon: '',
      },
      {
        '@odata.etag': 'SITE-99 etag',
        accountid: 'SITE-99-id',
        address1_composite: 'SITE-99 address composite',
        address1_line1: 'SITE-99 address 1',
        address1_line2: 'SITE-99 address 2',
        telephone1: 'SITE-99 telephone',
        emailaddress1: 'SITE-99 email',
        dvsa_openingtimes: 'SITE-99',
        address1_longitude: '99',
        address1_latitude: '99',
        name: 'SITE-99 name',
        dvsa_premisecodes: 'EXCLUDED-SITE-99',
        address1_postalcode: 'SITE-99 postcode',
        dvsa_accountstatus: 147160001,
        address1_city: 'SITE-99 city',
        dvsa_testfacilitytype: 147160000,
        modifiedon: '',
      },
    ],
  },
  status: 200,
  statusText: 'Ok',
  headers: {
    Authorization: '',
  },
  config: {},
};

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

// Dynamics OData Response (axios)
axios.get = jest.fn().mockReturnValue(of(MOCK_DYNAMICS_RESPONSE));

// MSAL (Azure AD) Token Authentication Request
jest.mock('@azure/msal-node', () => ({
  ConfidentialClientApplication: jest.fn().mockImplementation(() => ({
    acquireTokenByClientCredential: jest.fn().mockResolvedValue({ accessToken: 'OPEN SESAME' }),
  })),
}));

describe('Handler integration test', () => {
  it('GIVEN all external resources are mocked WHEN called THEN the mocked data be transformed and pushed to EventBridge', async () => {
    const callback = jest.fn();

    handler(null, null, callback);

    // wait for the async/promises to be resolved
    // source: https://stackoverflow.com/a/51045733/5662
    // eslint-disable-next-line @typescript-eslint/unbound-method
    await new Promise(process.nextTick);

    expect(callback).toHaveBeenCalledWith(null, 'Data processed successfully; good: 3, bad: 0');
  });
});
