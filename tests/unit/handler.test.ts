import MemberDetails from '../../src/aad/MemberDetails';
import IDynamoRecord from '../../src/dynamo/IDynamoRecord';
import { handler } from '../../src/handler';

// has to be 'var' as jest "hoists" execution behind the scenes and let/const cause errors
/* tslint:disable */
var mockMemberDetails: jest.Mock;
var mockDynamoRecords: jest.Mock;
var mockDynamoPut: jest.Mock;
var emptyMemberDetails = true;
var emptyDynamoDetails = true;
/* tslint:enable */

jest.mock('../../src/aad/getMemberDetails', () => {
  mockMemberDetails = jest.fn().mockResolvedValue(
    emptyMemberDetails
      ? new Array<MemberDetails>()
      : [
          {
            displayName: 'Test User',
            userPrincipalName: 'test@email.com',
            staffId: '5afcf0b5-fb7f-4b83-98cc-851a8b27025c',
          } as MemberDetails,
        ],
  );
  return { getMemberDetails: mockMemberDetails };
});

jest.mock('../../src/dynamo/getDynamoRecords', () => {
  mockDynamoRecords = jest.fn().mockResolvedValue(
    emptyDynamoDetails
      ? new Array<IDynamoRecord>()
      : [
          {
            email: 'deleted@email.com',
            name: 'Deleted User',
            staffId: '932a98cb-8946-4796-8291-c7bcf4badb50',
          } as IDynamoRecord,
        ],
  );
  return { getDynamoMembers: mockDynamoRecords };
});

jest.mock('aws-sdk', () => {
  mockDynamoPut = jest.fn().mockImplementation(() => ({
    promise: jest.fn().mockResolvedValue({} as AWS.DynamoDB.DocumentClient.PutItemOutput),
  }));
  class FakeDynamoDb {
    put = mockDynamoPut;
  }

  const AWS = {
    DynamoDB: {
      DocumentClient: FakeDynamoDb,
    },
  };

  return AWS;
});

describe('Handler', () => {
  afterEach(() => {
    jest.clearAllMocks();
    emptyMemberDetails = true;
  });

  it('should request member details', async () => {
    await handler();
    expect(mockMemberDetails).toBeCalledTimes(1);
  });

  it('should request dynamo details', async () => {
    await handler();
    expect(mockDynamoRecords).toBeCalledTimes(1);
  });

  it('should run a dynamo put for an active record', async () => {
    emptyMemberDetails = false;
    await handler();
    expect(mockDynamoPut).toBeCalledWith({
      TableName: '',
      Item: {
        resourceType: 'USER',
        resourceKey: 'test@email.com',
        name: 'Test User',
        staffId: '5afcf0b5-fb7f-4b83-98cc-851a8b27025c',
      },
    });
  });

  it('should run a dynamo put with a ttl for an inactive record', async () => {
    emptyDynamoDetails = false;
    await handler();
    expect(mockDynamoPut).toBeCalledWith(
      expect.objectContaining({
        TableName: '',
        Item: {
          resourceType: 'USER',
          resourceKey: 'deleted@email.com',
          name: 'Deleted User',
          staffId: '932a98cb-8946-4796-8291-c7bcf4badb50',
          ttl: expect.any(Number) as number,
        },
      }),
    );
  });
});
