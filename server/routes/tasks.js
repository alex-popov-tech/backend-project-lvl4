export default (app) => {
  app
    .get('/task', async (req, reply) => {
      const tasks = await app.objection.models.task.query().withGraphJoined('[status, creator, assigned, labels]');
      await reply.render('task/index', { tasks });
    })
    .get('/task/new', async (req, reply) => {
      const statuses = await app.objection.models.status.query();
      const labels = await app.objection.models.label.query();
      const users = await app.objection.models.user.query();
      await reply.render('task/new', { data: { statuses, users, labels }, errors: [] });
    })
    .get('/task/edit/:id', async (req, reply) => {
      const task = await app.objection.models.task.query().findById(req.params.id);
      const statuses = await app.objection.models.status.query();
      const labels = await app.objection.models.label.query();
      const users = await app.objection.models.user.query();
      await reply.render('task/edit', {
        data: {
          statuses, users, task, labels,
        },
        errors: [],
      });
    })
    .post('/task', async (req, reply) => {
      try {
        await app.objection.models.task.query().insertGraph({
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
        });
        await reply.redirect('/task');
      } catch ({ message, data }) {
        const statuses = await app.objection.models.status.query();
        const users = await app.objection.models.user.query();
        const labels = await app.objection.models.label.query();
        await reply.code(400).render('task/new', {
          data: {
            ...req.body, statuses, users, labels,
          },
          errors: data,
        });
      }
    })
    .put('/task', async (req, reply) => {
      try {
        await app.objection.models.task.query().upsertGraph({
          id: Number(req.body.id),
          name: req.body.name,
          description: req.body.description,
          statusId: Number(req.body.statusId),
          labels: [req.body.labelIds].flat()
            .filter((it) => !!it)
            .map((labelId) => ({ id: Number(labelId) })),
          creatorId: Number(req.body.creatorId),
          assignedId: Number(req.body.assignedId),
        }, { relate: true, unrelate: true });
        await reply.redirect('/task');
      } catch ({ message, data }) {
        console.log(message, JSON.stringify(data));
        const statuses = await app.objection.models.status.query();
        const users = await app.objection.models.user.query();
        await reply.code(400).render('task/edit', { data: { task: req.body, statuses, users }, errors: data });
      }
    })
    .delete('/task', async (req, reply) => {
      await app.objection.models.task.query().deleteById(req.body.id);
      await reply.redirect('/task');
    });
};
