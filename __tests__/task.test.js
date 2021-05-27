import _ from 'lodash';
import {
  create, getDatabaseHelpers, createNewAuthenticatedUser, launchApp, shutdownApp,
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
    ({ user: currentUser, cookies } = await createNewAuthenticatedUser(app));
    existingStatus = await db.model.insert.status(create.status());
    existingLabel = await db.model.insert.label(create.label());
  });

  afterEach(async () => {
    await db.clear();
  });

  describe('index', () => {
    it('should not be available without authentification', async () => {
      await db.model.insert.task(create.task({
        creator: currentUser,
        status: existingStatus,
      }));
      const { statusCode, headers: { location } } = await app.inject({
        method: 'get',
        url: app.reverse('tasks'),
      });
      expect(location).toBe(app.reverse('welcome'));
      expect(statusCode).toBe(302);
    });
    it('should render all tasks', async () => {
      await db.model.insert.task(create.task({
        creator: currentUser,
        status: existingStatus,
      }));
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('tasks'),
        cookies,
      });
      expect(statusCode).toBe(200);
    });
    it('should render filtered tasks', async () => {
      await db.model.insert.task(create.task({
        creator: currentUser,
        labels: [existingLabel],
        status: existingStatus,
      }));
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('tasks'),
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

  describe('new', () => {
    it('should not be available without authentification', async () => {
      const { statusCode, headers: { location } } = await app.inject({
        method: 'get',
        url: app.reverse('newTask'),
      });
      expect(location).toBe(app.reverse('welcome'));
      expect(statusCode).toBe(302);
    });
    it('should render page', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('newTask'),
        cookies,
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('create', () => {
    it('should create entity and return 302', async () => {
      const taskData = create.task({
        status: existingStatus,
        executor: currentUser,
        labels: [existingLabel],
      });
      const { statusCode, headers: { location } } = await app.inject({
        method: 'post',
        url: app.reverse('createTask'),
        cookies,
        body: { data: taskData },
      });
      expect(location).toBe(app.reverse('tasks'));
      expect(statusCode).toBe(302);

      const tasks = await db.model.find.tasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toMatchObject({ ..._.omit(taskData, 'labels'), creatorId: currentUser.id });
      const labels = await tasks[0].$relatedQuery('labels');
      expect(labels).toHaveLength(1);
      expect(labels[0]).toMatchObject(existingLabel);
    });
    it.each([
      ['name', () => create.task({ name: '', status: existingStatus, executor: currentUser })],
      ['status', () => create.task({ executor: currentUser })],
      ['executor', () => create.task({ status: existingStatus })],
    ])('should not create entity and return 422 when missing required field %s', async (name, getData) => {
      const { statusCode } = await app.inject({
        method: 'post',
        url: app.reverse('createTask'),
        cookies,
        body: { data: getData() },
      });
      expect(statusCode).toBe(422);
      const tasks = await db.model.find.tasks();
      expect(tasks).toHaveLength(0);
    });
  });

  describe('edit', () => {
    let existingTask;
    beforeEach(async () => {
      existingTask = await db.model.insert.task(create.task({
        status: existingStatus,
        creator: currentUser,
        executor: currentUser,
      }));
    });

    it('should not be available without authentification', async () => {
      await db.model.insert.label(create.label());
      const { statusCode, headers: { location } } = await app.inject({
        method: 'get',
        url: app.reverse('editTask', { id: existingTask.id }),
      });
      expect(location).toBe(app.reverse('welcome'));
      expect(statusCode).toBe(302);
    });
    it('should render task page', async () => {
      const { statusCode } = await app.inject({
        method: 'get',
        url: app.reverse('editTask', { id: existingTask.id }),
        cookies,
      });
      expect(statusCode).toBe(200);
    });
  });

  describe('update', () => {
    let existingTask;
    beforeEach(async () => {
      existingTask = await db.model.insert.task(create.task({
        status: existingStatus,
        creator: currentUser,
        executor: currentUser,
      }));
    });

    it('should update entity and return 302 when using valid data', async () => {
      const newLabel = await db.model.insert.label(create.label());
      const newStatus = await db.model.insert.status(create.status());
      const newUser = await db.model.insert.user(create.user());
      const updatedTaskData = create.task({
        status: newStatus,
        labels: [newLabel],
        executor: newUser,
      });
      const { statusCode, headers: { location } } = await app.inject({
        method: 'patch',
        url: app.reverse('updateTask', { id: existingTask.id }),
        cookies,
        body: { data: updatedTaskData },
      });
      expect(location).toBe(app.reverse('tasks'));
      expect(statusCode).toBe(302);
      const tasks = await db.model.find.tasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toMatchObject({ ..._.omit(updatedTaskData, 'labels'), creatorId: currentUser.id });
      const labels = await tasks[0].$relatedQuery('labels');
      expect(labels).toHaveLength(1);
      expect(labels[0]).toMatchObject({
        name: newLabel.name,
      });
    });
    it.each([
      ['name', () => create.task({ name: '', status: existingStatus, executor: currentUser })],
      ['status', () => create.task({ executor: currentUser })],
    ])('should not update entity and return 422 when missing required field %s', async (name, getData) => {
      const { statusCode } = await app.inject({
        method: 'patch',
        url: app.reverse('updateTask', { id: existingTask.id }),
        cookies,
        body: { data: getData() },
      });
      expect(statusCode).toBe(422);
      const tasks = await db.model.find.tasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toMatchObject(_.omit(existingTask, 'labels'));
    });
  });

  describe('destroy', () => {
    it('should destroy entity and return 302', async () => {
      const [existingTask] = await Promise.all([
        db.model.insert.task(create.task({
          status: existingStatus,
          creator: currentUser,
          labels: [existingLabel],
        })),
        db.model.insert.task(create.task({
          status: existingStatus,
          creator: currentUser,
        })),
      ]);
      const { statusCode, headers: { location } } = await app.inject({
        method: 'delete',
        url: app.reverse('destroyTask', { id: existingTask.id }),
        cookies,
      });
      expect(statusCode).toBe(302);
      expect(location).toBe(app.reverse('tasks'));
      const tasks = await db.model.find.tasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).not.toBe(existingTask.id);
      const labels = await existingTask.$relatedQuery('labels');
      expect(labels).toHaveLength(0);
      expect(await db.model.find.labels()).toHaveLength(1);
    });

    it('should not allow to destroy other entity and return 422', async () => {
      const user = await db.model.insert.user(create.user());
      const existingTask = await db.model.insert.task(create.task({
        status: existingStatus,
        creator: user,
        labels: [existingLabel],
      }));
      const { statusCode } = await app.inject({
        method: 'delete',
        url: app.reverse('destroyTask', { id: existingTask.id }),
        cookies,
      });
      expect(statusCode).toBe(422);
      const tasks = await app.objection.models.task.query();
      expect(tasks).toHaveLength(1);
    });
  });
});
