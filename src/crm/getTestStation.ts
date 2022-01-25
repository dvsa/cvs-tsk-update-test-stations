import pRetry from 'p-retry';
import dateFormat from 'dateformat';
import logger from '../observability/logger';
import { getTestStationEntities } from './dynamicsWebApi';
import { DynamoTestStation } from '../Interfaces/DynamoTestStation';

export const getTestStations = async (date: Date): Promise<DynamoTestStation[]> => {
  const ceUrl = process.env.CE_RESOURCE;
  const paymentInformationsDate: string = dateFormat(date, 'yyyy-mm-dd');

  logger.info('Trying to get payment informations', { date: paymentInformationsDate });

  const filteredUrl = `${ceUrl}/?$select=accountid,address1_composite,name,emailaddress1,dvsa_premisecodes,dvsa_testfacilitytype,dvsa_accountstatus,address1_latitude,address1_longitude,telephone1,dvsa_openingtimes,modifiedon&$filter=modifiedon%20eq%20${paymentInformationsDate}`;

  const run = async (): Promise<DynamoTestStation[]> => {
    const response = await getTestStationEntities(filteredUrl);

    return response;
  };

  const testStationEntries: DynamoTestStation[] = await pRetry(run, {
    onFailedAttempt: (error) => {
      logger.info(`Attempt ${error.attemptNumber} failed with "${error.message}".`);
    },
    retries: Number(process.env.maxRetryAttempts),
    minTimeout: Number(process.env.scalingDuration),
  });

  logger.info(
    `Successfully fetched ${testStationEntries.length} payment informations`,
    { date: paymentInformationsDate },
  );

  return testStationEntries;
};
