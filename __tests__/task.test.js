import { internet } from 'faker';
import { launchApp, shutdownApp, clear } from './base.js';

describe('Task', () => {
  let db;
  let app;
  let status;
  let user;

  beforeAll(async () => {
    ({ app, db } = await launchApp());
  });

  afterAll(async () => {
    await shutdownApp(app, db);
  });

  beforeEach(async () => {
    await clear(app);
    user = await app.objection.models.user.query().insert({
      firstName: 'foo',
      lastName: 'bar',
      email: internet.email(),
      password: 'test',
    });
    status = await app.objection.models.status.query().insert({
      name: 'test status',
    });
  });

  describe('read', () => {
    it('should return 200', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: '/task',
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('create', () => {
    describe('when using valid data', () => {
      it('should return 302', async () => {
        const name = 'test task';
        const description = 'test description';
        const { statusCode } = await app.inject({
          method: 'post',
          url: '/task',
          body: {
            name,
            description,
            status_id: status.id,
            creator_id: user.id,
            assigned_id: null,
          },
        });
        expect(statusCode).toBe(302);

        const tasks = await app.objection.models.task.query();
        expect(tasks).toHaveLength(1);
        expect(tasks[0]).toMatchObject({
          name,
          description,
          statusId: status.id,
          creatorId: user.id,
        });
      });
    });

    describe('when using invalid data', () => {
      [
        { name: 'name', data: () => ({ description: 'test', status_id: status.id, creator_id: user.id }) },
        { name: 'description', data: () => ({ name: 'test', status_id: status.id, creator_id: user.id }) },
        { name: 'status', data: () => ({ name: 'test', description: 'test', creator_id: user.id }) },
        { name: 'creator', data: () => ({ name: 'test', description: 'test', status_id: status.id }) },
      ].forEach(({ name, data }) => {
        it(`should return 400 when missing required field ${name}`, async () => {
          const { statusCode } = await app.inject({
            method: 'post',
            url: '/task',
            body: data(),
          });
          expect(statusCode).toBe(400);
          const tasks = await app.objection.models.task.query();
          expect(tasks).toHaveLength(0);
        });
      });
    });
  });

  describe('update', () => {
    let existingTask;
    beforeEach(async () => {
      existingTask = await app.objection.models.task.query().insert({
        name: 'test',
        description: 'test',
        status_id: status.id,
        creator_id: user.id,
      });
    });

    it('should return 302 when using valid data', async () => {
      const updatedStatus = await app.objection.models.status.query().insert({
        name: 'test updated',
      });
      const updatedTask = {
        id: existingTask.id,
        name: 'updated-name',
        description: 'updated-descr',
        status_id: updatedStatus.id,
        creator_id: user.id,
        assigned_id: user.id,
      };
      const { statusCode } = await app.inject({
        method: 'put',
        url: '/task',
        body: updatedTask,
      });
      expect(statusCode).toBe(302);
      const tasks = await app.objection.models.task.query();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toMatchObject({
        id: updatedTask.id,
        name: updatedTask.name,
        description: updatedTask.description,
        statusId: updatedTask.status_id,
        creatorId: updatedTask.creator_id,
        assignedId: updatedTask.assigned_id,
      });
    });
  });

  describe('delete', () => {
    let existingTask;
    beforeEach(async () => {
      existingTask = await app.objection.models.task.query().insert({
        name: 'test',
        description: 'test',
        status_id: status.id,
        creator_id: user.id,
      });
    });
    it('should return 302', async () => {
      const { statusCode } = await app.inject({
        method: 'delete',
        url: '/task',
        body: {
          id: existingTask.id,
        },
      });
      expect(statusCode).toBe(302);
      const tasks = await app.objection.models.task.query();
      expect(tasks).toHaveLength(0);
    });
  });
});
