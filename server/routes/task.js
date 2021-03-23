export default (app) => {
  app
    .get('/task', async (req, reply) => {
      const tasks = await app.objection.models.task.query().withGraphJoined('[status, creator, assigned, labels]');
      await reply.render('task/index', { data: { tasks } });
    })
    .get('/task/new', async (req, reply) => {
      const [statuses, labels, users] = await Promise.all([
        app.objection.models.status.query(),
        app.objection.models.label.query(),
        app.objection.models.user.query(),
      ]);
      await reply.render('task/new', {
        data: {
          task: {}, statuses, users, labels,
        },
        errors: {},
      });
    })
    .get('/task/edit/:id', async (req, reply) => {
      const task = await app.objection.models.task.query().findById(req.params.id);
      const [statuses, labels, users] = await Promise.all([
        app.objection.models.status.query(),
        app.objection.models.label.query(),
        app.objection.models.user.query(),
      ]);
      await reply.render('task/edit', {
        data: {
          statuses, users, task, labels,
        },
        errors: {},
      });
    })
    .post('/task', async (req, reply) => {
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
        await reply.redirect('/task');
      } catch ({ message, data }) {
        const [statuses, labels, users] = await Promise.all([
          app.objection.models.status.query(),
          app.objection.models.label.query(),
          app.objection.models.user.query(),
        ]);
        await reply.code(400).render('task/new', {
          data: {
            task: req.body, statuses, users, labels,
          },
          errors: data,
        });
      }
    })
    .put('/task', async (req, reply) => {
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
        await reply.redirect('/task');
      } catch ({ message, data }) {
        const [statuses, labels, users] = await Promise.all([
          app.objection.models.status.query(),
          app.objection.models.label.query(),
          app.objection.models.user.query(),
        ]);
        await reply.code(400).render('task/edit', {
          data: {
            task: req.body, statuses, users, labels,
          },
          errors: data,
        });
      }
    })
    .delete('/task', async (req, reply) => {
      await app.objection.models.task.query().deleteById(req.body.id);
      await reply.redirect('/task');
    });
};
