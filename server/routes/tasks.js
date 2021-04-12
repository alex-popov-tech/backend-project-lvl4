const formalizeMultiselectValues = (values) => [values].flat()
  .filter((it) => !!it)
  .map((value) => Number(value));

export default (app) => {
  app
    .get('/tasks', { preValidation: app.formAuth }, async (req, reply) => {
      const statusIds = formalizeMultiselectValues(req.query.statusIds);
      const labelIds = formalizeMultiselectValues(req.query.labelIds);
      const assignedIds = formalizeMultiselectValues(req.query.assignedIds);
      const taskQuery = app.objection.models.task.query().withGraphJoined('[status, creator, assigned, labels]');
      if (statusIds.length) {
        taskQuery.modify('withStatusIn', statusIds);
      }
      if (assignedIds.length) {
        taskQuery.modify('withAssignedIn', assignedIds);
      }
      if (labelIds.length) {
        taskQuery.modify('withLabelIn', labelIds);
      }

      const [filteredTasks, statuses, labels, users] = await Promise.all([
        taskQuery,
        app.objection.models.status.query(),
        app.objection.models.label.query(),
        app.objection.models.user.query(),
      ]);
      await reply.render('tasks/index', {
        data: {
          tasks: filteredTasks, statuses, labels, users,
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
          task, statuses, users, labels,
        },
        errors: {},
      });
    })
    .get('/tasks/edit/:id', { preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id } } = req;
      const [task, statuses, labels, users] = await Promise.all([
        app.objection.models.task.query().findById(id),
        app.objection.models.status.query(),
        app.objection.models.label.query(),
        app.objection.models.user.query(),
      ]);
      await reply.render('tasks/edit', {
        data: {
          statuses, users, task, labels,
        },
        errors: {},
      });
    })
    .post('/tasks', { preValidation: app.formAuth }, async (req, reply) => {
      const {
        body: {
          name, description, statusId, assignedId,
        },
      } = req;
      try {
        const labelIds = formalizeMultiselectValues(req.body.labelIds);
        await app.objection
          .models
          .task
          .transaction((trx) => app.objection.models.task.query(trx).insertGraph({
            name,
            description,
            statusId: Number(statusId),
            labels: labelIds.map((labelId) => ({ id: labelId })),
            creatorId: req.user.id,
            assignedId: Number(assignedId),
          }, {
            relate: true,
          }));
        req.flash('success', app.t('tasks.index.flash.success.new'));
        await reply.redirect('/tasks');
      } catch ({ message, data }) {
        const task = new app.objection.models.task();
        task.$set(req.body);
        const [statuses, labels, users] = await Promise.all([
          app.objection.models.status.query(),
          app.objection.models.label.query(),
          app.objection.models.user.query(),
        ]);
        req.flash('danger', app.t('tasks.new.flash.fail'));
        await reply.code(422).render('tasks/new', {
          data: {
            task, statuses, users, labels,
          },
          errors: data,
        });
      }
    })
    .patch('/tasks/:id', { preValidation: app.formAuth }, async (req, reply) => {
      const {
        params: { id },
        body: {
          name, description, statusId, assignedId,
        },
      } = req;
      try {
        const labelIds = formalizeMultiselectValues(req.body.labelIds);
        await app.objection
          .models
          .task
          .transaction((trx) => app.objection.models.task.query(trx).upsertGraph({
            id: Number(id),
            name,
            description,
            statusId: Number(statusId),
            labels: labelIds.map((labelId) => ({ id: labelId })),
            assignedId: Number(assignedId),
          }, { relate: true, unrelate: true, noDelete: true }));
        req.flash('success', app.t('tasks.index.flash.success.edit'));
        await reply.redirect('/tasks');
      } catch ({ message, data }) {
        const task = new app.objection.models.task();
        task.$set({ id, ...req.body });
        const [statuses, labels, users] = await Promise.all([
          app.objection.models.status.query(),
          app.objection.models.label.query(),
          app.objection.models.user.query(),
        ]);
        req.flash('danger', app.t('tasks.edit.flash.fail'));
        await reply.code(422).render('tasks/edit', {
          data: {
            task, statuses, users, labels,
          },
          errors: data,
        });
      }
    })
    .delete('/tasks/:id', { preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id } } = req;
      await app.objection.models.task.query().deleteById(id);
      req.flash('info', app.t('tasks.index.flash.success.delete'));
      return reply.redirect('/tasks');
    });
};
