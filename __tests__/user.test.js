import _ from 'lodash';
import {
  create, getDatabaseHelpers, createNewAuthenticatedUser, launchApp, shutdownApp,
} from './helpers';

describe('Users', () => {
  let app;
  let existingUser;
  let cookies;
  let db;

  beforeAll(async () => {
    app = await launchApp();
    db = getDatabaseHelpers(app);
  });

  afterAll(async () => {
    await shutdownApp(app);
  });

  beforeEach(async () => {
    ({ user: existingUser, cookies } = await createNewAuthenticatedUser(app));
  });

  afterEach(async () => {
    await db.clear();
  });

  describe('index', () => {
    it('should render all users', async () => {
      const unauthentificatedResponse = await app.inject({
        method: 'get',
        url: app.reverse('users'),
      });
      expect(unauthentificatedResponse.statusCode).toBe(200);
      const authentificatedResponse = await app.inject({
        method: 'get',
        url: app.reverse('users'),
        cookies,
      });
      expect(authentificatedResponse.statusCode).toBe(200);
    });
  });

  describe('new', () => {
    it('should render page', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('newUser'),
        cookies,
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('create', () => {
    it('should create entity and return 302 when using valid data', async () => {
      const userData = create.user();
      const { statusCode, headers: { location } } = await app.inject({
        method: 'post',
        url: app.reverse('createUser'),
        body: { data: userData },
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('welcome'));
      const users = await db.model.find.users().whereNot('id', existingUser.id);
      expect(users).toHaveLength(1);
      expect(_.omit(users[0], 'password')).toMatchObject(_.omit(userData, 'password'));
    });
    it('should not create entity and return 422 when existing email', async () => {
      const userData = create.user({ email: existingUser.email });
      const { statusCode } = await app.inject({
        method: 'post',
        url: app.reverse('createUser'),
        body: { data: userData },
      });
      expect(statusCode).toBe(422);
      const users = await db.model.find.users();
      expect(users).toHaveLength(1);
    });

    it.each([
      ['empty email', { data: create.user({ email: '' }) }],
      ['email does not match pattern', { data: create.user({ email: 'aa.com' }) }],
      ['password empty', { data: create.user({ password: '' }) }],
      ['firstName empty', { data: create.user({ firstName: '' }) }],
      ['lastName empty', { data: create.user({ lastName: '' }) }],
    ])('should not create entity and return 422 when %s', async (name, body) => {
      const { statusCode } = await app.inject({
        method: 'post',
        url: app.reverse('createUser'),
        body,
      });
      expect(statusCode).toBe(422);
      const users = await db.model.find.users();
      expect(users).toHaveLength(1);
    });
  });

  describe('edit', () => {
    it('should not be available without authentification', async () => {
      const { statusCode, headers: { location } } = await app.inject({
        method: 'get',
        url: app.reverse('editUser', { id: existingUser.id }),
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('welcome'));
    });
    it('should render page', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('editUser', { id: existingUser.id }),
        cookies,
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('update', () => {
    it('should allow to update own entity and return 302', async () => {
      const userData = create.user();
      const { statusCode, headers: { location } } = await app.inject({
        method: 'patch',
        url: app.reverse('updateUser', { id: existingUser.id }),
        cookies,
        body: { data: userData },
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('users'));
      const users = await db.model.find.users();
      expect(users).toHaveLength(1);
      expect(_.omit(users[0], 'password')).toMatchObject(_.omit(userData, 'password'));
    });
    it('should not allow to update other entity and return 422', async () => {
      const userToUpdate = await db.model.insert.user(create.user());
      const updatedUserData = create.user();
      const { statusCode } = await app.inject({
        method: 'patch',
        url: app.reverse('updateUser', { id: userToUpdate.id }),
        cookies,
        body: { data: updatedUserData },
      });
      expect(statusCode).toBe(422);
      const users = await db.model.find.users().where('id', userToUpdate.id);
      expect(userToUpdate).toMatchObject(_.omit(users[0], 'createdAt', 'updatedAt'));
    });
  });

  describe('destroy', () => {
    it('should allow to destroy own entity and return 302', async () => {
      const { statusCode, headers: { location } } = await app.inject({
        method: 'delete',
        url: app.reverse('destroyUser', { id: existingUser.id }),
        cookies,
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('users'));
      const users = await db.model.find.users();
      expect(users).toHaveLength(0);
    });

    it('should not allow to destroy other entity and return 422', async () => {
      const otherUser = await db.model.insert.user(create.user());
      const response = await app.inject({
        method: 'delete',
        url: app.reverse('destroyUser', { id: otherUser.id }),
        cookies,
      });
      expect(response.statusCode).toBe(422);
      const users = await db.model.find.users();
      expect(users).toHaveLength(2);
    });
  });
});
