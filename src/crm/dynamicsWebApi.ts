import axios from 'axios-observable';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { getToken } from './getToken';
import { DynamicsTestStation } from './DynamicsTestStation';
import { DynamoTestStation } from './DynamoTestStation';
import { getSecret } from '../utils';
import config from '../config';

const TestStationType = new Map<number, string>([
  [147160000, 'ATF'],
  [147160001, 'IVA & ATF'],
  [147160002, 'IVA'],
]);

const TestStationStatus = new Map<number, string>([
  [147160000, 'Pending'],
  [147160001, 'Active'],
  [147160002, 'Suspended'],
  [147160003, 'Termination Requested'],
  [147160004, 'Terminated'],
]);

function createDynamoTestStation(obj: DynamicsTestStation): DynamoTestStation {
  if (!TestStationStatus.has(obj.dvsa_accountstatus)) {
    throw new Error(
      `Invalid enum value provided for test station status field: ${obj.dvsa_accountstatus} for test station: ${obj.accountid}`,
    );
  }
  if (!TestStationType.has(obj.dvsa_testfacilitytype)) {
    throw new Error(
      `Invalid enum value provided for test station type field: ${obj.dvsa_testfacilitytype} for test station: ${obj.accountid}`,
    );
  }
  return {
    testStationId: obj.accountid,
    testStationAccessNotes: null,
    testStationAddress: `${obj.address1_line1}, ${obj.address1_line2}`,
    testStationContactNumber: obj.telephone1,
    testStationEmails: [obj.emailaddress1],
    testStationGeneralNotes: obj.dvsa_openingtimes || null,
    testStationLongitude: obj.address1_longitude,
    testStationLatitude: obj.address1_latitude,
    testStationName: obj.name,
    testStationPNumber: obj.dvsa_premisecodes,
    testStationPostcode: obj.address1_postalcode,
    testStationStatus: TestStationStatus.get(obj.dvsa_accountstatus),
    testStationTown: obj.address1_city,
    testStationType: TestStationType.get(obj.dvsa_testfacilitytype),
  };
}

const onRejected = (error: AxiosError) => {
  // Removes bearer token from being logged in the error
  delete error?.config?.headers;
  return Promise.reject(error);
};

const getTestStationEntities = async (requestUrl: string): Promise<DynamoTestStation[]> => {
  const siteList = (await getSecret(config.crm.siteList)).split(',');
  const accessToken = await getToken();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  axios.interceptors.response.use((response) => response, onRejected);

  interface ApiFormat {
    value: DynamicsTestStation[];
  }

  return lastValueFrom(
    axios.get<ApiFormat>(requestUrl).pipe(
      map((data) => data.data),
      map((data: ApiFormat) => data.value.filter((obj) => siteList.includes(obj.dvsa_premisecodes))),
      map((data) => data.map((obj) => createDynamoTestStation(obj))),
    ),
  );
};

export { getTestStationEntities, onRejected, createDynamoTestStation };