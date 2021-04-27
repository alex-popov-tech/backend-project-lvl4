import { random } from 'faker';
import {
  clearDatabaseState, getAuthenticatedUser, launchApp, shutdownApp,
} from './helpers';

describe('Label', () => {
  let app;
  let cookies;

  beforeAll(async () => {
    app = await launchApp();
  });

  afterAll(async () => {
    await shutdownApp(app);
  });

  beforeEach(async () => {
    await clearDatabaseState(app);
    ({ cookies } = await getAuthenticatedUser(app));
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
      const existingLabel = await app.objection.models.label.query().insert({
        name: random.word(),
      });
      const { statusCode } = await app.inject({
        method: 'get',
        url: `/labels/edit/${existingLabel.id}`,
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
        url: '/labels',
        cookies,
        body: status,
      });
      expect(statusCode).toBe(302);
      const labels = await app.objection.models.label.query();
      expect(labels).toHaveLength(1);
      expect(labels[0]).toMatchObject(status.data);
    });

    it('should not create entity and return 422 when using existing name', async () => {
      const existingLabel = await app.objection.models.label.query().insert({
        name: random.word(),
      });
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
      const labels = await app.objection.models.label.query();
      expect(labels).toHaveLength(1);
    });
  });

  describe('update', () => {
    let existingLabel;
    beforeEach(async () => {
      existingLabel = await app.objection.models.label.query().insert({
        name: random.word(),
      });
    });

    it('should update entity and return 302 when using valid name', async () => {
      const { statusCode } = await app.inject({
        method: 'patch',
        url: `/labels/${existingLabel.id}`,
        cookies,
        body: {
          data: {
            name: 'new name',
          },
        },
      });
      expect(statusCode).toBe(302);
      const labels = await app.objection.models.label.query();
      expect(labels).toHaveLength(1);
      expect(labels[0]).toMatchObject({ name: 'new name' });
    });
  });

  describe('delete', () => {
    it('should delete entity return 302 when using valid id', async () => {
      const existingLabel = await app.objection.models.label.query().insert({
        name: random.word(),
      });
      const { statusCode } = await app.inject({
        method: 'delete',
        url: `/labels/${existingLabel.id}`,
        cookies,
      });
      expect(statusCode).toBe(302);
      const labels = await app.objection.models.label.query();
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
