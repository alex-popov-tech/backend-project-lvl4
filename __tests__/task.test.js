import {
  create, getDatabase, getAuthenticatedUser, launchApp, shutdownApp,
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
    db = getDatabase(app);
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

    it('should return 200 on edit/:id ', async () => {
      const existingTask = await db.insert.task(create.task({
        creatorId: currentUser.id,
        labelIds: existingLabel.id,
        statusId: existingStatus.id,
      }));
      const { statusCode } = await app.inject({
        method: 'get',
        url: `/tasks/edit/${existingTask.id}`,
        cookies,
      });
      expect(statusCode).toBe(200);
    });

    it('should return 200 when using filters', async () => {
      const existingTask = await db.insert.task(create.task({
        creatorId: currentUser.id,
        labelIds: existingLabel.id,
        statusId: existingStatus.id,
      }));
      const { statusCode } = await app.inject({
        method: 'get',
        url: '/tasks',
        cookies,
        query: {
          assignedId: existingTask.id,
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
          creatorId: currentUser.id,
          statusId: existingStatus.id,
          assignedId: currentUser.id,
          labelIds: existingLabel.id,
        });
        const { statusCode } = await app.inject({
          method: 'post',
          url: '/tasks',
          cookies,
          body: taskData,
        });
        expect(statusCode).toBe(302);

        const tasks = await db.find.tasks();
        expect(tasks).toHaveLength(1);
        expect(tasks[0]).toMatchObject({
          name: taskData.name,
          description: taskData.description,
          creatorId: taskData.creatorId,
          assignedId: taskData.creatorId,
          statusId: taskData.statusId,
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
        ['name', () => ({ description: 'test', statusId: existingStatus.id, creatorId: currentUser.id })],
        ['description', () => ({ name: 'test', statusId: existingStatus.id, creatorId: currentUser.id })],
        ['status', () => ({ name: 'test', description: 'test', creatorId: currentUser.id })],
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
      existingTask = await db.insert.task(create.task({
        statusId: existingStatus.id,
        creatorId: currentUser.id,
        assignedId: currentUser.id,
      }));
    });

    it('should update entity and return 302 when using valid data', async () => {
      const newLabel = await db.insert.label(create.label());
      const newStatus = await db.insert.status(create.status());
      const newUser = await db.insert.user(create.user());
      const updatedTaskData = create.task({
        statusId: newStatus.id,
        labelIds: newLabel.id,
        assignedId: newUser.id,
      });
      const { statusCode } = await app.inject({
        method: 'patch',
        url: `/tasks/${existingTask.id}`,
        cookies,
        body: updatedTaskData,
      });
      expect(statusCode).toBe(302);
      const tasks = await db.find.tasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toMatchObject({
        name: updatedTaskData.name,
        description: updatedTaskData.description,
        statusId: updatedTaskData.statusId,
        assignedId: updatedTaskData.assignedId,
      });
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
      existingTask = await db.insert.task(create.task({
        statusId: existingStatus.id,
        creatorId: currentUser.id,
        labelIds: existingLabel.id,
      }));
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
