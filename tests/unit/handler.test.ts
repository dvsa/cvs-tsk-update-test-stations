import { MemberDetail } from 'aws-sdk/clients/detective';
import IDynamoRecord from '../../src/dynamo/IDynamoRecord';
import { handler } from '../../src/handler';

// has to be 'var' as jest "hoists" execution behind the scenes and let/const cause errors
var mockMemberDetails:jest.Mock; // eslint-disable-line no-var
var mockDynamoRecords:jest.Mock; // eslint-disable-line no-var

jest.mock('../../src/aad/getMemberDetails', () => {
  mockMemberDetails = jest.fn().mockResolvedValue(new Array<MemberDetail>());
  return { getMemberDetails: mockMemberDetails };
});

jest.mock('../../src/dynamo/getDynamoRecords', () => {
  mockDynamoRecords = jest.fn().mockResolvedValue(new Array<IDynamoRecord>());
  return { getDynamoMembers: mockDynamoRecords };
});

describe('Handler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should request member details', async () => {
    await handler();
    expect(mockMemberDetails).toBeCalledTimes(1);
  });

  it('should request dynamo details', async () => {
    await handler();
    expect(mockDynamoRecords).toBeCalledTimes(1);
  });
});
