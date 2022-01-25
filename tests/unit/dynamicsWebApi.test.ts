import axios from 'axios-observable';
import { of } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { getTestStationEntities, onRejected } from '../../src/crm/dynamicsWebApi';
import { DynamoTestStation } from '../../src/Interfaces/DynamoTestStation';

jest.mock('../../src/crm/getToken', () => ({
  getToken: jest.fn().mockResolvedValueOnce({ value: 'MOCKED_BEARER_TOKEN' }),
}));

describe('dynamicsWebApi', () => {
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
    headers: {
      Authorization: '',
    },
    config: {},
  };
  const MOCK_RESULT: DynamoTestStation[] = [
    {
      testStationId: 'string',
      testStationAccessNotes: null,
      testStationAddress: 'Address 1Address 2',
      testStationContactNumber: 'string',
      testStationEmails: 'string',
      testStationGeneralNotes: 'string',
      testStationLongitude: 'string',
      testStationLatitude: 'string',
      testStationName: 'string',
      testStationPNumber: 'string',
      testStationPostcode: 'string',
      testStationStatus: 'Active',
      testStationTown: 'string',
      testStationType: 'ATF',
    },
    {
      testStationId: 'string',
      testStationAccessNotes: null,
      testStationAddress: 'Address 1Address 2',
      testStationContactNumber: 'string',
      testStationEmails: 'string',
      testStationGeneralNotes: null,
      testStationLongitude: 'string',
      testStationLatitude: 'string',
      testStationName: 'string',
      testStationPNumber: 'string',
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
    PROMISE.then(() => null, (error) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(error.config.headers).toBe(null);
      },
    );
  });

  test('GIVEN mock axios odata succesful response WHEN called THEN returns array of DynamoTestStation objects', async () => {
    axios.get = jest.fn().mockReturnValueOnce(of(MOCK_DATA));
    const result = await getTestStationEntities('');
    expect(result).toEqual(MOCK_RESULT);
  });
});
