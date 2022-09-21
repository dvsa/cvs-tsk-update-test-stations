import * as AWS from 'aws-sdk';
import config from '../config';
import IDynamoRecord from './IDynamoRecord';

export const getDynamoMembers:() => Promise<IDynamoRecord[]> = async () => {
  const dynamo = new AWS.DynamoDB.DocumentClient();
  const result = await dynamo.query(<AWS.DynamoDB.DocumentClient.QueryInput>{
    TableName: config.aws.dynamoTable,
    KeyConditionExpression: 'referenceType = :type',
    ExpressionAttributeValues: {
      ':type': {
        S: 'users',
      },
    },
  }).promise();

  return <IDynamoRecord[]>result.Items.map((i) => AWS.DynamoDB.Converter.unmarshall(i));
};
