import IMemberDetails, { MemberType } from '../../src/aad/IMemberDetails';
import IDynamoRecord, { ResourceType } from '../../src/dynamo/IDynamoRecord';
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
      ? new Array<IMemberDetails>()
      : [
          {
            '@odata.type': MemberType.User,
            id: '5afcf0b5-fb7f-4b83-98cc-851a8b27025c',
            displayName: 'Test User',
            mail: 'test@example.com',
            userPrincipalName: 'test@example.com',
          } as IMemberDetails,
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
            resourceType: ResourceType.User,
            resourceKey: '932a98cb-8946-4796-8291-c7bcf4badb50',
            email: 'deleted@email.com',
            name: 'Deleted User',
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
        resourceType: ResourceType.User,
        resourceKey: '5afcf0b5-fb7f-4b83-98cc-851a8b27025c',
        name: 'Test User',
        email: 'test@example.com',
        ttl: expect.any(Number) as number,
      },
    });
  });

  it('should run a dynamo put with a ttl for an inactive record', async () => {
    emptyDynamoDetails = false;
    await handler();
    expect(mockDynamoPut).toHaveBeenCalledWith(
      expect.objectContaining({
        TableName: '',
        Item: {
          resourceType: ResourceType.User,
          resourceKey: '932a98cb-8946-4796-8291-c7bcf4badb50',
          name: 'Deleted User',
          email: 'deleted@email.com',
          ttl: expect.any(Number) as number,
        },
      }),
    );
  });
});
