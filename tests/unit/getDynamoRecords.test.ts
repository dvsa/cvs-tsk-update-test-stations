import config from '../../src/config';
import { getDynamoMembers } from '../../src/dynamo/getDynamoRecords';
import { ResourceType } from '../../src/dynamo/IDynamoRecord';

// has to be 'var' as jest "hoists" execution behind the scenes and let/const cause errors
/* tslint:disable */
var mockDynamoQuery: jest.Mock;
/* tslint:enable */

jest.mock('aws-sdk', () => {
  mockDynamoQuery = jest.fn().mockImplementation(() => ({
    promise: jest.fn().mockResolvedValue({
      Items: [
        {
          resourceType: ResourceType.User,
          resourceKey: '6adbf131-c6c2-4bc6-b1e9-b62f812bed29',
          name: 'test user',
          email: 'testUser@example.com',
        },
        {
          resourceType: ResourceType.User,
          resourceKey: '7d9e8e38-78d5-46ad-9fd0-6adad882161b',
          name: 'test user 2',
          email: 'testUser2@example.com',
        },
      ],
    } as AWS.DynamoDB.DocumentClient.QueryOutput),
  }));
  class FakeDynamoDb {
    query = mockDynamoQuery;
  }

  const AWS = {
    DynamoDB: {
      DocumentClient: FakeDynamoDb,
    },
  };

  return AWS;
});

describe('getDynamoMembers', () => {
  beforeEach(() => {
    config.aws.dynamoTable = 'testTable';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call dynamo query', async () => {
    await getDynamoMembers();
    expect(mockDynamoQuery).toBeCalledWith({
      TableName: 'testTable',
      KeyConditionExpression: 'resourceType = :type',
      ExpressionAttributeValues: {
        ':type': ResourceType.User,
      },
    } as AWS.DynamoDB.DocumentClient.QueryInput);
  });
});
