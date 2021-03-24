export default (app) => {
  app
    .get('/tasks', async (req, reply) => {
      const tasks = await app.objection.models.task.query().withGraphJoined('[status, creator, assigned, labels]');
      await reply.render('tasks/index', { data: { tasks } });
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
        const task = new app.objection.models.task()
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
        const task = new app.objection.models.task()
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
