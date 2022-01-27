import pRetry from 'p-retry';
import dateFormat from 'dateformat';
import logger from '../observability/logger';
import { getTestStationEntities } from './dynamicsWebApi';
import { DynamoTestStation } from './DynamoTestStation';
import config from '../../config';

export const getTestStations = async (date: Date): Promise<DynamoTestStation[]> => {
  const ceUrl = config.crm.ceAccountUrl;
  const modifiedOnDate: string = dateFormat(date, 'yyyy-mm-dd');

  logger.info(`Trying to get test stations informations modified on: ${modifiedOnDate}`);

  const filteredUrl = `${ceUrl}/?$select=accountid,address1_composite,name,emailaddress1,dvsa_premisecodes,dvsa_testfacilitytype,dvsa_accountstatus,address1_latitude,address1_longitude,telephone1,dvsa_openingtimes,modifiedon&$filter=modifiedon%20eq%20${modifiedOnDate}`;

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

  logger.info(`Successfully fetched ${testStationEntries.length} test stations informations`, {
    date: modifiedOnDate,
  });

  return testStationEntries;
};
