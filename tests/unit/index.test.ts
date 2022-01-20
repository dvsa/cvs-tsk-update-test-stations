import { APIGatewayEvent, Context } from 'aws-lambda';
import { handler } from '../../src';
import * as Utils from '../../src/utils';
import Version from '../../local/data/version.json';
import Template from '../../local/data/template-something.json';
import { SEMVER_REGEX } from '../../src/constants';

describe('Application entry', () => {
  let event: APIGatewayEvent;
  let context: Context;
  let majorVersionNumber: string;

  beforeEach(() => {
    event = {} as APIGatewayEvent;
    context = {} as Context;
    jest.spyOn(Utils, 'createMajorVersionNumber').mockReturnValue('1');
    majorVersionNumber = Utils.createMajorVersionNumber('1.0.0');
  });

  afterEach(() => {
    jest.resetAllMocks().restoreAllMocks();
  });

  describe('Handler', () => {
    it('should call the express wrapper', async () => {
      event = { body: 'Test Body' } as APIGatewayEvent;

      const response = await handler(event, context);
      expect(response.statusCode).toEqual(200);
      expect(typeof response.body).toBe('string');
    });

    describe('when the service is running', () => {
      describe('without proxy', () => {
        it("should return a body response when the handler has event with the '/' as path", async () => {
          event = { httpMethod: 'GET', path: '/' } as APIGatewayEvent;

          const response = await handler(event, context);
          const parsedBody = JSON.parse(response.body) as { ok: boolean };
          expect(parsedBody.ok).toBe(true);
        });
      });
    });

    describe('with proxy', () => {
      describe("on '<path>' or '<version>'", () => {
        it('should receive the version number from an environmental variable following semver convention', () => {
          expect(process.env.API_VERSION).toMatch(SEMVER_REGEX);
        });

        it('should have version number in the API shown as major', () => {
          expect(majorVersionNumber).toMatch(/^(\d+)$/);
          expect(majorVersionNumber).not.toMatch(/^(\d+\.)$/);
        });
      });

      describe("on '/version' endpoint(s)", () => {
        it("should call the service/lambda when the path contains '/version' and return the app version following the semver convention", async () => {
          event = {
            ...Version,
          } as APIGatewayEvent;

          const response = await handler(event, context);
          const parsedResponse = JSON.parse(response.body) as { version: string };
          // is given when we build the file as API_VERSION from package.json with $npm_package_version
          // TODO we follow semver for code versioning ATM and only use the major for the API endpoint as v1
          const { API_VERSION } = process.env;

          expect(response.statusCode).toEqual(200);
          expect(parsedResponse.version).toBe(API_VERSION);
        });
      });

      describe("on /v'x'/template endpoint(s)", () => {
        it('should call the router endpoint', async () => {
          event = {
            ...Template,
          } as APIGatewayEvent;
          const { statusCode, body } = await handler(event, context);
          expect(statusCode).toEqual(200);
          expect(body).not.toBe(undefined);
          expect(body).toEqual('ok /id/something');
        });

        it("should get a '404' if the base path endpoint does not contain the 'SERVICE'", async () => {
          event = {
            httpMethod: 'POST',
            path: '/stage/v1/wrong-service-name/1/something',
          } as APIGatewayEvent;

          const response = await handler(event, context);
          expect(response.statusCode).toEqual(404);
        });
      });
    });
  });
});
