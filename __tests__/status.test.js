import { random } from 'faker';
import {
  database, getAuthenticatedUser, launchApp, shutdownApp,
} from './helpers';

describe('Status', () => {
  let app;
  let cookies;
  let db;

  beforeAll(async () => {
    app = await launchApp();
    db = database(app);
  });

  afterAll(async () => {
    await shutdownApp(app);
  });

  beforeEach(async () => {
    await db.clear();
    ({ cookies } = await getAuthenticatedUser(app));
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
    it('should return 200 on edit/:id ', async () => {
      const existingStatus = await db.insert.status();
      const { statusCode } = await app.inject({
        method: 'get',
        url: `/statuses/edit/${existingStatus.id}`,
        cookies,
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('create', () => {
    it('should create entity and return 302 when using valid name', async () => {
      const status = {
        name: random.word(),
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
      expect(statuses[0]).toMatchObject(status);
    });

    it('should not create entity and return 422 when using existing name', async () => {
      const existingStatus = await db.insert.status();
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/statuses',
        cookies,
        body: {
          name: existingStatus.name,
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
      existingStatus = await db.insert.status();
    });

    it('should update entity and return 302 when using valid name', async () => {
      const { statusCode } = await app.inject({
        method: 'patch',
        url: `/statuses/${existingStatus.id}`,
        cookies,
        body: {
          name: 'new name',
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
      const existingStatus = await db.insert.status();
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
