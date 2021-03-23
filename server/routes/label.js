export default (app) => {
  app
    .get('/label', async (req, reply) => {
      const labels = await app.objection.models.label.query();
      await reply.render('label/index', { data: { currentUser: req.currentUser, labels } });
    })
    .get('/label/new', async (req, reply) => {
      await reply.render('label/new', { data: { label: {} }, errors: { } });
    })
    .get('/label/edit/:id', async (req, reply) => {
      const label = await app.objection.models.label.query().findById(req.params.id);
      await reply.render('label/edit', { data: { label }, errors: {} });
    })
    .post('/label', async (req, reply) => {
      try {
        const newlabel = app.objection.models.label.fromJson(req.body);
        await app.objection.models.label.query().insert(newlabel);
        await reply.redirect('/label');
      } catch ({ data }) {
        console.log(data);
        await reply.code(400).render('label/new', { data: { label: req.body }, errors: data });
      }
    })
    .put('/label', async (req, reply) => {
      try {
        const updatedlabel = app.objection.models.label.fromJson(req.body);
        const existinglabel = await app.objection.models.label.query().findById(req.body.id);
        await existinglabel.$query().patch(updatedlabel);
        await reply.redirect('/label');
      } catch ({ message, data }) {
        await reply.code(400).render('label/edit', { data: { label: req.body }, errors: data });
      }
    })
    .delete('/label', async (req, reply) => {
      await app.objection.models.label.query().deleteById(req.body.id);
      await reply.redirect('/label');
    });
};
