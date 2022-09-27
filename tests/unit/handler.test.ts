import MemberDetails from '../../src/aad/MemberDetails';
import IDynamoRecord from '../../src/dynamo/IDynamoRecord';
import { handler } from '../../src/handler';

// has to be 'var' as jest "hoists" execution behind the scenes and let/const cause errors
/* eslint-disable no-var */
var mockMemberDetails:jest.Mock;
var mockDynamoRecords:jest.Mock;
var mockDynamoPut:jest.Mock;
var emptyMemberDetails = true;
var emptyDynamoDetails = true;
/* eslint-enable no-var */

jest.mock('../../src/aad/getMemberDetails', () => {
  mockMemberDetails = jest.fn().mockResolvedValue(emptyMemberDetails ? new Array<MemberDetails>() : [<MemberDetails>{
    displayName: 'Test User',
    userPrincipalName: 'test@email.com',
  }]);
  return { getMemberDetails: mockMemberDetails };
});

jest.mock('../../src/dynamo/getDynamoRecords', () => {
  mockDynamoRecords = jest.fn().mockResolvedValue(emptyDynamoDetails ? new Array<IDynamoRecord>() : [<IDynamoRecord>{
    email: 'deleted@email.com',
    name: 'Deleted User',
  }]);
  return { getDynamoMembers: mockDynamoRecords };
});

jest.mock('aws-sdk', () => {
  mockDynamoPut = jest.fn().mockImplementation(() => ({ promise: jest.fn().mockResolvedValue(<AWS.DynamoDB.DocumentClient.PutItemOutput>{}) }));
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
        resourceType: { S: 'USER' },
        resourceKey: { S: 'test@email.com' },
        name: { S: 'Test User' },
      },
    });
  });

  it('should run a dynamo put with a ttl for an inactive record', async () => {
    emptyDynamoDetails = false;
    await handler();
    expect(mockDynamoPut).toBeCalledWith(expect.objectContaining({
      TableName: '',
      Item: {
        resourceType: { S: 'USER' },
        resourceKey: { S: 'deleted@email.com' },
        name: { S: 'Deleted User' },
        ttl: { N: <number>expect.any(Number) },
      },
    }));
  });
});
