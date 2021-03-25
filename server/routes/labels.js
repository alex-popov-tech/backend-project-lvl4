export default (app) => {
  app
    .get('/labels', async (req, reply) => {
      const labels = await app.objection.models.label.query();
      await reply.render('labels/index', { data: { currentUser: req.currentUser, labels } });
    })
    .get('/labels/new', async (req, reply) => {
      await reply.render('labels/new', { data: { label: {} }, errors: { } });
    })
    .get('/labels/edit/:id', async (req, reply) => {
      const label = await app.objection.models.label.query().findById(req.params.id);
      await reply.render('labels/edit', { data: { label }, errors: {} });
    })
    .post('/labels', async (req, reply) => {
      try {
        const newlabel = app.objection.models.label.fromJson(req.body);
        await app.objection.models.label.query().insert(newlabel);
        await reply.redirect('/labels');
      } catch ({ data }) {
        await reply.code(400).render('labels/new', { data: { label: req.body }, errors: data });
      }
    })
    .patch('/labels', async (req, reply) => {
      try {
        const updatedlabel = app.objection.models.label.fromJson(req.body);
        const existinglabel = await app.objection.models.label.query().findById(req.body.id);
        await existinglabel.$query().patch(updatedlabel);
        await reply.redirect('/labels');
      } catch ({ message, data }) {
        const label = new app.objection.models.label();
        label.$set(req.body);
        await reply.code(400).render('labels/edit', { data: { label }, errors: data });
      }
    })
    .delete('/labels', async (req, reply) => {
      await app.objection.models.label.query().deleteById(req.body.id);
      await reply.redirect('/labels');
    });
};
