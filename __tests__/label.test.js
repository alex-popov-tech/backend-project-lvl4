import {
  create, getDatabaseHelpers, createNewAuthenticatedUser, launchApp, shutdownApp,
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
    ({ cookies } = await createNewAuthenticatedUser(app));
  });

  afterEach(async () => {
    await db.clear();
  });

  describe('index', () => {
    it('should not be available without authentification', async () => {
      await db.model.insert.label(create.label());
      const { statusCode, headers: { location } } = await app.inject({
        method: 'get',
        url: app.reverse('labels'),
      });
      expect(location).toBe(app.reverse('welcome'));
      expect(statusCode).toBe(302);
    });
    it('should render all labels', async () => {
      await db.model.insert.label(create.label());
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('labels'),
        cookies,
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('new', () => {
    it('should not be available without authentification', async () => {
      const { statusCode, headers: { location } } = await app.inject({
        method: 'get',
        url: app.reverse('newLabel'),
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('welcome'));
    });
    it('should render page', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('newLabel'),
        cookies,
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('create', () => {
    it('should create entity and return 302 when using valid name', async () => {
      const label = create.label();
      const { statusCode, headers: { location } } = await app.inject({
        method: 'post',
        url: app.reverse('createLabel'),
        cookies,
        body: { data: label },
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('labels'));
      const labels = await db.model.find.labels();
      expect(labels).toHaveLength(1);
      expect(labels[0]).toMatchObject(label);
    });
    it('should not create entity and return 422 when using existing name', async () => {
      const labelData = create.label();
      await db.model.insert.label(labelData);
      const { statusCode } = await app.inject({
        method: 'post',
        url: app.reverse('createLabel'),
        cookies,
        body: {
          data: labelData,
        },
      });
      expect(statusCode).toBe(422);
      const labels = await db.model.find.labels();
      expect(labels).toHaveLength(1);
      expect(labels[0]).toMatchObject(labelData);
    });
  });

  describe('edit', () => {
    let existingLabel;
    beforeEach(async () => {
      existingLabel = await db.model.insert.label(create.label());
    });

    it('should not be available without authentification', async () => {
      const { statusCode, headers: { location } } = await app.inject({
        method: 'get',
        url: app.reverse('editLabel', { id: existingLabel.id }),
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('welcome'));
    });
    it('should render page', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('editLabel', { id: existingLabel.id }),
        cookies,
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('update', () => {
    let existingLabel;
    beforeEach(async () => {
      existingLabel = await db.model.insert.label(create.label());
    });

    it('should update entity and return 302 when using valid name', async () => {
      const updatedLabelData = create.label();
      const { statusCode, headers: { location } } = await app.inject({
        method: 'patch',
        url: app.reverse('updateLabel', { id: existingLabel.id }),
        cookies,
        body: { data: updatedLabelData },
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('labels'));
      const labels = await db.model.find.labels();
      expect(labels).toHaveLength(1);
      expect(labels[0]).toMatchObject(updatedLabelData);
    });
    it('should not update entity when using invalid name', async () => {
      const updatedLabelData = create.label({ name: '' });
      const { statusCode } = await app.inject({
        method: 'patch',
        url: app.reverse('updateLabel', { id: existingLabel.id }),
        cookies,
        body: { data: { updatedLabelData } },
      });
      expect(statusCode).toBe(422);
      const labels = await db.model.find.labels();
      expect(labels).toHaveLength(1);
      expect(labels[0]).toMatchObject(existingLabel);
    });
  });

  describe('destroy', () => {
    it('should destroy entity return 302 when using valid id', async () => {
      const [existingLabel] = await Promise.all([
        db.model.insert.label(create.label()),
        db.model.insert.label(create.label()),
      ]);
      const { statusCode, headers: { location } } = await app.inject({
        method: 'delete',
        url: app.reverse('destroyLabel', { id: existingLabel.id }),
        cookies,
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('labels'));
      const labels = await db.model.find.labels();
      expect(labels).toHaveLength(1);
      expect(labels[0].id).not.toBe(existingLabel.id);
    });

    it('should return 302 when using invalid id', async () => {
      const { statusCode, headers: { location } } = await app.inject({
        method: 'delete',
        url: app.reverse('destroyLabel', { id: 999 }),
        cookies,
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('labels'));
    });
  });
});
