import { launchApp, shutdownApp, clear } from './base.js';

describe('Signup', () => {
  let db;
  let app;

  beforeEach(async () => {
    await clear(app);
  });

  beforeAll(async () => {
    ({ app, db } = await launchApp());
  });

  afterAll(async () => {
    await shutdownApp(app, db);
  });

  describe('create', () => {
    it('returns 302 when using valid data', async () => {
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/user',
        body: {
          email: 'new@test.com',
          password: 'test',
          firstName: 'test',
          lastName: 'test',
        },
      });
      expect(statusCode).toBe(302);
      const users = await app.objection.models.user.query();
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        email: 'new@test.com',
        firstName: 'test',
        lastName: 'test',
      });
    });

    describe('when using invalid data', () => {
      it('returns 400 when existing email', async () => {
        await app.objection.models.user.query().insert({
          firstName: 'foo',
          lastName: 'bar',
          email: 'a@a.com',
          password: 'test',
        });
        const { statusCode } = await app.inject({
          method: 'post',
          url: '/user',
          body: {
            email: 'a@a.com',
            password: 'test',
            firstName: 'test',
            lastName: 'test',
          },
        });
        expect(statusCode).toBe(400);
        const users = await app.objection.models.user.query();
        expect(users).toHaveLength(1);
        expect(users[0]).toMatchObject({
          email: 'a@a.com',
          firstName: 'foo',
          lastName: 'bar',
        });
      });

      [{
        name: 'empty email',
        body: {
          email: '',
          password: 'test',
          firstName: 'test',
          lastName: 'test',
        },
      },
      {
        name: 'email does not match pattern',
        body: {
          email: 'newtest.com',
          password: 'test',
          firstName: 'test',
          lastName: 'test',
        },
      },
      {
        name: 'password empty',
        body: {
          email: 'new@test.com',
          password: '',
          firstName: 'test',
          lastName: 'test',
        },
      }, {
        name: 'firstName is empty',
        body: {
          email: 'new@test.com',
          password: 'test',
          firstName: '',
          lastName: 'test',
        },
      }, {
        name: 'lastName is empty',
        body: {
          email: 'new@test.com',
          password: 'test',
          firstName: 'test',
          lastName: '',
        },
      }].forEach(({ name, body }) => it(`returns 400 when ${name}`, async () => {
        const { statusCode } = await app.inject({
          method: 'post',
          url: '/user',
          body,
        });
        expect(statusCode).toBe(400);
        const users = await app.objection.models.user.query();
        expect(users).toHaveLength(0);
      }));
    });
  });
});
