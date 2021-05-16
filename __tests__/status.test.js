import { random } from 'faker';
import {
  create, getDatabaseHelpers, getAuthenticatedUser, launchApp, shutdownApp,
} from './helpers';

describe('Status', () => {
  let app;
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
    ({ cookies } = await getAuthenticatedUser(app));
  });

  afterEach(async () => {
    await db.clear();
  });

  describe('index', () => {
    it('should not be available without authentification', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: '/statuses',
      });
      expect(statusCode).toBe(302);
    });

    it('should be available with authentification', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: '/statuses',
        cookies,
      });
      expect(statusCode).toBe(200);
    });
    it('should return 200 on edit/:id', async () => {
      const existingStatus = await db.insert.status(create.status());
      const { statusCode } = await app.inject({
        method: 'get',
        url: `/statuses/${existingStatus.id}/edit`,
        cookies,
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('create', () => {
    it('should create entity and return 302 when using valid name', async () => {
      const status = {
        data: {
          name: random.word(),
        },
      };
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/statuses',
        cookies,
        body: status,
      });
      expect(statusCode).toBe(302);
      const statuses = await db.find.statuses();
      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toMatchObject(status.data);
    });

    it('should not create entity and return 422 when using existing name', async () => {
      const existingStatus = await db.insert.status(create.status());
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/statuses',
        cookies,
        body: {
          data: {
            name: existingStatus.name,
          },
        },
      });
      expect(statusCode).toBe(422);
      const statuses = await db.find.statuses();
      expect(statuses).toHaveLength(1);
    });
  });

  describe('update', () => {
    let existingStatus;
    beforeEach(async () => {
      existingStatus = await db.insert.status(create.status());
    });

    it('should update entity and return 302 when using valid name', async () => {
      const { statusCode } = await app.inject({
        method: 'patch',
        url: `/statuses/${existingStatus.id}`,
        cookies,
        body: {
          data: {
            name: 'new name',
          },
        },
      });
      expect(statusCode).toBe(302);
      const statuses = await db.find.statuses();
      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toMatchObject({ name: 'new name' });
    });
  });

  describe('delete', () => {
    it('should delete entity and return 302 when using valid id', async () => {
      const existingStatus = await db.insert.status(create.status());
      const { statusCode } = await app.inject({
        method: 'delete',
        url: `/statuses/${existingStatus.id}`,
        cookies,
      });
      expect(statusCode).toBe(302);
      const statuses = await db.find.statuses();
      expect(statuses).toHaveLength(0);
    });
  });

  it('should return 302 when using invalid id', async () => {
    const res = await app.inject({
      method: 'delete',
      url: '/statuses/-1',
      cookies,
    });
    expect(res.statusCode).toBe(302);
  });
});
