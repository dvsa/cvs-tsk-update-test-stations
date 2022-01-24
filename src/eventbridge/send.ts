import { EventBridge } from 'aws-sdk';
import { EventEntry } from './EventEntry';
import { Entries } from './Entries';
import { SendResponse } from './SendResponse';
import logger from '../observability/logger';
import { DynamoTestStation } from '../Interfaces/DynamoTestStation';

const eventbridge = new EventBridge();
const sendModifiedTestStations = async (testStations: DynamoTestStation[]): Promise<SendResponse> => {
  logger.info('sendModifiedTestStations starting');
  logger.info(
    `${testStations.length} test ${testStations.length === 1 ? 'station' : 'stations'} ready to send to eventbridge.`,
  );

  const sendResponse: SendResponse = {
    SuccessCount: 0,
    FailCount: 0,
  };

  for (let i = 0; i < testStations.length; i++) {
    // eslint-disable-next-line security/detect-object-injection
    logger.info(`sending test station id: ${testStations[i]?.testStationId} to eventbridge...`);

    try {
      const entry: EventEntry = {
        Source: process.env.AWS_EVENT_BUS_SOURCE,
        // eslint-disable-next-line security/detect-object-injection
        Detail: JSON.stringify(testStations[i]),
        DetailType: 'CVS ATF Test Station',
        EventBusName: process.env.AWS_EVENT_BUS_NAME,
        Time: new Date(),
      };

      const params: Entries = {
        Entries: [entry],
      };

      logger.debug(`test station event about to be sent: ${JSON.stringify(params)}`);
      // eslint-disable-next-line no-await-in-loop
      await eventbridge.putEvents(params).promise();
      sendResponse.SuccessCount++;
    } catch (error) {
      logger.error('', error);
      sendResponse.FailCount++;
    }
  }

  logger.info('sendModifiedTestStations ending');

  return sendResponse;
};

export { sendModifiedTestStations };
