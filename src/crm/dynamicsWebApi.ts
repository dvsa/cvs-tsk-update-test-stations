import axios from 'axios-observable';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { getToken } from './getToken';
import { DynamicsTestStation } from './DynamicsTestStation';
import { DynamicsConnections } from './DynamicsConnections';
import { DynamoTestStation } from './DynamoTestStation';
import { getSecret } from '../utils';
import config from '../config';
import logger from '../observability/logger';

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

const getAccountsEntities = async (requestUrl: string): Promise<DynamicsTestStation[]> => {
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

const addConnectionsEmails = async (stationEntries: DynamicsTestStation[]): Promise<DynamoTestStation[]> => {
  interface ConnectionsFormat {
    value: DynamicsConnections[]
  }

  const ceUrl = config.crm.ceBaseUrl;
  const { ceRoleId } = config.crm;

  const testStationEvents = stationEntries.map(async (station) => {
    const requestUrl = `${ceUrl}/connections?$select=_record2id_value&$expand=record1id_account($select=accountid,accountnumber),record2id_contact($select=emailaddress1)&$filter=_record1id_value%20eq%20${station.accountid}%20and%20_record2roleid_value%20eq%${ceRoleId}%20and%20statuscode%20eq%201`;

    const testStationEvent = createDynamoTestStation(station);
    await lastValueFrom(
      axios.get<ConnectionsFormat>(requestUrl).pipe(
        map((data) => data.data),
        map((data: ConnectionsFormat) => data.value.forEach((connection) => {
          testStationEvent.testStationEmails.push(connection.record2id_contact.emailaddress1);
        })),
      ),
    );
    return testStationEvent;
  });

  return Promise.all(testStationEvents);
};

const getTestStationEntities = async (requestUrl: string): Promise<DynamoTestStation[]> => {
  const accessToken = await getToken();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  axios.interceptors.response.use((response) => response, onRejected);

  logger.info('Gathering test station entries from accounts table');
  const accountsEntities = await getAccountsEntities(requestUrl);

  logger.info('Appending associated emails from connections table');
  const result = await addConnectionsEmails(accountsEntities);

  return result;
};

export {
  getTestStationEntities, onRejected, createDynamoTestStation, getAccountsEntities, addConnectionsEmails,
};
