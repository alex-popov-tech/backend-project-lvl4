import { internet } from 'faker';
import knex from 'knex';
import config from '../knexfile';
import app from '../server';

describe('Task', () => {
  let db;
  let server;
  let status;
  let user;
  let task;

  beforeAll(async () => {
    db = knex(config.test);
    await db.migrate.latest();
    server = await app();
  });

  beforeEach(async () => {
    await server.objection.models.task.query().delete();
    await server.objection.models.status.query().delete();
    await server.objection.models.user.query().delete();
    user = await server.objection.models.user.query().insert({
      firstName: 'foo',
      lastName: 'bar',
      email: internet.email(),
      password: 'test',
    });
    status = await server.objection.models.status.query().insert({
      name: 'test',
    });
    task = await server.objection.models.task.query().insert({
      name: 'test',
      description: 'test',
      status_id: status.id,
      creator_id: user.id,
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
        url: '/tasks',
      });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('create', () => {
    describe('when using valid data', () => {
      it('should return 302', async () => {
        const res = await server.inject({
          method: 'post',
          url: '/tasks',
          body: {
            name: 'test',
            description: 'test',
            status_id: status.id,
            creator_id: user.id,
            assigned_id: null,
          },
        });
        expect(res.statusCode).toBe(302);
      });
    });
    describe.skip('when using invalid data', () => {
      [
        { name: 'name', body: { description: 'test', status_id: status.id, creator_id: user.id } },
        { name: 'description', body: { name: 'test', status_id: status.id, creator_id: user.id } },
        { name: 'status', body: { name: 'test', description: 'test', creator_id: user.id } },
        { name: 'creator', body: { name: 'test', description: 'test', status_id: status.id } },
      ].forEach(({ name, body }) => {
        it(`should return 400 when missing required field ${name}`, async () => {
          const res = await server.inject({
            method: 'post',
            url: '/tasks',
            body,
          });
          expect(res.statusCode).toBe(400);
        });
      });
    });
  });

  describe('update', () => {
    describe('when using valid data', () => {
      it('should return 302', async () => {
        const newStatus = await server.objection.models.status.query().insert({
          name: 'test updated',
        });
        const res = await server.inject({
          method: 'put',
          url: '/tasks',
          body: {
            id: task.id,
            name: 'new name',
            description: 'new desrcription',
            status_id: newStatus.id,
            creator_id: user.id,
            assigned_id: user.id,
          },
        });
        expect(res.statusCode).toBe(302);
      });
    });
    // describe('when using existing name', () => {
    //   it('should return 302', async () => {
    //     const res = await server.inject({
    //       method: 'put',
    //       url: '/statuses',
    //       body: {
    //         id: status.id,
    //         name: status.name,
    //       },
    //     });
    //     expect(res.statusCode).toBe(302);
    //   });
    // });
  });

  // describe('delete', () => {
  //   describe('when using valid id', () => {
  //     it('should return 302', async () => {
  //       const res = await server.inject({
  //         method: 'delete',
  //         url: '/statuses',
  //         body: {
  //           id: status.id,
  //         },
  //       });
  //       expect(res.statusCode).toBe(302);
  //     });
  //   });
  //   describe('when using invalid id', () => {
  //     it('should return 302', async () => {
  //       const res = await server.inject({
  //         method: 'delete',
  //         url: '/statuses',
  //         body: {
  //           id: -1,
  //         },
  //       });
  //       expect(res.statusCode).toBe(302);
  //     });
  //   });
  // });
});
