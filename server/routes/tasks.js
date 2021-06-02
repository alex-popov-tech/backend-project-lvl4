import { ValidationError } from 'objection';

const formalizeMultiselectValues = (values) => [values].flat()
  .filter((it) => !!it)
  .map((value) => parseInt(value, 10));

export default (app) => {
  app
    .get('/tasks', { name: 'tasks', preValidation: app.formAuth }, async (req, reply) => {
      const { query: { data = {} } } = req;
      const { isCreatorUser } = data;
      const status = parseInt(data.status, 10);
      const executor = parseInt(data.executor, 10);
      const label = parseInt(data.label, 10);
      const taskQuery = app.objection.models.task.query();

      if (status) {
        taskQuery.modify('withStatus', status);
      }
      if (executor) {
        taskQuery.modify('withExecutor', executor);
      }
      if (isCreatorUser) {
        taskQuery.modify('withCreator', req.user.id);
      }
      taskQuery.withGraphJoined('[status, creator, executor, labels]');
      if (label) {
        taskQuery.modify('withLabel', label);
      }

      const [tasks, statuses, labels, users] = await Promise.all([
        taskQuery,
        app.objection.models.status.query(),
        app.objection.models.label.query(),
        app.objection.models.user.query(),
      ]);
      const task = new app.objection.models.task();
      task.$set({
        status, label, executor, isCreatorUser,
      });
      return reply.render('tasks/index', {
        data: {
          tasks, task, statuses, labels, users,
        },
      });
    })
    .get('/tasks/new', { name: 'newTask', preValidation: app.formAuth }, async (req, reply) => {
      const task = new app.objection.models.task();
      const [statuses, labels, users] = await Promise.all([
        app.objection.models.status.query(),
        app.objection.models.label.query(),
        app.objection.models.user.query(),
      ]);
      return reply.render('tasks/new', {
        data: {
          task, statuses, labels, users,
        },
        errors: {},
      });
    })
    .post('/tasks', { name: 'createTask', preValidation: app.formAuth }, async (req, reply) => {
      const { body: { data } } = req;
      const { name, description } = data;
      const statusId = parseInt(data.statusId, 10);
      const executorId = parseInt(data.executorId, 10);
      const labelIds = formalizeMultiselectValues(data.labels);
      try {
        await app.objection
          .models
          .task
          .transaction((trx) => app.objection.models.task.query(trx).insertGraph({
            name,
            description,
            statusId,
            labels: labelIds.map((it) => ({ id: it })),
            creatorId: req.user.id,
            executorId,
          }, {
            relate: true,
          }));
        req.flash('success', app.t('views.index.tasks.flash.success.new'));
        return reply.redirect(app.reverse('tasks'));
      } catch (error) {
        if (error instanceof ValidationError) {
          const task = new app.objection.models.task();
          const [statuses, labels, users] = await Promise.all([
            app.objection.models.status.query(),
            app.objection.models.label.query(),
            app.objection.models.user.query(),
          ]);
          task.$set({
            name, description, statusId, executorId, labels: labelIds,
          });
          req.flash('danger', app.t('views.new.tasks.flash.fail'));
          return reply.code(422).render('tasks/new', {
            data: {
              task, statuses, labels, users,
            },
            errors: error.data,
          });
        }
        throw error;
      }
    })
    .get('/tasks/:id/edit', { name: 'editTask', preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id } } = req;
      const [task, statuses, labels, users] = await Promise.all([
        app.objection.models.task.query().findById(id).withGraphJoined('[labels]'),
        app.objection.models.status.query(),
        app.objection.models.label.query(),
        app.objection.models.user.query(),
      ]);
      task.$set({ labels: task.labels.map((label) => label.id) });
      return reply.render('tasks/edit', {
        data: {
          task, statuses, labels, users,
        },
        errors: {},
      });
    })
    .patch('/tasks/:id', { name: 'updateTask', preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id }, body: { data } } = req;
      const { name, description } = data;
      const statusId = parseInt(data.statusId, 10);
      const executorId = parseInt(data.executorId, 10);
      const labelIds = formalizeMultiselectValues(data.labels);
      try {
        await app.objection
          .models
          .task
          .transaction((trx) => app.objection.models.task.query(trx).upsertGraph({
            id: parseInt(id, 10),
            name,
            description,
            statusId,
            labels: labelIds.map((labelId) => ({ id: labelId })),
            executorId,
          }, { relate: true, unrelate: true, noDelete: true }));
        req.flash('success', app.t('views.index.tasks.flash.success.edit'));
        return reply.redirect(app.reverse('tasks'));
      } catch (error) {
        if (error instanceof ValidationError) {
          const [task, statuses, labels, users] = await Promise.all([
            app.objection.models.task.query().findById(id),
            app.objection.models.status.query(),
            app.objection.models.label.query(),
            app.objection.models.user.query(),
          ]);
          task.$set({
            name, description, statusId, executorId, labels: labelIds,
          });
          req.flash('danger', app.t('views.new.tasks.flash.fail'));
          return reply.code(422).render('tasks/edit', {
            data: {
              task, statuses, labels, users,
            },
            errors: error.data,
          });
        }
        throw error;
      }
    })
    .delete('/tasks/:id', { name: 'destroyTask', preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id } } = req;
      try {
        const task = await app.objection.models.task.query().findById(id);
        if (req.user.id !== task.creatorId) {
          const [tasks, statuses, labels, users] = await Promise.all([
            app.objection.models.task.query().withGraphJoined('[status, creator, executor, labels]'),
            app.objection.models.status.query(),
            app.objection.models.label.query(),
            app.objection.models.user.query(),
          ]);
          req.flash('danger', app.t('views.index.tasks.flash.fail.delete'));
          return reply.code(422).render('tasks/index', {
            data: {
              tasks, statuses, labels, users,
            },
          });
        }
        await task.$relatedQuery('labels').unrelate();
        await app.objection.models.task.query().deleteById(id);
        req.flash('info', app.t('views.index.tasks.flash.success.delete'));
        return reply.redirect(app.reverse('tasks'));
      } catch (error) {
          const [tasks, statuses, labels, users] = await Promise.all([
            app.objection.models.task.query().withGraphJoined('[status, creator, executor, labels]'),
            app.objection.models.status.query(),
            app.objection.models.label.query(),
            app.objection.models.user.query(),
          ]);
          req.flash('danger', app.t('views.index.tasks.flash.fail.delete'));
          return reply.code(422).render('tasks/index', {
            data: {
              tasks, statuses, labels, users,
            },
          });
      }
    });
};
