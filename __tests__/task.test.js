import {
  create, getDatabaseHelpers, getAuthenticatedUser, launchApp, shutdownApp,
} from './helpers';

describe('Task', () => {
  let app;
  let cookies;
  let db;
  let currentUser;
  let existingStatus;
  let existingLabel;

  beforeAll(async () => {
    app = await launchApp();
    db = getDatabaseHelpers(app);
  });

  afterAll(async () => {
    await shutdownApp(app);
  });

  beforeEach(async () => {
    ({ user: currentUser, cookies } = await getAuthenticatedUser(app));
    existingStatus = await db.insert.status(create.status());
    existingLabel = await db.insert.label(create.label());
  });

  afterEach(async () => {
    await db.clear();
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

    it('should return 200 on :id/edit', async () => {
      const existingTask = await db.insert.task(create.task({
        creator: currentUser,
        labels: [existingLabel],
        status: existingStatus,
      }));
      const { statusCode } = await app.inject({
        method: 'get',
        url: `/tasks/${existingTask.id}/edit`,
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
          executorId: currentUser.id,
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
        const taskData = create.task({
          status: existingStatus,
          executor: currentUser,
          labels: [existingLabel],
        });
        const { statusCode } = await app.inject({
          method: 'post',
          url: '/tasks',
          cookies,
          body: { data: taskData },
        });
        expect(statusCode).toBe(302);

        const tasks = await db.find.tasks();
        expect(tasks).toHaveLength(1);
        expect(tasks[0]).toMatchObject({
          name: taskData.name,
          description: taskData.description,
          creatorId: currentUser.id,
          statusId: taskData.statusId,
          executorId: taskData.executorId,
        });
        const labels = await tasks[0].$relatedQuery('labels');
        expect(labels).toHaveLength(1);
        expect(labels[0]).toMatchObject({
          name: existingLabel.name,
        });
      });
    });

    describe('when using invalid data', () => {
      // TODO add executors
      it.each([
        ['name', () => create.task({ name: '', status: existingStatus, executor: currentUser })],
        ['status', () => create.task({ executor: currentUser })],
        ['executor', () => create.task({ status: existingStatus })],
      ])('should not create entity and return 422 when missing required field %s', async (_, data) => {
        const { statusCode } = await app.inject({
          method: 'post',
          url: '/tasks',
          cookies,
          body: { data: data() },
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
      existingTask = await db.insert.task(create.task({
        status: existingStatus,
        creator: currentUser,
        executor: currentUser,
      }));
    });

    it('should update entity and return 302 when using valid data', async () => {
      const newLabel = await db.insert.label(create.label());
      const newStatus = await db.insert.status(create.status());
      const newUser = await db.insert.user(create.user());
      const updatedTaskData = create.task({
        status: newStatus,
        labels: [newLabel],
        executor: newUser,
      });
      const { statusCode } = await app.inject({
        method: 'patch',
        url: `/tasks/${existingTask.id}`,
        cookies,
        body: { data: updatedTaskData },
      });
      expect(statusCode).toBe(302);
      const tasks = await db.find.tasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toMatchObject({
        name: updatedTaskData.name,
        description: updatedTaskData.description,
        statusId: updatedTaskData.statusId,
        executorId: updatedTaskData.executorId,
      });
      const labels = await tasks[0].$relatedQuery('labels');
      expect(labels).toHaveLength(1);
      expect(labels[0]).toMatchObject({
        name: newLabel.name,
      });
    });
  });

  describe('delete', () => {
    it('should delete entity and return 302', async () => {
      const existingTask = await db.insert.task(create.task({
        status: existingStatus,
        creator: currentUser,
        labels: [existingLabel],
      }));
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
      const user = await db.insert.user(create.user());
      const existingTask = await db.insert.task(create.task({
        status: existingStatus,
        creator: user,
        labels: [existingLabel],
      }));
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
