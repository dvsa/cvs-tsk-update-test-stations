import * as AWS from 'aws-sdk';
import config from '../config';
import logger from '../observability/logger';
import IDynamoRecord, { ResourceType } from './IDynamoRecord';

const dynamo = new AWS.DynamoDB.DocumentClient();

export const getDynamoMembers: () => Promise<IDynamoRecord[]> = async () => {
  const result = await dynamo
    .query({
      TableName: config.aws.dynamoTable,
      KeyConditionExpression: 'resourceType = :type',
      ExpressionAttributeValues: {
        ':type': ResourceType.User,
      },
    } as AWS.DynamoDB.DocumentClient.QueryInput)
    .promise();

  logger.error(config.aws.dynamoTable);
  logger.error(JSON.stringify(result));

  return result.Items as IDynamoRecord[];
};
