export default (app) => {
  app
    .get('/task', async (req, reply) => {
      const tasks = await app.objection.models.task.query().withGraphJoined('[status, creator, assigned]');
      await reply.render('task/index', { tasks });
    })
    .get('/task/new', async (req, reply) => {
      const statuses = await app.objection.models.status.query();
      const users = await app.objection.models.user.query();
      await reply.render('task/new', { data: { statuses, users }, errors: [] });
    })
    .get('/task/edit/:id', async (req, reply) => {
      const task = await app.objection.models.task.query().findById(req.params.id);
      const statuses = await app.objection.models.status.query();
      const users = await app.objection.models.user.query();
      await reply.render('task/edit', { data: { statuses, users, task }, errors: [] });
    })
    .post('/task', async (req, reply) => {
      try {
        const { name, description } = req.body;
        const statusId = Number(req.body.status_id);
        const creatorId = Number(req.body.creator_id);
        const assignedId = Number(req.body.assigned_id);
        const newTask = await app.objection.models.task.fromJson({
          name,
          description,
          status_id: statusId,
          creator_id: creatorId,
          assigned_id: assignedId,
        });
        await app.objection.models.task.query().insert(newTask);
        await reply.redirect('/task');
      } catch ({ message, data }) {
        const statuses = await app.objection.models.status.query();
        const users = await app.objection.models.user.query();
        await reply.code(400).render('task/new', { data: { ...req.body, statuses, users }, errors: data });
      }
    })
    .put('/task', async (req, reply) => {
      try {
        const { name, description } = req.body;
        const statusId = Number(req.body.status_id);
        const creatorId = Number(req.body.creator_id);
        const assignedId = Number(req.body.assigned_id);
        const updatedTask = await app.objection.models.task.fromJson({
          name,
          description,
          status_id: statusId,
          creator_id: creatorId,
          assigned_id: assignedId,
        });
        const existingtask = await app.objection.models.task.query().findById(req.body.id);
        await existingtask.$query().patch(updatedTask);
        await reply.redirect('/task');
      } catch ({ message, data }) {
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
