import 'source-map-support/register';
import { ScheduledEvent, Context, Callback } from 'aws-lambda';
import { sendModifiedTestStations } from './eventbridge/send';
import logger from './observability/logger';
import { getTestStations } from './crm/getTestStation';

const {
  NODE_ENV, SERVICE, AWS_PROVIDER_REGION, AWS_PROVIDER_STAGE,
} = process.env;

export interface EventDetail {
  lastModifiedDate: string;
}

const ONE_DAY = 1;

console.log(
  `\nRunning Service:\n '${SERVICE}'\n mode: ${NODE_ENV}\n stage: '${AWS_PROVIDER_STAGE}'\n region: '${AWS_PROVIDER_REGION}'\n\n`,
);

const handler = (event: ScheduledEvent<EventDetail>, _context: Context, callback: Callback): void => {
  logger.debug(`Function triggered with '${JSON.stringify(event)}'.`);

  let lastModifiedDate: Date;
  if (event?.detail?.lastModifiedDate) {
    try {
      lastModifiedDate = getDateFromManualTrigger(event.detail.lastModifiedDate);
    } catch (error) {
      let message = 'Failed to manually trigger function. Invalid input date is invalid';
      if (typeof error === 'string') {
        message = error;
      } else if (error instanceof Error) {
        message = error.message;
      }

      callback(new Error(message));
      return;
    }
  } else {
    const now = new Date(Date.now());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    lastModifiedDate = new Date(today.setDate(today.getDate() - ONE_DAY));
  }

  getTestStations(lastModifiedDate)
    .then((testStations) => sendModifiedTestStations(testStations).then(() => {
      logger.info('Data processed successfully.');
      callback(null, 'Data processed successfully.');
    }))
    .catch((error) => {
      logger.info('Data processed unsuccessfully.');
      logger.error('', error);
      callback(new Error('Data processed unsuccessfully.'));
    });
};

function getDateFromManualTrigger(lastModifiedDate: string): Date {
  const isValidDate = !Number.isNaN(Date.parse(lastModifiedDate));
  if (!isValidDate) {
    throw new Error(`Failed to manually trigger function. Invalid input date: ${lastModifiedDate}`);
  }
  return new Date(lastModifiedDate);
}

export { handler };
