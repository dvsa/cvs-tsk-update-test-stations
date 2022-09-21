import { handler } from '../../src/handler';

jest.mock('../../src/crm/getTestStation', () => ({
  getTestStations: jest.fn().mockResolvedValue(new Array<DynamoTestStation>()),
}));

describe('Handler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

});
