import {
  clearDatabaseState, getAuthenticatedUser, launchApp, shutdownApp,
} from './helpers';

describe('Signup', () => {
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

  describe('create', () => {
    it('should create entity and return 302 when using valid data', async () => {
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
            email: 'a@a.com',
            password: 'test',
            firstName: 'test',
            lastName: 'test',
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
    let Cookie;
    let user;

    beforeEach(async () => {
      ({ Cookie, user } = await getAuthenticatedUser(app));
    });

    it('should allow to update entity and return 302 when using valid data', async () => {
      const { statusCode } = await app.inject({
        method: 'patch',
        url: '/users',
        headers: { Cookie },
        body: {
          id: user.id,
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

    it('should not allow to update other and return 302 when using valid data', async () => {
      const existingUser = await app.objection.models.user.query().insert({
        firstName: 'foo',
        lastName: 'bar',
        email: 'a@a.com',
        password: 'test',
      });
      const { statusCode } = await app.inject({
        method: 'patch',
        url: '/users',
        headers: { Cookie },
        body: {
          id: existingUser.id,
          email: 'new@test.com',
          password: 'test',
          firstName: 'test',
          lastName: 'test',
        },
      });
      expect(statusCode).toBe(302);
      expect(await app.objection.models.user.query().findById(existingUser.id))
        .toMatchObject({
          firstName: 'foo',
          lastName: 'bar',
          email: 'a@a.com',
        });
    });
  });

  describe('delete', () => {
    let Cookie;
    let user;

    beforeEach(async () => {
      ({ Cookie, user } = await getAuthenticatedUser(app));
    });

    it('should allow to delete own entity and return 302', async () => {
      const response = await app.inject({
        method: 'delete',
        url: '/users',
        headers: { Cookie },
        body: {
          id: user.id,
        },
      });
      expect(response.headers['set-cookie']).not.toBe(Cookie);
      expect(response.statusCode).toBe(302);
      const users = await app.objection.models.task.query();
      expect(users).toHaveLength(0);
    });

    it('should not allow to delete other entity and return 302', async () => {
      const existingUser = await app.objection.models.user.query().insert({
        firstName: 'foo',
        lastName: 'bar',
        email: 'a@a.com',
        password: 'test',
      });
      const response = await app.inject({
        method: 'delete',
        url: '/users',
        headers: { Cookie },
        body: {
          id: existingUser.id,
        },
      });
      expect(response.headers['set-cookie']).not.toBe(Cookie);
      expect(response.statusCode).toBe(302);
      const users = await app.objection.models.task.query();
      expect(users).toHaveLength(0);
    });
  });
});
