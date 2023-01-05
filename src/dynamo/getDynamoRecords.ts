import * as AWS from 'aws-sdk';
import config from '../config';
import IDynamoRecord from './IDynamoRecord';

const dynamo = new AWS.DynamoDB.DocumentClient();

export const getDynamoMembers: () => Promise<IDynamoRecord[]> = async () => {
  const result = await dynamo
    .query(<AWS.DynamoDB.DocumentClient.QueryInput>{
      TableName: config.aws.dynamoTable,
      KeyConditionExpression: 'resourceType = :type',
      ExpressionAttributeValues: {
        ':type': {
          S: 'USER',
        },
      },
    })
    .promise();

  return <IDynamoRecord[]>result.Items.map((i) => AWS.DynamoDB.Converter.unmarshall(i));
};
