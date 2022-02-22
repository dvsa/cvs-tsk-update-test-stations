import axios from 'axios-observable';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { getToken } from './getToken';
import { DynamicsTestStation } from './DynamicsTestStation';
import { DynamicsConnection } from './DynamicsConnection';
import { DynamoTestStation } from './DynamoTestStation';
import { getSecret } from '../utils';
import config from '../config';
import logger from '../observability/logger';

const { ceRoleId, ceBaseUrl } = config.crm;

const TestStationType = new Map<number, string>([
  [147160000, 'atf'],
  [147160001, 'gvts'],
  [147160002, 'potf'],
]);

const TestStationStatus = new Map<number, string>([
  [147160000, 'pending'],
  [147160001, 'active'],
  [147160002, 'suspended'],
  [147160003, 'termination requested'],
  [147160004, 'terminated'],
]);

function mapAddress(line1: string, line2: string): string {
  return [line1, line2].filter(Boolean).join(', ');
}

function mapToDynamoTestStation(obj: DynamicsTestStation): DynamoTestStation {
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
    testStationAddress: mapAddress(obj.address1_line1, obj.address1_line2),
    testStationContactNumber: obj.telephone1,
    testStationEmails: [],
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
  if (error && error.config && error.config.headers) {
    delete error.config.headers;
  }
  return Promise.reject(error);
};

const getModifiedTestStations = async (requestUrl: string): Promise<DynamicsTestStation[]> => {
  const siteList = (await getSecret(config.crm.siteList)).split(',');

  interface AccountsFormat {
    value: DynamicsTestStation[];
  }
  return lastValueFrom(
    axios.get<AccountsFormat>(requestUrl).pipe(
      map((data) => data.data),
      map((data: AccountsFormat) => data.value.filter((obj) => siteList.includes(obj.dvsa_premisecodes))),
    ),
  );
};

const getReportRecipientEmails = async (stationId: string): Promise<string[]> => {
  interface ConnectionsFormat {
    value: DynamicsConnection[];
  }
  const requestUrl = `${ceBaseUrl}/connections?$select=_record2id_value&$expand=record1id_account($select=accountid,accountnumber),record2id_contact($select=emailaddress1)&$filter=_record1id_value%20eq%20${stationId}%20and%20_record2roleid_value%20eq%${ceRoleId}%20and%20statuscode%20eq%201`;

  return lastValueFrom(
    axios.get<ConnectionsFormat>(requestUrl).pipe(
      map((data) => data.data),
      map((data: ConnectionsFormat) => data.value.map((entry) => entry.record2id_contact.emailaddress1)),
    ),
  );
};

const getTestStationEntities = async (requestUrl: string): Promise<DynamoTestStation[]> => {
  const accessToken = await getToken();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  axios.interceptors.response.use((response) => response, onRejected);

  logger.info('Gathering modified test station entries from accounts table');
  const modifiedTestStations = await getModifiedTestStations(requestUrl);

  const mappedTestStations = modifiedTestStations.map(async (station) => {
    const result = mapToDynamoTestStation(station);
    const emails = await getReportRecipientEmails(station.accountid);
    result.testStationEmails = emails;
    return result;
  });

  return Promise.all(mappedTestStations);
};

export {
  getModifiedTestStations,
  onRejected,
  mapToDynamoTestStation,
  getTestStationEntities,
  getReportRecipientEmails,
};
