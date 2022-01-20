import supertest from 'supertest';
import { app } from '../../src/infrastructure/api';

// TODO Define Mock strategy
describe('API', () => {
  afterEach(() => {
    jest.resetAllMocks().restoreAllMocks();
  });

  describe('GET', () => {
    test("should return '{ok: true}' when hitting '/' route", async () => {
      const result = await supertest(app).get('/');
      const resultContent = JSON.parse(result.text) as { ok: boolean };

      expect(result.status).toEqual(200);
      expect(resultContent).toHaveProperty('ok');
      expect(resultContent.ok).toEqual(true);
    });
  });
});
