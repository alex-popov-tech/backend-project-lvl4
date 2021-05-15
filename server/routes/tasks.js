const formalizeMultiselectValues = (values) => [values].flat()
  .filter((it) => !!it)
  .map((value) => Number(value));

export default (app) => {
  app
    .get('/tasks', { preValidation: app.formAuth }, async (req, reply) => {
      const { query: { data = {} } } = req;
      const { isCreatorUser } = data;
      const status = parseInt(data.status, 10);
      const executor = parseInt(data.executor, 10);
      const label = parseInt(data.label, 10);
      const taskQuery = app.objection.models.task.query();

      if (status) {
        taskQuery.where('statusId', status);
      }
      if (executor) {
        taskQuery.where('executorId', executor);
      }
      if (isCreatorUser) {
        taskQuery.where('creatorId', req.user.id);
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
      await reply.render('tasks/index', {
        data: {
          tasks, task, statuses, labels, users,
        },
      });
    })
    .get('/tasks/new', { preValidation: app.formAuth }, async (req, reply) => {
      const task = new app.objection.models.task();
      const [statuses, labels, users] = await Promise.all([
        app.objection.models.status.query(),
        app.objection.models.label.query(),
        app.objection.models.user.query(),
      ]);
      await reply.render('tasks/new', {
        data: {
          task, statuses, labels, users,
        },
        errors: {},
      });
    })
    .get('/tasks/:id/edit', { preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id } } = req;
      const [task, statuses, labels, users] = await Promise.all([
        app.objection.models.task.query().findById(id).withGraphJoined('[labels]'),
        app.objection.models.status.query(),
        app.objection.models.label.query(),
        app.objection.models.user.query(),
      ]);
      task.$set({ labels: task.labels.map((label) => label.id) });
      await reply.render('tasks/edit', {
        data: {
          task, statuses, labels, users,
        },
        errors: {},
      });
    })
    .post('/tasks', { preValidation: app.formAuth }, async (req, reply) => {
      const { body: { data } } = req;
      const { name, description } = data;
      const statusId = Number(data.statusId);
      const executorId = Number(data.executorId);
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
        await reply.redirect('/tasks');
      } catch ({ message, data: errors }) {
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
        await reply.code(422).render('tasks/new', {
          data: {
            task, statuses, labels, users,
          },
          errors,
        });
      }
    })
    .patch('/tasks/:id', { preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id }, body: { data } } = req;
      const { name, description } = data;
      const statusId = Number(data.statusId);
      const executorId = Number(data.executorId);
      const labelIds = formalizeMultiselectValues(data.labels);
      try {
        await app.objection
          .models
          .task
          .transaction((trx) => app.objection.models.task.query(trx).upsertGraph({
            id: Number(id),
            name,
            description,
            statusId,
            labels: labelIds.map((labelId) => ({ id: labelId })),
            executorId,
          }, { relate: true, unrelate: true, noDelete: true }));
        req.flash('success', app.t('views.index.tasks.flash.success.edit'));
        await reply.redirect('/tasks');
      } catch ({ message, data: errors }) {
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
        await reply.code(422).render('tasks/edit', {
          data: {
            task, statuses, labels, users,
          },
          errors,
        });
      }
    })
    .delete('/tasks/:id', { preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id } } = req;
      try {
        const task = await app.objection.models.task.query().findById(id);
        if (req.user.id !== task.creatorId) {
          const [tasks, statuses, labels, users] = await Promise.all([
            app.objection.models.task.query().withGraphJoined('[status, creator, assigned, labels]'),
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
        await app.objection.models.task.query().deleteById(id);
        req.flash('info', app.t('views.index.tasks.flash.success.delete'));
        return reply.redirect('/tasks');
      } catch ({ message, errors }) {
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
