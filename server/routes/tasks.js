export default (app) => {
  app
    .get('/tasks', async (req, reply) => {
      const tasks = await app.objection.models.task.query().withGraphJoined('[status, creator, assigned]');
      await reply.render('tasks/index', { tasks });
    })
    .get('/tasks/new', async (req, reply) => {
      const statuses = await app.objection.models.status.query();
      const users = await app.objection.models.user.query();
      await reply.render('tasks/new', { data: { statuses, users }, errors: [] });
    })
    .get('/tasks/edit/:id', async (req, reply) => {
      const task = await app.objection.models.task.query().findById(req.params.id);
      const statuses = await app.objection.models.status.query();
      const users = await app.objection.models.user.query();
      await reply.render('tasks/edit', { data: { statuses, users, task }, errors: [] });
    })
    .post('/tasks', async (req, reply) => {
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
        await reply.redirect('/tasks');
      } catch ({ message, data }) {
        const statuses = await app.objection.models.status.query();
        const users = await app.objection.models.user.query();
        await reply.code(400).render('tasks/new', { data: { ...req.body, statuses, users }, errors: data });
      }
    })
    .put('/tasks', async (req, reply) => {
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
        await reply.redirect('/tasks');
      } catch ({ message, data }) {
        const statuses = await app.objection.models.status.query();
        const users = await app.objection.models.user.query();
        await reply.code(400).render('tasks/edit', { data: { task: req.body, statuses, users }, errors: data });
      }
    })
    .delete('/tasks', async (req, reply) => {
      await app.objection.models.task.query().deleteById(req.body.id);
      await reply.redirect('/tasks');
    });
};
