import axios from 'axios-observable';
import { of } from 'rxjs';
import { mocked } from 'ts-jest/utils';
import { AxiosResponse, AxiosError } from 'axios';
import {
  onRejected, createDynamoTestStation, getAccountsEntities, addConnectionsEmails,
} from '../../src/crm/dynamicsWebApi';
// import { DynamoTestStation } from '../../src/crm/DynamoTestStation';
import { DynamicsTestStation } from '../../src/crm/DynamicsTestStation';
import { getSecret } from '../../src/utils';
import { DynamoTestStation } from '../../src/crm/DynamoTestStation';

jest.mock('../../src/crm/getToken', () => ({
  getToken: jest.fn().mockResolvedValueOnce({ value: 'MOCKED_BEARER_TOKEN' }),
}));
jest.mock('../../src/utils/index');

describe('dynamicsWebApi', () => {
  mocked(getSecret).mockResolvedValue('P601,P602');

  const MOCK_BAD_ACCOUNTS_DATA: DynamicsTestStation = {
    '@odata.etag': 'string',
    accountid: '1234',
    address1_composite: 'string',
    address1_line1: 'Address 1',
    address1_line2: 'Address 2',
    telephone1: 'string',
    emailaddress1: 'string',
    dvsa_openingtimes: 'string',
    address1_longitude: 'string',
    address1_latitude: 'string',
    name: 'string',
    dvsa_premisecodes: 'string',
    address1_postalcode: 'string',
    dvsa_accountstatus: 147160001,
    address1_city: 'string',
    dvsa_testfacilitytype: 1471600,
    modifiedon: '',
  };

  const MOCK_GETACCOUNTS_RETURN: DynamicsTestStation[] = [
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
      dvsa_premisecodes: 'P601',
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
      dvsa_premisecodes: 'P602',
      address1_postalcode: 'string',
      dvsa_accountstatus: 147160001,
      address1_city: 'string',
      dvsa_testfacilitytype: 147160000,
      modifiedon: '',
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
          address1_line2: 'Address 2',
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
          dvsa_premisecodes: 'P6012',
          address1_postalcode: 'string',
          dvsa_accountstatus: 147160001,
          address1_city: 'string',
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

  const MOCK_CONNECTIONS_RESPONSE: AxiosResponse[] = [{
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
      ],
    },
    status: 200,
    statusText: 'Ok',
    headers: {
      Authorization: '',
    },
    config: {},
  },
  {
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
      ],
    },
    status: 200,
    statusText: 'Ok',
    headers: {
      Authorization: '',
    },
    config: {},
  },
  ];

  const MOCK_RESULT: DynamoTestStation[] = [
    {
      testStationId: 'string',
      testStationAccessNotes: null,
      testStationAddress: 'Address 1, Address 2',
      testStationContactNumber: 'string',
      testStationEmails: ['email@email.co.uk', 'email2@email.co.uk', 'email3@email.co.uk'],
      testStationGeneralNotes: 'string',
      testStationLongitude: 'string',
      testStationLatitude: 'string',
      testStationName: 'string',
      testStationPNumber: 'P601',
      testStationPostcode: 'string',
      testStationStatus: 'active',
      testStationTown: 'string',
      testStationType: 'atf',
    },
    {
      testStationId: 'string',
      testStationAccessNotes: null,
      testStationAddress: 'Address 1, Address 2',
      testStationContactNumber: 'string',
      testStationEmails: ['email@email.co.uk'],
      testStationGeneralNotes: null,
      testStationLongitude: 'string',
      testStationLatitude: 'string',
      testStationName: 'string',
      testStationPNumber: 'P602',
      testStationPostcode: 'string',
      testStationStatus: 'active',
      testStationTown: 'string',
      testStationType: 'atf',
    },
  ];

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

  test('GIVEN mock axios odata failure response WHEN called THEN returns error that doesn\'t contain Authorization header sent in the initial request', () => {
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

  test('GIVEN mock axios odata succesful response with invalid testStationPNumber WHEN called THEN throws an error', () => {
    function throwAnError() {
      createDynamoTestStation(MOCK_BAD_ACCOUNTS_DATA);
    }
    expect(throwAnError).toThrowError(
      new Error('Invalid enum value provided for test station type field: 1471600 for test station: 1234'),
    );
  });

  test('GIVEN mock axios odata succesful response from accounts table WHEN called THEN returns array of filtered DynamicsTestStation objects', async () => {
    const siteList = 'P601,P602';
    axios.get = jest.fn().mockReturnValueOnce(of(MOCK_ACCOUNTS_RESPONSE));
    const result = await getAccountsEntities('');
    expect(siteList).toContain(result[0].dvsa_premisecodes);
    expect(siteList).toContain(result[1].dvsa_premisecodes);
    expect(result).toHaveLength(2);
  });

  test('GIVEN mock axios odata succesful response from connections table WHEN called THEN returns an array of DynamoTestStation objects containing array of email addresses', async () => {
    axios.get = jest.fn().mockReturnValueOnce(of(MOCK_CONNECTIONS_RESPONSE[0])).mockReturnValueOnce(of(MOCK_CONNECTIONS_RESPONSE[1]));
    const result = await addConnectionsEmails(MOCK_GETACCOUNTS_RETURN);
    expect(result).toHaveLength(2);
    expect(result).toEqual(MOCK_RESULT);
    expect(result[0].testStationEmails).toHaveLength(3);
    expect(result[1].testStationEmails).toHaveLength(1);
  });
});
