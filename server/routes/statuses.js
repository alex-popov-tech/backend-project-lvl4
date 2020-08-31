export default (app) => {
  app
    .get('/statuses', async (req, reply) => {
      const statuses = await app.objection.models.status.query();
      await reply.render('statuses/index', { currentUser: req.currentUser, statuses });
    })
    .get('/statuses/new', async (req, reply) => {
      await reply.render('statuses/new', { data: {}, errors: [] });
    })
    .get('/statuses/edit/:id', async (req, reply) => {
      const status = await app.objection.models.status.query().findById(req.params.id);
      await reply.render('statuses/edit', { status, errors: [] });
    })
    .post('/statuses', async (req, reply) => {
      try {
        const newStatus = await app.objection.models.status.fromJson(req.body);
        await app.objection.models.status.query().insert(newStatus);
        await reply.redirect('/statuses');
      } catch ({ data }) {
        await reply.code(400).render('statuses/new', { data: req.body, errors: data });
      }
    })
    .put('/statuses', async (req, reply) => {
      try {
        const { id, name } = req.body;
        const updatedStatus = await app.objection.models.status.fromJson({ name });
        const existingStatus = await app.objection.models.status.query().findById(id);
        await existingStatus.$query().patch(updatedStatus);
        await reply.redirect('/statuses');
      } catch ({ message, data }) {
        await reply.code(400).render('statuses/edit', { status: req.body, errors: data });
      }
    })
    .delete('/statuses', async (req, reply) => {
      const { id } = req.body;
      await app.objection.models.status.query().deleteById(id);
      await reply.redirect('/statuses');
    });
};
