export default (app) => {
  app
    .get('/status', async (req, reply) => {
      const statuses = await app.objection.models.status.query();
      await reply.render('status/index', { currentUser: req.currentUser, statuses });
    })
    .get('/status/new', async (req, reply) => {
      await reply.render('status/new', { data: {}, errors: [] });
    })
    .get('/status/edit/:id', async (req, reply) => {
      const status = await app.objection.models.status.query().findById(req.params.id);
      await reply.render('status/edit', { status, errors: [] });
    })
    .post('/status', async (req, reply) => {
      try {
        const newStatus = await app.objection.models.status.fromJson(req.body);
        await app.objection.models.status.query().insert(newStatus);
        await reply.redirect('/status');
      } catch ({ data }) {
        await reply.code(400).render('status/new', { data: req.body, errors: data });
      }
    })
    .put('/status', async (req, reply) => {
      try {
        const { id, name } = req.body;
        const updatedStatus = await app.objection.models.status.fromJson({ name });
        const existingStatus = await app.objection.models.status.query().findById(id);
        await existingStatus.$query().patch(updatedStatus);
        await reply.redirect('/status');
      } catch ({ message, data }) {
        await reply.code(400).render('status/edit', { status: req.body, errors: data });
      }
    })
    .delete('/status', async (req, reply) => {
      const { id } = req.body;
      await app.objection.models.status.query().deleteById(id);
      await reply.redirect('/status');
    });
};
