import {
  create, getDatabaseHelpers, getAuthenticatedUser, launchApp, shutdownApp,
} from './helpers';

describe('Label', () => {
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
        url: '/labels',
      });
      expect(statusCode).toBe(302);
    });
    it('should be available with authentification', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: '/labels',
        cookies,
      });
      expect(statusCode).toBe(200);
    });
    it('should return 200 on edit/:id ', async () => {
      const existingLabel = await db.insert.label(create.label());
      const { statusCode } = await app.inject({
        method: 'get',
        url: `/labels/${existingLabel.id}/edit`,
        cookies,
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('create', () => {
    it('should create entity and return 302 when using valid name', async () => {
      const label = create.label();
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/labels',
        cookies,
        body: { data: label },
      });
      expect(statusCode).toBe(302);
      const labels = await db.find.labels();
      expect(labels).toHaveLength(1);
      expect(labels[0]).toMatchObject(label);
    });

    it('should not create entity and return 422 when using existing name', async () => {
      const existingLabel = await db.insert.label(create.label());
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/labels',
        cookies,
        body: {
          data: {
            name: existingLabel.name,
          },
        },
      });
      expect(statusCode).toBe(422);
      const labels = await db.find.labels();
      expect(labels).toHaveLength(1);
    });
  });

  describe('update', () => {
    let existingLabel;
    beforeEach(async () => {
      existingLabel = await db.insert.label(create.label());
    });

    it('should update entity and return 302 when using valid name', async () => {
      const updatedLabelData = create.label();
      const { statusCode } = await app.inject({
        method: 'patch',
        url: `/labels/${existingLabel.id}`,
        cookies,
        body: {
          data: {
            name: updatedLabelData.name,
          },
        },
      });
      expect(statusCode).toBe(302);
      const labels = await db.find.labels();
      expect(labels).toHaveLength(1);
      expect(labels[0]).toMatchObject(updatedLabelData);
    });
  });

  describe('delete', () => {
    it('should delete entity return 302 when using valid id', async () => {
      const existingLabel = await db.insert.label(create.label());
      const { statusCode } = await app.inject({
        method: 'delete',
        url: `/labels/${existingLabel.id}`,
        cookies,
      });
      expect(statusCode).toBe(302);
      const labels = await db.find.labels();
      expect(labels).toHaveLength(0);
    });

    it('should return 302 when using invalid id', async () => {
      const res = await app.inject({
        method: 'delete',
        url: '/labels/999',
        cookies,
      });
      expect(res.statusCode).toBe(302);
    });
  });
});
