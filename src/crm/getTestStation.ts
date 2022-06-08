import pRetry from 'p-retry';
import dateFormat from 'dateformat';
import logger from '../observability/logger';
import { getReportRecipientEmails, getModifiedTestStations } from './dynamicsWebApi';
import { DynamoTestStation } from './DynamoTestStation';
import config from '../config';
import { DynamicsTestStation } from './DynamicsTestStation';
import { DynamicsConnection } from './DynamicsConnection';

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

export function mapToDynamoTestStation(obj: DynamicsTestStation): DynamoTestStation {
  if (!TestStationStatus.has(obj.dvsa_accountstatus)) {
    logger.error(
      `Invalid enum value provided for test station status field: ${obj.dvsa_accountstatus} for test station: ${obj.accountid}`,
    );
    return null;
  }
  if (!TestStationType.has(obj.dvsa_testfacilitytype)) {
    logger.error(
      `Invalid enum value provided for test station type field: ${obj.dvsa_testfacilitytype} for test station: ${obj.accountid}`,
    );
    return null;
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

export const getTestStations = async (date: Date): Promise<DynamoTestStation[]> => {
  const ceUrl = config.crm.ceBaseUrl;

  const modifiedOnDate: string = dateFormat(date, 'yyyy-mm-dd');

  const filteredUrl = `${ceUrl}/accounts/?$select=accountid,address1_line1,address1_line2,telephone1,dvsa_openingtimes,address1_longitude,address1_latitude,name,dvsa_premisecodes,address1_postalcode,dvsa_accountstatus,address1_city,dvsa_testfacilitytype,modifiedon&$filter=modifiedon%20ge%20${modifiedOnDate}%20and%20dvsa_accounttype%20eq%20100000000%20and%20dvsa_accountstatus%20eq%20147160001%20or%20dvsa_accountstatus%20eq%20147160003`;

  const runAccounts = async (): Promise<DynamicsTestStation[]> => {
    logger.info(`Trying to get test stations informations modified since: ${modifiedOnDate}`);

    const response = await getModifiedTestStations(filteredUrl);

    return response;
  };

  const runEmails = async (): Promise<DynamicsConnection[]> => {
    logger.info('Trying to get test station emails from connections table');

    const response = await getReportRecipientEmails();

    return response;
  };

  const testStationAccounts: DynamicsTestStation[] = await pRetry(runAccounts, {
    onFailedAttempt: (error) => {
      logger.info(`Attempt ${error.attemptNumber} failed with "${error.message}".`);
    },
    retries: Number(config.crm.maxRetryAttempts),
    minTimeout: Number(config.crm.scalingDuration),
  });

  const testStationEmails: DynamicsConnection[] = await pRetry(runEmails, {
    onFailedAttempt: (error) => {
      logger.info(`Attempt ${error.attemptNumber} failed with "${error.message}".`);
    },
    retries: Number(config.crm.maxRetryAttempts),
    minTimeout: Number(config.crm.scalingDuration),
  });

  const mappedTestStations = testStationAccounts
    .map((entry) => mapToDynamoTestStation(entry))
    .filter((entry) => entry !== null);

  mappedTestStations.forEach((station) => {
    testStationEmails.forEach((connection) => {
      if (connection.record1id_account.accountid === station.testStationId) {
        station.testStationEmails.push(connection.record2id_contact.emailaddress1);
      }
    });
  });

  logger.info(`Successfully fetched ${mappedTestStations.length} test stations informations`);

  return mappedTestStations;
};
