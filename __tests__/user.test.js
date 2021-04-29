import {
  clearDatabaseState, getAuthenticatedUser, launchApp, shutdownApp,
} from './helpers';

describe('Users', () => {
  let app;

  beforeAll(async () => {
    app = await launchApp();
  });

  afterAll(async () => {
    await shutdownApp(app);
  });

  beforeEach(async () => {
    await clearDatabaseState(app);
  });

  describe('index', () => {
    it('should be available without authentification', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: '/users',
      });
      expect(statusCode).toBe(200);
    });
    it('should be available with authentification', async () => {
      const { cookies } = await getAuthenticatedUser(app);
      const { statusCode } = await app.inject({
        method: 'get',
        url: '/users',
        cookies,
      });
      expect(statusCode).toBe(200);
    });
    it('should return 200 on :id/edit', async () => {
      const { cookies, user } = await getAuthenticatedUser(app);
      const { statusCode } = await app.inject({
        method: 'get',
        url: `/users/${user.id}/edit`,
        cookies,
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('create', () => {
    it('should create entity and return 302 when using valid data', async () => {
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/users',
        body: {
          data: {
            email: 'new@test.com',
            password: 'test',
            firstName: 'test',
            lastName: 'test',
          },
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
      it('should not create entity and return 422 when existing email', async () => {
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
            data: {
              email: 'a@a.com',
              password: 'test',
              firstName: 'test',
              lastName: 'test',
            },
          },
        });
        expect(statusCode).toBe(422);
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
          data: {
            email: '', password: 'test', firstName: 'test', lastName: 'test',
          },
        }],
        ['email does not match pattern', {
          data: {
            email: 'newtest.com', password: 'test', firstName: 'test', lastName: 'test',
          },
        },
        ],
        ['password empty', {
          data: {
            email: 'new@test.com', password: '', firstName: 'test', lastName: 'test',
          },
        },
        ], ['firstName is empty', {
          data: {
            email: 'new@test.com', password: 'test', firstName: '', lastName: 'test',
          },
        },
        ], ['lastName is empty', {
          data: {
            email: 'new@test.com', password: 'test', firstName: 'test', lastName: '',
          },
        },
        ]])('should not create entity and return 422 when %s', async (_, body) => {
        const { statusCode } = await app.inject({
          method: 'post',
          url: '/users',
          body,
        });
        expect(statusCode).toBe(422);
        const users = await app.objection.models.user.query();
        expect(users).toHaveLength(0);
      });
    });
  });

  describe('update', () => {
    let cookies;
    let user;

    beforeEach(async () => {
      ({ cookies, user } = await getAuthenticatedUser(app));
    });

    it('should not be available without authentification', async () => {
      const { statusCode } = await app.inject({
        method: 'patch',
        url: `/users/${user.id}`,
      });
      expect(statusCode).toBe(302);
    });

    it('should allow to update entity and return 302 when using valid data', async () => {
      const { statusCode } = await app.inject({
        method: 'patch',
        url: `/users/${user.id}`,
        cookies,
        body: {
          data: {
            email: 'new@test.com',
            password: 'test',
            firstName: 'test',
            lastName: 'test',
          },
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
  });

  describe('delete', () => {
    let cookies;
    let user;

    beforeEach(async () => {
      ({ cookies, user } = await getAuthenticatedUser(app));
    });

    it('should allow to delete own entity and return 302', async () => {
      const response = await app.inject({
        method: 'delete',
        url: `/users/${user.id}`,
        cookies,
      });
      expect(response.statusCode).toBe(302);
      const users = await app.objection.models.task.query();
      expect(users).toHaveLength(0);
    });

    it('should not allow to delete other entity and return 422', async () => {
      const existingUser = await app.objection.models.user.query().insert({
        firstName: 'foo',
        lastName: 'bar',
        email: 'a@a.com',
        password: 'test',
      });
      const response = await app.inject({
        method: 'delete',
        url: `/users/${existingUser.id}`,
        cookies,
      });
      expect(response.statusCode).toBe(422);
      const users = await app.objection.models.task.query();
      expect(users).toHaveLength(0);
    });
  });
});
