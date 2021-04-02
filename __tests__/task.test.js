import { internet } from 'faker';
import {
  clearDatabaseState, getAuthenticatedUser, launchApp, shutdownApp,
} from './helpers';

describe('Task', () => {
  let app;
  let Cookie;
  let existingStatus;
  let existingLabel;
  let existingUser;

  beforeAll(async () => {
    app = await launchApp();
  });

  afterAll(async () => {
    await shutdownApp(app);
  });

  beforeEach(async () => {
    await clearDatabaseState(app);
    ({ Cookie } = await getAuthenticatedUser(app));
    existingStatus = await app.objection.models.status.query().insert({
      name: 'test status',
    });
    existingLabel = await app.objection.models.label.query().insert({
      name: 'test label',
    });
    existingUser = await app.objection.models.user.query().insert({
      firstName: 'foo',
      lastName: 'bar',
      email: internet.email(),
      password: 'test',
      labelIds: existingLabel.id,
      statusId: existingStatus.id,
    });
  });

  describe('create', () => {
    describe('when using valid data', () => {
      it('should create entity and return 302', async () => {
        const name = 'test task';
        const description = 'test description';
        const { statusCode } = await app.inject({
          method: 'post',
          url: '/tasks',
          headers: { Cookie },
          body: {
            name,
            description,
            statusId: existingStatus.id,
            creatorId: existingUser.id,
            assignedId: null,
            labelIds: existingLabel.id,
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
        const labels = await tasks[0].$relatedQuery('labels');
        expect(labels).toHaveLength(1);
        expect(labels[0]).toMatchObject({
          name: existingLabel.name,
        });
      });
    });

    describe('when using invalid data', () => {
      it.each([
        ['name', () => ({ description: 'test', statusId: existingStatus.id, creatorId: existingUser.id })],
        ['description', () => ({ name: 'test', statusId: existingStatus.id, creatorId: existingUser.id })],
        ['status', () => ({ name: 'test', description: 'test', creatorId: existingUser.id })],
        ['creator', () => ({ name: 'test', description: 'test', statusId: existingStatus.id })],
      ])('should not create entity and return 422 when missing required field %s', async (_, data) => {
        const { statusCode } = await app.inject({
          method: 'post',
          url: '/tasks',
          headers: { Cookie },
          body: data(),
        });
        expect(statusCode).toBe(422);
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

    it('should update entity and return 302 when using valid data', async () => {
      const newLabel = await app.objection.models.label.query().insert({
        name: 'new label',
      });
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
        method: 'patch',
        url: '/tasks',
        headers: { Cookie },
        body: {
          ...updatedTask,
          labelIds: newLabel.id,
        },
      });
      expect(statusCode).toBe(302);
      const tasks = await app.objection.models.task.query();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toMatchObject(updatedTask);
      const labels = await tasks[0].$relatedQuery('labels');
      expect(labels).toHaveLength(1);
      expect(labels[0]).toMatchObject({
        name: newLabel.name,
      });
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
        labelIds: existingLabel.id,
      });
    });
    it('should delete entity and return 302', async () => {
      const { statusCode } = await app.inject({
        method: 'delete',
        url: '/tasks',
        headers: { Cookie },
        body: {
          id: existingTask.id,
        },
      });
      expect(statusCode).toBe(302);
      const tasks = await app.objection.models.task.query();
      expect(tasks).toHaveLength(0);
      const labels = await existingTask.$relatedQuery('labels');
      expect(labels).toHaveLength(0);
      expect(await app.objection.models.label.query()).toHaveLength(1);
    });
  });
});
