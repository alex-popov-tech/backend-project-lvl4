import _ from 'lodash';
import {
  create, getDatabaseHelpers, createNewAuthenticatedUser, launchApp, shutdownApp,
} from './helpers';

describe('Users', () => {
  let app;
  let db;

  beforeAll(async () => {
    app = await launchApp();
    db = getDatabaseHelpers(app);
  });

  afterAll(async () => {
    await shutdownApp(app);
  });

  afterEach(async () => {
    await db.clear();
  });

  describe('index', () => {
    it('should be available without authentification', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('users'),
      });
      expect(statusCode).toBe(200);
    });
    it('should be available with authentification', async () => {
      const { cookies } = await createNewAuthenticatedUser(app);
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('users'),
        cookies,
      });
      expect(statusCode).toBe(200);
    });
    it('should return 200 on :id/edit', async () => {
      const { cookies, user } = await createNewAuthenticatedUser(app);
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
      const user = create.user();
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/users',
        body: { data: user },
      });
      expect(statusCode).toBe(302);
      const users = await db.model.find.users();
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    });

    describe('when using invalid data', () => {
      it('should not create entity and return 422 when existing email', async () => {
        const user = create.user();
        await db.model.insert.user(user);
        const { statusCode } = await app.inject({
          method: 'post',
          url: '/users',
          body: user,
        });
        expect(statusCode).toBe(422);
        const users = await db.model.find.users();
        expect(users).toHaveLength(1);
        expect(users[0]).toMatchObject({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
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
        ]])('should not create entity and return 422 when %s', async (name, body) => {
        const { statusCode } = await app.inject({
          method: 'post',
          url: '/users',
          body,
        });
        expect(statusCode).toBe(422);
        const users = await db.model.find.users();
        expect(users).toHaveLength(0);
      });
    });
  });

  describe('update', () => {
    let cookies;
    let user;

    beforeEach(async () => {
      ({ cookies, user } = await createNewAuthenticatedUser(app));
    });

    it('should not be available without authentification', async () => {
      const { statusCode } = await app.inject({
        method: 'patch',
        url: `/users/${user.id}`,
      });
      expect(statusCode).toBe(302);
    });

    it('should allow to update own entity and return 302', async () => {
      const {
        email, firstName, lastName, password,
      } = create.user();
      const { statusCode } = await app.inject({
        method: 'patch',
        url: `/users/${user.id}`,
        cookies,
        body: {
          data: {
            email, firstName, lastName, password,
          },
        },
      });
      expect(statusCode).toBe(302);
      const users = await db.model.find.users();
      expect(users).toHaveLength(1);
      expect(users[0]).toMatchObject({ email, firstName, lastName });
    });

    it('should not allow to update other entity and return 422', async () => {
      const existingUserData = create.user();
      const existingUser = await db.model.insert.user(existingUserData);
      const { statusCode } = await app.inject({
        method: 'patch',
        url: `/users/${existingUser.id}`,
        cookies,
        body: create.user(),
      });
      expect(statusCode).toBe(422);
      const users = await db.model.find.users();
      expect(users).toHaveLength(2);
      expect(_.omit(users.find(({ id }) => id === existingUser.id), 'password'))
        .toMatchObject(_.omit(existingUserData, 'password'));
    });
  });

  describe('delete', () => {
    let cookies;
    let user;

    beforeEach(async () => {
      ({ cookies, user } = await createNewAuthenticatedUser(app));
    });

    it('should allow to delete own entity and return 302', async () => {
      const response = await app.inject({
        method: 'delete',
        url: `/users/${user.id}`,
        cookies,
      });
      expect(response.statusCode).toBe(302);
      const users = await db.model.find.users();
      expect(users).toHaveLength(0);
    });

    it('should not allow to delete other entity and return 422', async () => {
      const existingUser = await db.model.insert.user(create.user());
      const response = await app.inject({
        method: 'delete',
        url: `/users/${existingUser.id}`,
        cookies,
      });
      expect(response.statusCode).toBe(422);
      const users = await db.model.find.users();
      expect(users).toHaveLength(2);
    });
  });
});
