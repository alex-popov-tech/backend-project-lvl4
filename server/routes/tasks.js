export default (app) => {
  app
    .get('/tasks', async (req, reply) => {
      const {
        name = '', statusId, creatorId, assignedId, labelIds,
      } = req.query;
      const formalizedLabelIds = [labelIds].flat()
        .filter((it) => !!it)
        .map((labelId) => Number(labelId));
      const [tasks, statuses, labels, users] = await Promise.all([
        await app.objection.models.task.query().skipUndefined()
          .where('tasks.name', 'like', `%${name}%`)
          .where('tasks.status_id', statusId)
          .where('tasks.creator_id', creatorId)
          .where('tasks.assigned_id', assignedId)
          .withGraphJoined('[status, creator, assigned, labels]')
          .then(
            (taskList) => taskList.filter(
              (task) => !formalizedLabelIds.length
            || !!task.labels.find((label) => formalizedLabelIds.includes(label.id)),
            ),
          ),
        app.objection.models.status.query(),
        app.objection.models.label.query(),
        app.objection.models.user.query(),
      ]);
      await reply.render('tasks/index', {
        data: {
          tasks, statuses, labels, users,
        },
      });
    })
    .get('/tasks/new', async (req, reply) => {
      const [statuses, labels, users] = await Promise.all([
        app.objection.models.status.query(),
        app.objection.models.label.query(),
        app.objection.models.user.query(),
      ]);
      await reply.render('tasks/new', {
        data: {
          task: new app.objection.models.task(), statuses, users, labels,
        },
        errors: {},
      });
    })
    .get('/tasks/edit/:id', async (req, reply) => {
      const [task, statuses, labels, users] = await Promise.all([
        app.objection.models.task.query().findById(req.params.id),
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
    .post('/tasks', async (req, reply) => {
      try {
        await app.objection
          .models
          .task
          .transaction((trx) => app.objection.models.task.query(trx).insertGraph({
            name: req.body.name,
            description: req.body.description,
            statusId: Number(req.body.statusId),
            labels: [req.body.labelIds].flat()
              .filter((it) => !!it)
              .map((labelId) => ({ id: Number(labelId) })),
            creatorId: Number(req.body.creatorId),
            assignedId: Number(req.body.assignedId),
          }, {
            relate: true,
          }));
        await reply.redirect('/tasks');
      } catch ({ message, data }) {
        const task = new app.objection.models.task();
        task.$set(req.body);
        const [statuses, labels, users] = await Promise.all([
          app.objection.models.status.query(),
          app.objection.models.label.query(),
          app.objection.models.user.query(),
        ]);
        await reply.code(400).render('tasks/new', {
          data: {
            task, statuses, users, labels,
          },
          errors: data,
        });
      }
    })
    .patch('/tasks', async (req, reply) => {
      try {
        await app.objection
          .models
          .task
          .transaction((trx) => app.objection.models.task.query(trx).upsertGraph({
            id: Number(req.body.id),
            name: req.body.name,
            description: req.body.description,
            statusId: Number(req.body.statusId),
            labels: [req.body.labelIds].flat()
              .filter((it) => !!it)
              .map((labelId) => ({ id: Number(labelId) })),
            creatorId: Number(req.body.creatorId),
            assignedId: Number(req.body.assignedId),
          }, { relate: true, unrelate: true, noDelete: true }));
        await reply.redirect('/tasks');
      } catch ({ message, data }) {
        const task = new app.objection.models.task();
        task.$set(req.body);
        const [statuses, labels, users] = await Promise.all([
          app.objection.models.status.query(),
          app.objection.models.label.query(),
          app.objection.models.user.query(),
        ]);
        await reply.code(400).render('tasks/edit', {
          data: {
            task, statuses, users, labels,
          },
          errors: data,
        });
      }
    })
    .delete('/tasks', async (req, reply) => {
      await app.objection.models.task.query().deleteById(req.body.id);
      await reply.redirect('/tasks');
    });
};
