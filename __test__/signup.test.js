import knex from 'knex';
import config from '../knexfile';
import app from '../server';

describe('Signup', () => {
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
    it('returns 302', async () => {
      const res = await server.inject({
        method: 'post',
        url: '/users',
        body: {
          email: 'new@test.com',
          password: 'test',
          firstName: 'test',
          lastName: 'test',
        },
      });
      expect(res.statusCode).toBe(302);
    });
  });

  describe('when using invalid credentials', () => {
    it('returns 400 when empty email', async () => {
      const res = await server.inject({
        method: 'post',
        url: '/users',
        body: {
          email: '',
          password: 'test',
          firstName: 'test',
          lastName: 'test',
        },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when empty password', async () => {
      const res = await server.inject({
        method: 'post',
        url: '/users',
        body: {
          email: 'new@test.com',
          password: 'test',
          firstName: 'test',
          lastName: 'test',
        },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when email does not match pattern', async () => {
      const res = await server.inject({
        method: 'post',
        url: '/users',
        body: {
          email: 'newtest.com',
          password: 'test',
          firstName: 'test',
          lastName: 'test',
        },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when firstName is empty', async () => {
      const res = await server.inject({
        method: 'post',
        url: '/users',
        body: {
          email: 'new@test.com',
          password: 'test',
          firstName: '',
          lastName: 'test',
        },
      });
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 when lastName is empty', async () => {
      const res = await server.inject({
        method: 'post',
        url: '/users',
        body: {
          email: 'new@test.com',
          password: 'test',
          firstName: 'test',
          lastName: '',
        },
      });
      expect(res.statusCode).toBe(400);
    });
  });
});

