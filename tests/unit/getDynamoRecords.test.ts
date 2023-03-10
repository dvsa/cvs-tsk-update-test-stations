import config from '../../src/config';
import { getDynamoMembers } from '../../src/dynamo/getDynamoRecords';

// has to be 'var' as jest "hoists" execution behind the scenes and let/const cause errors
/* tslint:disable */
var mockDynamoQuery: jest.Mock;
var mockUnmarshall: jest.Mock;
/* tslint:enable */

jest.mock('aws-sdk', () => {
  mockDynamoQuery = jest.fn().mockImplementation(() => ({
    promise: jest.fn().mockResolvedValue({
      Items: [
        {
          resourceType: { S: 'USER' },
          resourceKey: { S: 's@test.com' },
          name: { S: 'test user' },
          staffId: { S: '6adbf131-c6c2-4bc6-b1e9-b62f812bed29' },
        },
        {
          resourceType: { S: 'USER' },
          resourceKey: { S: 's2@test.com' },
          name: { S: 'test user 2' },
          staffId: { S: '7d9e8e38-78d5-46ad-9fd0-6adad882161b' },
        },
      ],
    } as AWS.DynamoDB.DocumentClient.QueryOutput),
  }));
  class FakeDynamoDb {
    query = mockDynamoQuery;
  }

  mockUnmarshall = jest.fn().mockImplementation(() => jest.fn());

  const AWS = {
    DynamoDB: {
      Converter: { unmarshall: mockUnmarshall },
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
        ':type': 'USER',
      },
    } as AWS.DynamoDB.DocumentClient.QueryInput);
  });

  it('should unmarshall items', async () => {
    await getDynamoMembers();
    expect(mockUnmarshall).toBeCalledTimes(2);
  });
});
