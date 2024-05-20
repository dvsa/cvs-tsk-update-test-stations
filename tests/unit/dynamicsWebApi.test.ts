import axios from 'axios-observable';
import { of } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { onRejected, getModifiedTestStations, getReportRecipientEmails } from '../../src/crm/dynamicsWebApi';
import { DynamicsTestStation } from '../../src/crm/DynamicsTestStation';
import { DynamicsConnection } from '../../src/crm/DynamicsConnection';

jest.mock('../../src/crm/getToken', () => ({
  getToken: jest.fn().mockResolvedValueOnce({ value: 'MOCKED_BEARER_TOKEN' }),
}));
jest.mock('../../src/utils/index');

describe('dynamicsWebApi', () => {
  const MOCK_GETACCOUNTS_RETURN: DynamicsTestStation[] = [
    {
      '@odata.etag': 'string',
      accountid: 'string',
      address1_composite: 'string',
      address1_line1: 'Address 1',
      address1_line2: '',
      telephone1: 'string',
      emailaddress1: 'string',
      dvsa_openingtimes: 'string',
      address1_longitude: 'string',
      address1_latitude: 'string',
      name: 'string',
      dvsa_premisecodes: 'P601',
      address1_postalcode: 'string',
      dvsa_accountstatus: 147160001,
      address1_city: 'string',
      address1_country: 'string',
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
      dvsa_premisecodes: 'P602',
      address1_postalcode: 'string',
      dvsa_accountstatus: 147160001,
      address1_city: 'string',
      address1_country: 'string',
      dvsa_testfacilitytype: 147160000,
      modifiedon: '',
    },
  ];

  const MOCK_GETCONNECTIONS_RESPONSE: DynamicsConnection[] = [
    {
      '@odata.etag': 'string',
      _record2id_value: 'string',
      connectionid: 'string',
      record1id_account: {
        accountid: 'string',
        accountnumber: '00000',
      },
      record2id_contact: {
        emailaddress1: 'email@email.co.uk',
        contactid: 'string',
      },
    },
    {
      '@odata.etag': 'string',
      _record2id_value: 'string',
      connectionid: 'string',
      record1id_account: {
        accountid: 'string',
        accountnumber: '00000',
      },
      record2id_contact: {
        emailaddress1: 'email2@email.co.uk',
        contactid: 'string',
      },
    },
    {
      '@odata.etag': 'string',
      _record2id_value: 'string',
      connectionid: 'string',
      record1id_account: {
        accountid: 'string',
        accountnumber: '00000',
      },
      record2id_contact: {
        emailaddress1: 'email3@email.co.uk',
        contactid: 'string',
      },
    },
    {
      '@odata.etag': 'string',
      _record2id_value: 'string',
      connectionid: 'string',
      record1id_account: {
        accountid: 'string',
        accountnumber: '00000',
      },
      record2id_contact: {
        emailaddress1: 'email@email.co.uk',
        contactid: 'string',
      },
    },
  ];

  const MOCK_ACCOUNTS_RESPONSE: AxiosResponse = {
    data: {
      value: [
        {
          '@odata.etag': 'string',
          accountid: 'string',
          address1_composite: 'string',
          address1_line1: 'Address 1',
          address1_line2: '',
          telephone1: 'string',
          emailaddress1: 'string',
          dvsa_openingtimes: 'string',
          address1_longitude: 'string',
          address1_latitude: 'string',
          name: 'string',
          dvsa_premisecodes: 'P601',
          address1_postalcode: 'string',
          dvsa_accountstatus: 147160001,
          address1_city: 'string',
          address1_country: 'string',
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
          dvsa_premisecodes: 'P602',
          address1_postalcode: 'string',
          dvsa_accountstatus: 147160001,
          address1_city: 'string',
          address1_country: 'string',
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

  const MOCK_CONNECTIONS_RESPONSE: AxiosResponse = {
    data: {
      value: [
        {
          '@odata.etag': 'string',
          _record2id_value: 'string',
          connectionid: 'string',
          record1id_account: {
            accountid: 'string',
            accountnumber: '00000',
          },
          record2id_contact: {
            emailaddress1: 'email@email.co.uk',
            contactid: 'string',
          },
        },
        {
          '@odata.etag': 'string',
          _record2id_value: 'string',
          connectionid: 'string',
          record1id_account: {
            accountid: 'string',
            accountnumber: '00000',
          },
          record2id_contact: {
            emailaddress1: 'email2@email.co.uk',
            contactid: 'string',
          },
        },
        {
          '@odata.etag': 'string',
          _record2id_value: 'string',
          connectionid: 'string',
          record1id_account: {
            accountid: 'string',
            accountnumber: '00000',
          },
          record2id_contact: {
            emailaddress1: 'email3@email.co.uk',
            contactid: 'string',
          },
        },
        {
          '@odata.etag': 'string',
          _record2id_value: 'string',
          connectionid: 'string',
          record1id_account: {
            accountid: 'string',
            accountnumber: '00000',
          },
          record2id_contact: {
            emailaddress1: 'email@email.co.uk',
            contactid: 'string',
          },
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

  const MOCK_FAILURE: AxiosError = {
    name: '',
    message: '',
    config: {
      headers: {
        Authorization: 'Bearer awdawdawdawd',
      },
    },
    code: '400',
    isAxiosError: true,
    toJSON: () => null,
  };

  test("GIVEN mock axios odata failure response WHEN called THEN returns error that doesn't contain Authorization header sent in the initial request", () => {
    expect(MOCK_FAILURE.config.headers).toEqual({ Authorization: 'Bearer awdawdawdawd' });
    const PROMISE = onRejected(MOCK_FAILURE);
    return PROMISE.then(
      () => null,
      (error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(error.config.headers).toBe(undefined);
      },
    );
  });

  test('GIVEN mock axios odata successful response from connections table WHEN called THEN returns array of DynamicsConnection objects', async () => {
    axios.get = jest.fn().mockReturnValueOnce(of(MOCK_CONNECTIONS_RESPONSE));
    const result = await getReportRecipientEmails();
    expect(result).toHaveLength(4);
    expect(result).toEqual(MOCK_GETCONNECTIONS_RESPONSE);
  });

  test('GIVEN mock axios odata succesful response from accounts table WHEN called THEN returns array of DynamicsTestStation objects', async () => {
    axios.get = jest.fn().mockReturnValueOnce(of(MOCK_ACCOUNTS_RESPONSE));
    const result = await getModifiedTestStations('');
    expect(result).toHaveLength(2);
    expect(result).toEqual(MOCK_GETACCOUNTS_RETURN);
  });
});
