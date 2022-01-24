import 'source-map-support/register';
import { ScheduledEvent, Context, Callback } from 'aws-lambda';
import { sendModifiedTestStations } from './eventbridge/send';
import logger from './observability/logger';
import { DynamoTestStation } from './Interfaces/DynamoTestStation';

const {
  NODE_ENV, SERVICE, AWS_PROVIDER_REGION, AWS_PROVIDER_STAGE,
} = process.env;

interface EventDetail {
  lastModifiedDate: string;
}

const ONE_DAY = 1;

console.log(
  `\nRunning Service:\n '${SERVICE}'\n mode: ${NODE_ENV}\n stage: '${AWS_PROVIDER_STAGE}'\n region: '${AWS_PROVIDER_REGION}'\n\n`,
);

const handler = async (event: ScheduledEvent<EventDetail>, _context: Context, callback: Callback): Promise<void> => {
  try {
    logger.debug(`Function triggered with '${JSON.stringify(event)}'.`);

    let lastModifiedDate: Date;
    if (event?.detail?.lastModifiedDate) {
      lastModifiedDate = getDateFromManualTrigger(event.detail.lastModifiedDate);
    } else {
      const now = new Date(Date.now());
      lastModifiedDate = new Date(now.setDate(now.getDate() - ONE_DAY));
    }

    // TODO: replace with response from Dynamics
    // const modifiedTestStations = await getModifiedTestStations(lastModifiedDate);
    if (lastModifiedDate === new Date(Date.now())) {
      return;
    } // TODO: REMOVE
    const modifiedTestStations = new Array<DynamoTestStation>();
    await sendModifiedTestStations(modifiedTestStations);

    logger.info('Data processed successfully.');
    callback(null, 'Data processed successfully.');
  } catch (error) {
    logger.info('Data processed unsuccessfully.');
    logger.error('', error);
    callback(new Error('Data processed unsuccessfully.'));
  }
};

function getDateFromManualTrigger(lastModifiedDate: string): Date {
  const isValidDate = !Number.isNaN(Date.parse(lastModifiedDate));
  if (!isValidDate) {
    throw new Error(`Failed to manually trigger function. Invalid input date ${lastModifiedDate}`);
  }
  return new Date(lastModifiedDate);
}

export { handler };
