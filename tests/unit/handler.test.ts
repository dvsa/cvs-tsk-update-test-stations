import { ScheduledEvent } from 'aws-lambda';
import { DynamoTestStation } from '../../src/crm/DynamoTestStation';
import { getTestStations } from '../../src/crm/getTestStation';
import { EventDetail, handler } from '../../src/handler';

jest.mock('../../src/crm/getTestStation', () => ({
  getTestStations: jest.fn().mockResolvedValue(new Array<DynamoTestStation>()),
}));

describe('Handler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should use the default last nodified date of {day} -1', () => {
    const now = new Date(Date.now());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expectedDate = new Date(today.setDate(today.getDate() - 1)); // 1: day
    const event = <ScheduledEvent<EventDetail>>(<unknown>{});

    handler(event, null, () => {});
    expect(getTestStations).toHaveBeenCalledWith(expectedDate);
  });

  it('should use the date passed in instead of the default {day} -1', () => {
    const expectedDate = '2022-01-01T00:00:00.000Z';
    const event = <ScheduledEvent<EventDetail>>(<unknown>{ detail: { lastModifiedDate: expectedDate } });

    handler(event, null, () => {});
    expect(getTestStations).toHaveBeenCalledWith(new Date(expectedDate));
  });

  it('should error and do nothing if the date passed in is not a date', () => {
    const event = <ScheduledEvent<EventDetail>>(<unknown>{ detail: { lastModifiedDate: 'this is not a date' } });

    handler(event, null, () => {});
    expect(getTestStations).not.toHaveBeenCalled();
  });
});
