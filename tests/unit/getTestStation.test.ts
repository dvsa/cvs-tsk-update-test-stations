import axios from 'axios-observable';
import { throwError, of } from 'rxjs';
import { AxiosResponse } from '../../node_modules/axios-observable/node_modules/axios/index.d';
import { getTestStations, mapToDynamoTestStation } from '../../src/crm/getTestStation';
import * as _ from '../../src/crm/dynamicsWebApi';
import config from '../../src/config';
import { DynamicsTestStation } from '../../src/crm/DynamicsTestStation';

jest.mock('../../src/crm/getToken', () => ({
  getToken: jest.fn().mockResolvedValue({ value: 'MOCKED_BEARER_TOKEN' }),
}));
jest.mock('../../src/utils/index');

const MOCK_DATA: AxiosResponse = {
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
        dvsa_premisecodes: 'string',
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
  headers: '',
  config: {},
};

const MOCK_ACCOUNTS_RESPONSE: AxiosResponse = {
  data: {
    value: [
      {
        '@odata.etag': 'string',
        accountid: 'ACCOUNT1',
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
        dvsa_testfacilitytype: 147160000,
        modifiedon: '',
      },
      {
        '@odata.etag': 'string',
        accountid: 'ACCOUNT2',
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
          accountid: 'ACCOUNT1',
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
          accountid: 'ACCOUNT1',
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
          accountid: 'ACCOUNT1',
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
          accountid: 'ACCOUNT2',
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

const MOCK_CONNECTIONS_NO_EMAILS_RESPONSE: AxiosResponse = {
  data: {
    value: [],
  },
  status: 200,
  statusText: 'Ok',
  headers: {
    Authorization: '',
  },
  config: {},
};

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

describe('retryStrategy', () => {
  test('GIVEN an odata endpoint WHEN there is a short transient error and no retries THEN the call is not successful.', async () => {
    config.crm.maxRetryAttempts = '0';
    config.crm.scalingDuration = '100';
    const error1 = new Error('error1!');
    axios.get = jest
      .fn()
      .mockReturnValueOnce(throwError(() => error1))
      .mockReturnValueOnce(of(MOCK_DATA));
    await expect(getTestStations(new Date())).rejects.toEqual(error1);
  });

  test('GIVEN an odata endpoint WHEN there is a short transient error THEN the call is retried and successful.', async () => {
    config.crm.maxRetryAttempts = '1';
    config.crm.scalingDuration = '100';
    const error1 = new Error('error1!');
    axios.get = jest
      .fn()
      .mockReturnValueOnce(throwError(() => error1))
      .mockReturnValueOnce(of(MOCK_DATA))
      .mockReturnValueOnce(of(MOCK_CONNECTIONS_RESPONSE));
    await expect(getTestStations(new Date())).resolves.toBeTruthy();
  });

  test('GIVEN an odata endpoint WHEN there is a long transient error THEN the call is retried and not successful.', async () => {
    config.crm.maxRetryAttempts = '1';
    config.crm.scalingDuration = '100';
    const error1 = new Error('error1!');
    const error2 = new Error('error2!');
    axios.get = jest
      .fn()
      .mockReturnValueOnce(throwError(() => error1))
      .mockReturnValueOnce(throwError(() => error2));
    return expect(getTestStations(new Date())).rejects.toEqual(error2);
  });
});

describe('mapToDynamoTestStation', () => {
  test('GIVEN mock axios odata succesful response with invalid testStationPNumber WHEN called THEN throws an error', () => {
    function throwAnError() {
      mapToDynamoTestStation(MOCK_BAD_ACCOUNTS_DATA);
    }
    expect(throwAnError).toThrowError(
      new Error('Invalid enum value provided for test station type field: 1471600 for test station: 1234'),
    );
  });
});

describe('getTestStation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GIVEN getTestStations is called with a date WHEN the call to the server is made THEN the correct url to accounts table is generated', async () => {
    const spy = jest.spyOn(_, 'getModifiedTestStations');
    axios.get = jest.fn().mockReturnValueOnce(of(MOCK_DATA)).mockReturnValueOnce(of(MOCK_CONNECTIONS_RESPONSE));
    config.crm.ceBaseUrl = 'http://testapi';
    await getTestStations(new Date('2020-10-21'));
    expect(spy).toHaveBeenCalledWith(
      'http://testapi/accounts/?$select=accountid,address1_line1,address1_line2,telephone1,dvsa_openingtimes,address1_longitude,address1_latitude,name,dvsa_premisecodes,address1_postalcode,dvsa_accountstatus,address1_city,dvsa_testfacilitytype,modifiedon&$filter=modifiedon%20ge%202020-10-21',
    );
  });

  test('GIVEN mock axios odata succesful response from accounts & connections table WHEN getTestStationEntities called THEN returns an array of DynamoTestStation objects containing array of email addresses', async () => {
    axios.get = jest
      .fn()
      .mockReturnValueOnce(of(MOCK_ACCOUNTS_RESPONSE))
      .mockReturnValueOnce(of(MOCK_CONNECTIONS_RESPONSE));

    const result = await getTestStations(new Date());

    expect(result).toHaveLength(2);
    expect(result[0].testStationEmails).toHaveLength(3);
    expect(result[1].testStationEmails).toHaveLength(1);
  });

  test('GIVEN succesful response from connections table WHEN there are no emails present THEN return DynamoTestStation object with empty array for emails', async () => {
    axios.get = jest
      .fn()
      .mockReturnValueOnce(of(MOCK_ACCOUNTS_RESPONSE))
      .mockReturnValueOnce(of(MOCK_CONNECTIONS_NO_EMAILS_RESPONSE));

    const result = await getTestStations(new Date());
    expect(result).toHaveLength(2);
    console.log(result);
    expect(result[0].testStationEmails).toHaveLength(0);
    expect(result[1].testStationEmails).toHaveLength(0);
  });
});
