import * as AWS from 'aws-sdk';
import config from '../config';
import IDynamoRecord from './IDynamoRecord';

const dynamo = new AWS.DynamoDB.DocumentClient();

export const getDynamoMembers: () => Promise<IDynamoRecord[]> = async () => {
  const result = await dynamo
    .query({
      TableName: config.aws.dynamoTable,
      KeyConditionExpression: 'resourceType = :type',
      ExpressionAttributeValues: {
        ':type': 'USER',
      },
    } as AWS.DynamoDB.DocumentClient.QueryInput)
    .promise();

  return result.Items.map((i) => AWS.DynamoDB.Converter.unmarshall(i)) as IDynamoRecord[];
};
