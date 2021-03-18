export default (app) => {
  app
    .get('/label', async (req, reply) => {
      const labeles = await app.objection.models.label.query();
      await reply.render('label/index', { currentUser: req.currentUser, labeles });
    })
    .get('/label/new', async (req, reply) => {
      await reply.render('label/new', { data: {}, errors: [] });
    })
    .get('/label/edit/:id', async (req, reply) => {
      const label = await app.objection.models.label.query().findById(req.params.id);
      await reply.render('label/edit', { label, errors: [] });
    })
    .post('/label', async (req, reply) => {
      try {
        const newlabel = await app.objection.models.label.fromJson(req.body);
        await app.objection.models.label.query().insert(newlabel);
        await reply.redirect('/label');
      } catch ({ data }) {
        await reply.code(400).render('label/new', { data: req.body, errors: data });
      }
    })
    .put('/label', async (req, reply) => {
      try {
        const { id, name } = req.body;
        const updatedlabel = await app.objection.models.label.fromJson({ name });
        const existinglabel = await app.objection.models.label.query().findById(id);
        await existinglabel.$query().patch(updatedlabel);
        await reply.redirect('/label');
      } catch ({ message, data }) {
        await reply.code(400).render('label/edit', { label: req.body, errors: data });
      }
    })
    .delete('/label', async (req, reply) => {
      const { id } = req.body;
      await app.objection.models.label.query().deleteById(id);
      await reply.redirect('/label');
    });
};
