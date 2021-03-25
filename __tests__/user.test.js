import { launchApp, shutdownApp, clearDatabaseState } from './helpers.js';

describe('Signup', () => {
  let app;

  beforeEach(async () => {
    await clearDatabaseState(app);
  });

  beforeAll(async () => {
    app = await launchApp();
  });

  afterAll(async () => {
    await shutdownApp(app);
  });

  describe('create', () => {
    it('should return 302 when using valid data', async () => {
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/users',
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
      it('should return 400 when existing email', async () => {
        await app.objection.models.user.query().insert({
          firstName: 'foo',
          lastName: 'bar',
          email: 'a@a.com',
          password: 'test',
        });
        const { statusCode } = await app.inject({
          method: 'post',
          url: '/users',
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

      it.each([
        ['empty email', {
          email: '', password: 'test', firstName: 'test', lastName: 'test',
        }],
        ['email does not match pattern', {
          email: 'newtest.com', password: 'test', firstName: 'test', lastName: 'test',
        },
        ],
        ['password empty', {
          email: 'new@test.com', password: '', firstName: 'test', lastName: 'test',
        },
        ], ['firstName is empty', {
          email: 'new@test.com', password: 'test', firstName: '', lastName: 'test',
        },
        ], ['lastName is empty', {
          email: 'new@test.com', password: 'test', firstName: 'test', lastName: '',
        },
        ]])('should return 400 when %s', async (_, body) => {
        const { statusCode } = await app.inject({
          method: 'post',
          url: '/users',
          body,
        });
        expect(statusCode).toBe(400);
        const users = await app.objection.models.user.query();
        expect(users).toHaveLength(0);
      });
    });
  });
});
