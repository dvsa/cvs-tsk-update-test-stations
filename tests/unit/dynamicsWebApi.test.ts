import axios from 'axios-observable';
import { of } from 'rxjs';
import { mocked } from 'ts-jest/utils';
import { AxiosResponse, AxiosError } from 'axios';
import { getTestStationEntities, onRejected, createDynamoTestStation } from '../../src/crm/dynamicsWebApi';
import { DynamoTestStation } from '../../src/crm/DynamoTestStation';
import { DynamicsTestStation } from '../../src/crm/DynamicsTestStation';
import { getSecret } from '../../src/utils';

jest.mock('../../src/crm/getToken', () => ({
  getToken: jest.fn().mockResolvedValueOnce({ value: 'MOCKED_BEARER_TOKEN' }),
}));
jest.mock('../../src/utils/index');

describe('dynamicsWebApi', () => {
  mocked(getSecret).mockResolvedValue('P601,P602');

  const MOCK_BAD_DATA: DynamicsTestStation = {
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
  const MOCK_RESULT: DynamoTestStation[] = [
    {
      testStationId: 'string',
      testStationAccessNotes: null,
      testStationAddress: 'Address 1, Address 2',
      testStationContactNumber: 'string',
      testStationEmails: ['string'],
      testStationGeneralNotes: 'string',
      testStationLongitude: 'string',
      testStationLatitude: 'string',
      testStationName: 'string',
      testStationPNumber: 'P601',
      testStationPostcode: 'string',
      testStationStatus: 'Active',
      testStationTown: 'string',
      testStationType: 'ATF',
    },
    {
      testStationId: 'string',
      testStationAccessNotes: null,
      testStationAddress: 'Address 1, Address 2',
      testStationContactNumber: 'string',
      testStationEmails: ['string'],
      testStationGeneralNotes: null,
      testStationLongitude: 'string',
      testStationLatitude: 'string',
      testStationName: 'string',
      testStationPNumber: 'P602',
      testStationPostcode: 'string',
      testStationStatus: 'Active',
      testStationTown: 'string',
      testStationType: 'ATF',
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

  test("GIVEN mock axios odata failure response WHEN called THEN returns error that doesn't contain Authorization header sent in the initial request", () => {
    expect(MOCK_FAILURE.config.headers).toEqual({ Authorization: 'Bearer awdawdawdawd' });
    const PROMISE = onRejected(MOCK_FAILURE);
    return PROMISE.then(() => null, (error) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(error.config.headers).toBe(undefined);
    });
  });

  test('GIVEN mock axios odata succesful response WHEN called THEN returns array of filtered DynamoTestStation objects', async () => {
    axios.get = jest.fn().mockReturnValueOnce(of(MOCK_DATA));
    const result = await getTestStationEntities('');
    expect(result.length).toBe(2)
    expect(result).toEqual(MOCK_RESULT);
  });

  test('GIVEN mock axios odata succesful response with invalid testStationPNumber WHEN called THEN throws an error', () => {
    function throwAnError() {
      createDynamoTestStation(MOCK_BAD_DATA);
    }
    expect(throwAnError).toThrowError(new Error('Invalid enum value provided for test station type field: 1471600 for test station: 1234'));
  });
});
