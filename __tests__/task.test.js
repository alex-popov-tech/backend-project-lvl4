import {
  database, getAuthenticatedUser, launchApp, shutdownApp,
} from './helpers';

describe('Task', () => {
  let app;
  let cookies;
  let db;
  let currentUser;
  let existingStatus;
  let existingLabel;
  let existingUser;

  beforeAll(async () => {
    app = await launchApp();
    db = database(app);
  });

  afterAll(async () => {
    await shutdownApp(app);
  });

  beforeEach(async () => {
    await db.clear();
    ({ user: currentUser, cookies } = await getAuthenticatedUser(app));
    existingStatus = await db.insert.status();
    existingLabel = await db.insert.label();
    existingUser = await db.insert.user({
      labelIds: existingLabel.id,
      statusId: existingStatus.id,
    });
  });

  describe('index', () => {
    it('should not be available without authentification', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: '/tasks',
      });
      expect(statusCode).toBe(302);
    });

    it('should be available with authentification', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: '/tasks',
        cookies,
      });
      expect(statusCode).toBe(200);
    });
    it('should return 200 on edit/:id ', async () => {
      const existingTask = await db.insert.task({
        statusId: existingStatus.id,
        creatorId: existingUser.id,
      });
      const { statusCode } = await app.inject({
        method: 'get',
        url: `/tasks/edit/${existingTask.id}`,
        cookies,
      });
      expect(statusCode).toBe(200);
    });
    it('should return 200 when using filters', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: '/tasks',
        cookies,
        query: {
          assignedId: existingUser.id,
          statusIds: existingStatus.id,
          labelIds: existingLabel.id,
        },
      });
      expect(statusCode).toBe(200);
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
          cookies,
          body: {
            name,
            description,
            statusId: existingStatus.id,
            assignedId: null,
            labelIds: existingLabel.id,
          },
        });
        expect(statusCode).toBe(302);

        const tasks = await db.find.tasks();
        expect(tasks).toHaveLength(1);
        expect(tasks[0]).toMatchObject({
          name,
          description,
          statusId: existingStatus.id,
          creatorId: currentUser.id,
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
          cookies,
          body: data(),
        });
        expect(statusCode).toBe(422);
        const tasks = await db.find.tasks();
        expect(tasks).toHaveLength(0);
      });
    });
  });

  describe('update', () => {
    let existingTask;
    beforeEach(async () => {
      existingTask = await db.insert.task({
        statusId: existingStatus.id,
        creatorId: existingUser.id,
      });
    });

    it('should update entity and return 302 when using valid data', async () => {
      const newLabel = await db.insert.label();
      const updatedStatus = await db.insert.status();
      const updatedTask = {
        name: 'updated-name',
        description: 'updated-descr',
        statusId: updatedStatus.id,
        assignedId: existingUser.id,
      };
      const { statusCode } = await app.inject({
        method: 'patch',
        url: `/tasks/${existingTask.id}`,
        cookies,
        body: {
          ...updatedTask,
          labelIds: newLabel.id,
        },
      });
      expect(statusCode).toBe(302);
      const tasks = await db.find.tasks();
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
      existingTask = await db.insert.task({
        statusId: existingStatus.id,
        creatorId: currentUser.id,
        labelIds: existingLabel.id,
      });
    });
    it('should delete entity and return 302', async () => {
      const { statusCode } = await app.inject({
        method: 'delete',
        url: `/tasks/${existingTask.id}`,
        cookies,
      });
      expect(statusCode).toBe(302);
      const tasks = await db.find.tasks();
      expect(tasks).toHaveLength(0);
      const labels = await existingTask.$relatedQuery('labels');
      expect(labels).toHaveLength(0);
      expect(await db.find.labels()).toHaveLength(1);
    });

    it('should not allow to delete other entity and return 422', async () => {
      const { statusCode } = await app.inject({
        method: 'delete',
        url: `/tasks/${existingTask.id}`,
        cookies,
      });
      expect(statusCode).toBe(422);
      const tasks = await app.objection.models.task.query();
      expect(tasks).toHaveLength(1);
    });
  });
});
