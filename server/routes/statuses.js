export default (app) => {
  app
    .get('/statuses', async (req, reply) => {
      const statuses = await app.objection.models.status.query();
      await reply.render('statuses/index', { data: { statuses } });
    })
    .get('/statuses/new', async (req, reply) => {
      const status = new app.objection.models.status();
      await reply.render('statuses/new', { data: { status }, errors: {} });
    })
    .get('/statuses/edit/:id', async (req, reply) => {
      const status = await app.objection.models.status.query().findById(req.params.id);
      await reply.render('statuses/edit', { data: { status }, errors: {} });
    })
    .post('/statuses', async (req, reply) => {
      try {
        const newStatus = app.objection.models.status.fromJson(req.body);
        await app.objection.models.status.query().insert(newStatus);
        await reply.redirect('/statuses');
      } catch ({ data }) {
        const status = new app.objection.models.status();
        status.$set(req.body);
        await reply.code(400).render('statuses/new', { data: { status }, errors: data });
      }
    })
    .patch('/statuses', async (req, reply) => {
      try {
        const updatedStatus = app.objection.models.status.fromJson(req.body);
        const existingStatus = await app.objection.models.status.query().findById(req.body.id);
        await existingStatus.$query().patch(updatedStatus);
        await reply.redirect('/statuses');
      } catch ({ message, data }) {
        const status = new app.objection.models.status();
        status.$set(req.body);
        await reply.code(400).render('statuses/edit', { data: { status }, errors: data });
      }
    })
    .delete('/statuses', async (req, reply) => {
      const relatedTasksCount = await app.objection.models.task.query().where('statusId', req.body.id).resultSize();
      if (relatedTasksCount > 0) {
        const statuses = await app.objection.models.status.query();
        statuses.find((it) => it.id === Number(req.body.id)).error = 'Status is used';
        await reply.code(404).render('/statuses/index', {
          data: { statuses },
        });
        return;
      }
      await app.objection.models.status.query().deleteById(req.body.id);
      await reply.redirect('/statuses');
    });
};
