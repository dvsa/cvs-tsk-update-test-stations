import config from '../../src/config';
import { getDynamoMembers } from '../../src/dynamo/getDynamoRecords';

// has to be 'var' as jest "hoists" execution behind the scenes and let/const cause errors
/* eslint-disable no-var */
var mockDynamoQuery: jest.Mock;
var mockUnmarshall: jest.Mock;
/* eslint-enable no-var */

jest.mock('aws-sdk', () => {
  mockDynamoQuery = jest.fn().mockImplementation(() => ({
    promise: jest.fn().mockResolvedValue(<AWS.DynamoDB.DocumentClient.QueryOutput>{
      Items: [
        {
          referenceType: { S: 'USER' },
          referenceKey: { S: 's@test.com' },
          name: { S: 'test user' },
        },
        {
          referenceType: { S: 'USER' },
          referenceKey: { S: 's2@test.com' },
          name: { S: 'test user 2' },
        },
      ],
    }),
  }));
  class FakeDynamoDb {
    query = mockDynamoQuery;
  }

  mockUnmarshall = jest.fn().mockImplementation(() => {});

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
    expect(mockDynamoQuery).toBeCalledWith(<AWS.DynamoDB.DocumentClient.QueryInput>{
      TableName: 'testTable',
      IndexName: 'NameIndex',
      KeyConditionExpression: 'referenceType = :type',
      ExpressionAttributeValues: {
        ':type': { S: 'USER' },
      },
    });
  });

  it('should unmarshall items', async () => {
    await getDynamoMembers();
    expect(mockUnmarshall).toBeCalledTimes(2);
  });
});
