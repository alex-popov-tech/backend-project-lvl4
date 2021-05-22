import {
  create, getDatabaseHelpers, createNewAuthenticatedUser, launchApp, shutdownApp,
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
    ({ cookies } = await createNewAuthenticatedUser(app));
  });

  afterEach(async () => {
    await db.clear();
  });

  describe('index', () => {
    it('should not be available without authentification', async () => {
      await db.model.insert.status(create.status());
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('statuses'),
      });
      expect(statusCode).toBe(302);
    });

    it('should be available with authentification', async () => {
      await db.model.insert.status(create.status());
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('statuses'),
        cookies,
      });
      expect(statusCode).toBe(200);
    });
    it('should return 200 on edit/:id', async () => {
      const existingStatus = await db.model.insert.status(create.status());
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
      const statusData = create.status();
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/statuses',
        cookies,
        body: { data: statusData },
      });
      expect(statusCode).toBe(302);
      const statuses = await db.model.find.statuses();
      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toMatchObject(statusData);
    });

    it('should not create entity and return 422 when using existing name', async () => {
      const existingStatusData = create.status();
      await db.model.insert.status(existingStatusData);
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/statuses',
        cookies,
        body: {
          data: existingStatusData,
        },
      });
      expect(statusCode).toBe(422);
      const statuses = await db.model.find.statuses();
      expect(statuses).toHaveLength(1);
    });
  });

  describe('update', () => {
    let existingStatus;
    beforeEach(async () => {
      existingStatus = await db.model.insert.status(create.status());
    });

    it('should update entity and return 302 when using valid name', async () => {
      const updatedStatus = create.status();
      const { statusCode } = await app.inject({
        method: 'patch',
        url: `/statuses/${existingStatus.id}`,
        cookies,
        body: {
          data: updatedStatus,
        },
      });
      expect(statusCode).toBe(302);
      const statuses = await db.model.find.statuses();
      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toMatchObject(updatedStatus);
    });
  });

  describe('delete', () => {
    it('should delete entity and return 302 when using valid id', async () => {
      const [existingStatus] = await Promise.all([
        db.model.insert.status(create.status()),
        db.model.insert.status(create.status()),
      ]);
      const { statusCode } = await app.inject({
        method: 'delete',
        url: `/statuses/${existingStatus.id}`,
        cookies,
      });
      expect(statusCode).toBe(302);
      const statuses = await db.model.find.statuses();
      expect(statuses).toHaveLength(1);
      expect(statuses[0].id).not.toBe(existingStatus.id);
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
