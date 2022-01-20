import 'source-map-support/register';
import serverless from 'serverless-http';
import { Context, APIGatewayEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

import { app } from './infrastructure/api';

const {
  NODE_ENV, SERVICE, AWS_PROVIDER_REGION, AWS_PROVIDER_STAGE,
} = process.env;

console.log(
  `\nRunning Service:\n '${SERVICE}'\n mode: ${NODE_ENV}\n stage: '${AWS_PROVIDER_STAGE}'\n region: '${AWS_PROVIDER_REGION}'\n\n`,
);

const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyStructuredResultV2> => {
  console.log('event');
  console.log(JSON.stringify(event, null, 2));
  /**
   * Proxied requests from AWS are intercepted and handled by our express Router -> <stage>/<*> where stage is your branch
   * Our app allows proxies requests until /template path is reached
   * Express will then handle/call a Controller to call the appropriate functions
   * Our app allows the following paths -> <stage>/<**>/<*>/template/<service_endpoints>
   *
   * |===========================================================|
   * | Example of event object received                          |
   * |-----------------------------------------------------------|
   * | ...,                                                      |
   * | "httpMethod": "POST",                                     |
   * | "path": "/proxiedstuff/svc-svc-template/1/something",     |
   * | "pathParameters": {                                       |
   * |    "proxy": "proxiedstuff/svc-svc-template/1/something"   |
   * |  },                                                       |
   * |  ...                                                      |
   * |-----------------------------------------------------------|
   *
   */
  return serverless(app)(event, context);
};

export { handler };
