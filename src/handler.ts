import 'source-map-support/register';
import { Context, APIGatewayEvent } from 'aws-lambda';

const {
  NODE_ENV, SERVICE, AWS_PROVIDER_REGION, AWS_PROVIDER_STAGE,
} = process.env;

console.log(
  `\nRunning Service:\n '${SERVICE}'\n mode: ${NODE_ENV}\n stage: '${AWS_PROVIDER_STAGE}'\n region: '${AWS_PROVIDER_REGION}'\n\n`,
);

const handler = (event: APIGatewayEvent, _context: Context) => {
  console.log('event');
  console.log(JSON.stringify(event, null, 2));
};

export { handler };
