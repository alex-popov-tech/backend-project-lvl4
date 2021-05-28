import {
  create, getDatabaseHelpers, createNewAuthenticatedUser, launchApp, shutdownApp,
} from './helpers';

describe('Status', () => {
  let app;
  let cookies;
  let db;
  let existingStatus;

  beforeAll(async () => {
    app = await launchApp();
    db = getDatabaseHelpers(app);
  });

  afterAll(async () => {
    await shutdownApp(app);
  });

  beforeEach(async () => {
    ({ cookies } = await createNewAuthenticatedUser(app));
    existingStatus = await db.model.insert.status(create.status());
  });

  afterEach(async () => {
    await db.clear();
  });

  describe('index', () => {
    it('should not be available without authentification', async () => {
      const { statusCode, headers: { location } } = await app.inject({
        method: 'get',
        url: app.reverse('statuses'),
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('welcome'));
    });
    it('should render page', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('statuses'),
        cookies,
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('new', () => {
    it('should not be available without authentification', async () => {
      const { statusCode, headers: { location } } = await app.inject({
        method: 'get',
        url: app.reverse('newStatus'),
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('welcome'));
    });
    it('should render page', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('newStatus'),
        cookies,
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('create', () => {
    it('should create entity and return 302 when using valid name', async () => {
      const statusData = create.status();
      const { statusCode, headers: { location } } = await app.inject({
        method: 'post',
        url: app.reverse('createStatus'),
        cookies,
        body: { data: statusData },
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('statuses'));
      const statuses = await db.model.find.statuses().whereNot('id', existingStatus.id);
      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toMatchObject(statusData);
    });
    it('should not create entity and return 422 when using existing name', async () => {
      const existingStatusData = create.status({ name: existingStatus.name });
      const { statusCode } = await app.inject({
        method: 'post',
        url: app.reverse('createStatus'),
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

  describe('edit', () => {
    it('should not be available without authentification', async () => {
      await db.model.insert.label(create.label());
      const { statusCode, headers: { location } } = await app.inject({
        method: 'get',
        url: app.reverse('editStatus', { id: existingStatus.id }),
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('welcome'));
    });
    it('should render page', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('editStatus', { id: existingStatus.id }),
        cookies,
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('update', () => {
    it('should update entity and return 302 when using valid name', async () => {
      const updatedStatus = create.status();
      const { statusCode, headers: { location } } = await app.inject({
        method: 'patch',
        url: app.reverse('updateStatus', { id: existingStatus.id }),
        cookies,
        body: { data: updatedStatus },
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('statuses'));
      const statuses = await db.model.find.statuses();
      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toMatchObject(updatedStatus);
    });
    it('should not update entity when using invalid name', async () => {
      const updatedStatus = create.status({ name: '' });
      const { statusCode } = await app.inject({
        method: 'patch',
        url: app.reverse('updateStatus', { id: existingStatus.id }),
        cookies,
        body: { data: updatedStatus },
      });
      expect(statusCode).toBe(422);
      const statuses = await db.model.find.statuses();
      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toMatchObject(existingStatus);
    });
  });

  describe('destroy', () => {
    it('should destroy entity and return 302 when using valid id', async () => {
      await db.model.insert.status(create.status());
      const { statusCode, headers: { location } } = await app.inject({
        method: 'delete',
        url: app.reverse('destroyStatus', { id: existingStatus.id }),
        cookies,
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('statuses'));
      const statuses = await db.model.find.statuses();
      expect(statuses).toHaveLength(1);
      expect(statuses[0].id).not.toBe(existingStatus.id);
    });
  });

  it('should return 302 when using invalid id', async () => {
    const { statusCode, headers: { location } } = await app.inject({
      method: 'delete',
      url: app.reverse('destroyStatus', { id: 999 }),
      cookies,
    });
    expect(statusCode).toBe(302);
    expect(location).toBe(app.reverse('statuses'));
  });
});
