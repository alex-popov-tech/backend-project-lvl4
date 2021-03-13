import { internet } from 'faker';
import { launchApp, shutdownApp, clear } from './helpers.js';

describe('Task', () => {
  let app;
  let existingStatus;
  let existingUser;

  beforeAll(async () => {
    app = await launchApp();
  });

  afterAll(async () => {
    await shutdownApp(app);
  });

  beforeEach(async () => {
    await clear(app);
    existingUser = await app.objection.models.user.query().insert({
      firstName: 'foo',
      lastName: 'bar',
      email: internet.email(),
      password: 'test',
    });
    existingStatus = await app.objection.models.status.query().insert({
      name: 'test status',
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
            statusId: existingStatus.id,
            creatorId: existingUser.id,
            assignedId: null,
          },
        });
        expect(statusCode).toBe(302);

        const tasks = await app.objection.models.task.query();
        expect(tasks).toHaveLength(1);
        expect(tasks[0]).toMatchObject({
          name,
          description,
          statusId: existingStatus.id,
          creatorId: existingUser.id,
        });
      });
    });

    describe('when using invalid data', () => {
      it.each([
        ['name', () => ({ description: 'test', statusId: existingStatus.id, creatorId: existingUser.id })],
        ['description', () => ({ name: 'test', statusId: existingStatus.id, creatorId: existingUser.id })],
        ['status', () => ({ name: 'test', description: 'test', creatorId: existingUser.id })],
        ['creator', () => ({ name: 'test', description: 'test', statusId: existingStatus.id })],
      ])('should return 400 when missing required field %s', async (_, data) => {
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

  describe('update', () => {
    let existingTask;
    beforeEach(async () => {
      existingTask = await app.objection.models.task.query().insert({
        name: 'test',
        description: 'test',
        statusId: existingStatus.id,
        creatorId: existingUser.id,
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
        statusId: updatedStatus.id,
        creatorId: existingUser.id,
        assignedId: existingUser.id,
      };
      const { statusCode } = await app.inject({
        method: 'put',
        url: '/task',
        body: updatedTask,
      });
      expect(statusCode).toBe(302);
      const tasks = await app.objection.models.task.query();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toMatchObject(updatedTask);
    });
  });

  describe('delete', () => {
    let existingTask;
    beforeEach(async () => {
      existingTask = await app.objection.models.task.query().insert({
        name: 'test',
        description: 'test',
        statusId: existingStatus.id,
        creatorId: existingUser.id,
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
