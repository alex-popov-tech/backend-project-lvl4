import knex from 'knex';
import config from '../knexfile';
import app from '../server';

describe('Signin', () => {
  let db;
  let server;

  beforeAll(async () => {
    db = knex(config.test);
    await db.migrate.latest();
    server = await app();
    await server.objection.models.user.query().delete();
    await server.objection.models.user.query().insert({
      firstName: 'foo',
      lastName: 'bar',
      email: 'test@test.com',
      password: 'test',
    });
  });

  afterAll(async () => {
    await server.close();
    await db.destroy();
  });

  describe('when using valid credentials', () => {
    it('returns 302 and a cookie', async () => {
      const res = await server.inject({
        method: 'post',
        url: '/session',
        body: { email: 'test@test.com', password: 'test' },
      });
      expect(res.statusCode).toBe(302);
      expect(res.headers['set-cookie']).toBeTruthy();
    });
  });

  describe('when using invalid credentials', () => {
    it('returns 404 when empty email', async () => {
      const res = await server.inject({
        method: 'post',
        url: '/session',
        body: { email: '', password: 'test' },
      });
      expect(res.statusCode).toBe(404);
    });

    it('returns 404 when empty password', async () => {
      const res = await server.inject({
        method: 'post',
        url: '/session',
        body: { email: 'test@test.com', password: '' },
      });
      expect(res.statusCode).toBe(404);
    });

    it('returns 404 when email does not match pattern', async () => {
      const res = await server.inject({
        method: 'post',
        url: '/session',
        body: { email: 'aa.com', password: 'test' },
      });
      expect(res.statusCode).toBe(404);
    });

    it('returns 404 when user not found', async () => {
      const res = await server.inject({
        method: 'post',
        url: '/session',
        body: { email: 'invalid@user.com', password: 'test' },
      });
      expect(res.statusCode).toBe(404);
    });

    it('returns 404 when password do not match', async () => {
      const res = await server.inject({
        method: 'post',
        url: '/session',
        body: { email: 'test@test.com', password: 'invalid' },
      });
      expect(res.statusCode).toBe(404);
    });
  });
});
