import { EventBridge, Request } from 'aws-sdk';
import { mocked } from 'ts-jest/utils';
import { PutEventsResponse, PutEventsRequest, PutEventsResultEntry } from 'aws-sdk/clients/eventbridge';
import { sendModifiedTestStations } from '../../src/eventbridge/send';
import { SendResponse } from '../../src/eventbridge/SendResponse';
import { DynamoTestStation } from '../../src/Interfaces/DynamoTestStation';

jest.mock('aws-sdk', () => {
  const mEventBridgeInstance = {
    putEvents: jest.fn(),
  };
  const mRequestInstance = {
    promise: jest.fn(),
  };
  const mEventBridge = jest.fn(() => mEventBridgeInstance);
  const mRequest = jest.fn(() => mRequestInstance);

  return { EventBridge: mEventBridge, Request: mRequest };
});

type PutEventsWithParams = (params: PutEventsRequest) => AWS.Request<PutEventsResponse, AWS.AWSError>;

const mEventBridgeInstance = new EventBridge();
const mResultInstance = new Request<PutEventsResponse, AWS.AWSError>(null, null);
// eslint-disable-next-line @typescript-eslint/unbound-method
mocked(mEventBridgeInstance.putEvents as PutEventsWithParams).mockImplementation(
  (params: PutEventsRequest): AWS.Request<PutEventsResponse, AWS.AWSError> => {
    const mPutEventsResponse: PutEventsResponse = {
      FailedEntryCount: 0,
      Entries: Array<PutEventsResultEntry>(params.Entries.length),
    };
    if (params.Entries[0].Detail === JSON.stringify({ testStationId: 'Error', testStationName: 'Error' })) {
      mResultInstance.promise = jest.fn().mockReturnValue(Promise.reject(new Error('Oh no!')));
    } else {
      mResultInstance.promise = jest.fn().mockReturnValue(Promise.resolve(mPutEventsResponse));
    }
    return mResultInstance;
  },
);

describe('Send events', () => {
  describe('Events sent', () => {
    it('GIVEN one event to send WHEN sent THEN one event is returned.', async () => {
      const mTestStations = Array<DynamoTestStation>(1);
      const mSendResponse: SendResponse = { SuccessCount: 1, FailCount: 0 };
      await expect(sendModifiedTestStations(mTestStations)).resolves.toEqual(mSendResponse);
    });

    it('GIVEN two events to send WHEN sent THEN two events are returned.', async () => {
      const mTestStations = Array<DynamoTestStation>(2);
      const mSendResponse: SendResponse = { SuccessCount: 2, FailCount: 0 };
      await expect(sendModifiedTestStations(mTestStations)).resolves.toEqual(mSendResponse);
    });

    it('GIVEN an issue with eventbridge WHEN 6 events are sent and 1 fails THEN the failure is in the response.', async () => {
      const mTestStations = Array<DynamoTestStation>(6);
      const errorDynamoTestStation = <DynamoTestStation>(<unknown>{ testStationId: 'Error', testStationName: 'Error' });
      mTestStations[0] = errorDynamoTestStation;
      const mSendResponse: SendResponse = { SuccessCount: 5, FailCount: 1 };
      await expect(sendModifiedTestStations(mTestStations)).resolves.toEqual(mSendResponse);
    });
  });
});
