import pRetry from 'p-retry';
import dateFormat from 'dateformat';
import logger from '../observability/logger';
import { getTestStationEntities } from './dynamicsWebApi';
import { DynamoTestStation } from './DynamoTestStation';
import config from '../config';

export const getTestStations = async (date: Date): Promise<DynamoTestStation[]> => {
  const ceUrl = config.crm.ceBaseUrl;

  const modifiedOnDate: string = dateFormat(date, 'yyyy-mm-dd');

  logger.info(`Trying to get test stations informations modified since: ${modifiedOnDate}`);

  const filteredUrl = `${ceUrl}/accounts/?$select=accountid,address1_line1,address1_line2,telephone1,dvsa_openingtimes,address1_longitude,address1_latitude,name,dvsa_premisecodes,address1_postalcode,dvsa_accountstatus,address1_city,dvsa_testfacilitytype,modifiedon&$filter=modifiedon%20ge%20${modifiedOnDate}`;

  const run = async (): Promise<DynamoTestStation[]> => {
    const response = await getTestStationEntities(filteredUrl);

    return response;
  };

  const testStationEntries: DynamoTestStation[] = await pRetry(run, {
    onFailedAttempt: (error) => {
      logger.info(`Attempt ${error.attemptNumber} failed with "${error.message}".`);
    },
    retries: Number(config.crm.maxRetryAttempts),
    minTimeout: Number(config.crm.scalingDuration),
  });

  logger.info(`Successfully fetched ${testStationEntries.length} test stations informations`);

  return testStationEntries;
};
