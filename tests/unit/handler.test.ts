import { MemberDetail } from 'aws-sdk/clients/detective';
import IDynamoRecord from '../../src/dynamo/IDynamoRecord';
import { handler } from '../../src/handler';

// has to be 'var' as jest "hoists" execution behind the scenes and let/const cause errors
var mockMemberDetails:()=> Promise<MemberDetail[]> = jest.fn().mockResolvedValue(new Array<MemberDetail>()); // eslint-disable-line no-var

jest.mock('../../src/aad/getMemberDetails', () => ({
  getMemberDetails: mockMemberDetails,
}));

jest.mock('../../src/dynamo/getDynamoRecord', () => ({
  getMemberDetails: jest.fn().mockResolvedValue(new Array<IDynamoRecord>()),
}));

describe('Handler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should request member details', async () => {
    await handler();
    expect(mockMemberDetails).toBeCalledTimes(1);
  });
});
