import axios from 'axios-observable';
import { throwError, of } from 'rxjs';
import { mocked } from 'ts-jest/utils';
import { AxiosResponse } from '../../node_modules/axios-observable/node_modules/axios/index.d';
import { getTestStations } from '../../src/crm/getTestStation';
import * as GetTestStations from '../../src/crm/dynamicsWebApi';
import config from '../../src/config';
import { getSecret } from '../../src/utils';

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

describe('retryStrategy', () => {
  mocked(getSecret).mockResolvedValue('P601,P602');

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
      .mockReturnValueOnce(of(MOCK_DATA));
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

describe('getTestStation', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GIVEN getTestStations is called with a date WHEN the call to the server is made THEN the correct url is generated', async () => {
    jest.mock('../../src/crm/dynamicsWebApi', () => jest.fn());
    const spy = jest.spyOn(GetTestStations, 'getTestStationEntities');
    axios.get = jest.fn().mockReturnValueOnce(of(MOCK_DATA));
    config.crm.ceBaseUrl = 'http://testapi';
    await getTestStations(new Date('2020-10-21'));
    expect(spy).toHaveBeenCalledWith(
      'http://testapi/accounts/?$select=accountid,address1_composite,name,emailaddress1,dvsa_premisecodes,dvsa_testfacilitytype,dvsa_accountstatus,address1_latitude,address1_longitude,telephone1,dvsa_openingtimes,modifiedon&$filter=modifiedon%20ge%202020-10-21',
    );
  });
});
