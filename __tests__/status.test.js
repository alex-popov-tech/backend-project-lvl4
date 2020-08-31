import knex from 'knex';
import { random } from 'faker';
import config from '../knexfile';
import app from '../server';

describe('Status', () => {
  let db;
  let server;
  let existingStatus;

  beforeAll(async () => {
    db = knex(config.test);
    await db.migrate.latest();
    server = await app();
  });

  beforeEach(async () => {
    await server.objection.models.status.query().delete();
    existingStatus = await server.objection.models.status.query().insert({
      name: random.word(),
    });
  });

  afterAll(async () => {
    await server.close();
    await db.destroy();
  });

  describe('read', () => {
    it('should return 200', async () => {
      const res = await server.inject({
        method: 'get',
        url: '/statuses',
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('create', () => {
    describe('when using valid name', () => {
      it('should return 302', async () => {
        const res = await server.inject({
          method: 'post',
          url: '/statuses',
          body: {
            name: 'name',
          },
        });
        expect(res.statusCode).toBe(302);
      });
    });
    describe('when using existing name', () => {
      it('should return 400', async () => {
        const res = await server.inject({
          method: 'post',
          url: '/statuses',
          body: {
            name: existingStatus.name,
          },
        });
        expect(res.statusCode).toBe(400);
      });
    });
  });

  describe('update', () => {
    describe('when using valid name', () => {
      it('should return 302', async () => {
        const res = await server.inject({
          method: 'put',
          url: '/statuses',
          body: {
            id: existingStatus.id,
            name: 'new name',
          },
        });
        expect(res.statusCode).toBe(302);
      });
    });
    describe('when using existing name', () => {
      it('should return 302', async () => {
        const res = await server.inject({
          method: 'put',
          url: '/statuses',
          body: {
            id: existingStatus.id,
            name: existingStatus.name,
          },
        });
        expect(res.statusCode).toBe(302);
      });
    });
  });

  describe('delete', () => {
    describe('when using valid id', () => {
      it('should return 302', async () => {
        const res = await server.inject({
          method: 'delete',
          url: '/statuses',
          body: {
            id: existingStatus.id,
          },
        });
        expect(res.statusCode).toBe(302);
      });
    });
    describe('when using invalid id', () => {
      it('should return 302', async () => {
        const res = await server.inject({
          method: 'delete',
          url: '/statuses',
          body: {
            id: -1,
          },
        });
        expect(res.statusCode).toBe(302);
      });
    });
  });
});
