import { random } from 'faker';
import { clearDatabaseState, launchApp, shutdownApp } from './helpers.js';

describe('Status', () => {
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
    it('should create entity and return 302 when using valid name', async () => {
      const status = {
        name: random.word(),
      };
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/statuses',
        body: status,
      });
      expect(statusCode).toBe(302);
      const statuses = await app.objection.models.status.query();
      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toMatchObject(status);
    });

    it('should not create entity and return 422 when using existing name', async () => {
      const existingStatus = await app.objection.models.status.query().insert({
        name: random.word(),
      });
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/statuses',
        body: {
          name: existingStatus.name,
        },
      });
      expect(statusCode).toBe(422);
      const statuses = await app.objection.models.status.query();
      expect(statuses).toHaveLength(1);
    });
  });

  describe('update', () => {
    let existingStatus;
    beforeEach(async () => {
      existingStatus = await app.objection.models.status.query().insert({
        name: random.word(),
      });
    });

    it('should update entity and return 302 when using valid name', async () => {
      const { statusCode } = await app.inject({
        method: 'patch',
        url: '/statuses',
        body: {
          id: existingStatus.id,
          name: 'new name',
        },
      });
      expect(statusCode).toBe(302);
      const statuses = await app.objection.models.status.query();
      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toMatchObject({ name: 'new name' });
    });
  });

  describe('delete', () => {
    it('should delete entity and return 302 when using valid id', async () => {
      const existingStatus = await app.objection.models.status.query().insert({
        name: random.word(),
      });
      const { statusCode } = await app.inject({
        method: 'delete',
        url: '/statuses',
        body: {
          id: existingStatus.id,
        },
      });
      expect(statusCode).toBe(302);
      const statuses = await app.objection.models.status.query();
      expect(statuses).toHaveLength(0);
    });
  });

  it('should return 302 when using invalid id', async () => {
    const res = await app.inject({
      method: 'delete',
      url: '/statuses',
      body: {
        id: -1,
      },
    });
    expect(res.statusCode).toBe(302);
  });
});
