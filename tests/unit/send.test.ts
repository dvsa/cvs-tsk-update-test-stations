import {
  EventBridgeClient, PutEventsCommand, PutEventsCommandInput, PutEventsCommandOutput, PutEventsResultEntry,
} from '@aws-sdk/client-eventbridge';
import { mockClient } from 'aws-sdk-client-mock';
import { sendModifiedTestStations } from '../../src/eventbridge/send';
import { SendResponse } from '../../src/eventbridge/SendResponse';
import { DynamoTestStation } from '../../src/crm/DynamoTestStation';

const mockEventBridge = mockClient(EventBridgeClient);
mockEventBridge.on(PutEventsCommand).callsFake(
  (params: PutEventsCommandInput): PutEventsCommandOutput => {
    const mPutEventsResponse: PutEventsCommandOutput = {
      FailedEntryCount: 0,
      Entries: Array<PutEventsResultEntry>(params.Entries.length),
      $metadata: undefined,
    };
    if (params.Entries[0].Detail === JSON.stringify({ testStationId: 'Error', testStationName: 'Error' })) {
      throw new Error('Oh no!');
    } else {
      return mPutEventsResponse;
    }
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
