import { ScheduledEvent } from 'aws-lambda';
import { EventDetail, handler } from '../../src/handler';

describe('Handler', () => {
  it('TODO: Test', () => {
    handler(null, null, () => {});
  });

  it('Manual invocation with lastModifiedDate is used instead of {day} -1', () => {
    const expectedDate = '2022-01-01T00:00:00.000Z';
    const event = <ScheduledEvent<EventDetail>>(<unknown>{ detail: { lastModifiedDate: expectedDate } });
    // TODO: Set up getModifiedTestStations() mock...
    handler(event, null, () => {});
    // TODO: Expect getModifiedTestStations(lastModifiedDate) to be called with expectedDate
  });
});
