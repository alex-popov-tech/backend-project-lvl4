export default (app) => {
  app
    .get('/status', async (req, reply) => {
      const statuses = await app.objection.models.status.query();
      await reply.render('status/index', { data: { currentUser: req.currentUser, statuses } });
    })
    .get('/status/new', async (req, reply) => {
      await reply.render('status/new', { data: { status: { name: '' } }, errors: {} });
    })
    .get('/status/edit/:id', async (req, reply) => {
      const status = await app.objection.models.status.query().findById(req.params.id);
      await reply.render('status/edit', { data: { status }, errors: {} });
    })
    .post('/status', async (req, reply) => {
      try {
        const newStatus = app.objection.models.status.fromJson(req.body);
        await app.objection.models.status.query().insert(newStatus);
        await reply.redirect('/status');
      } catch ({ data }) {
        await reply.code(400).render('status/new', { data: { status: req.body }, errors: data });
      }
    })
    .put('/status', async (req, reply) => {
      try {
        const updatedStatus = app.objection.models.status.fromJson(req.body);
        const existingStatus = await app.objection.models.status.query().findById(req.body.id);
        await existingStatus.$query().patch(updatedStatus);
        await reply.redirect('/status');
      } catch ({ message, data }) {
        await reply.code(400).render('status/edit', { data: { status: req.body }, errors: data });
      }
    })
    .delete('/status', async (req, reply) => {
      await app.objection.models.status.query().deleteById(req.body.id);
      await reply.redirect('/status');
    });
};
