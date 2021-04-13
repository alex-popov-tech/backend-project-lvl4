export default (app) => {
  app
    .get('/labels', { preValidation: app.formAuth }, async (req, reply) => {
      const labels = await app.objection.models.label.query();
      await reply.render('labels/index', { data: { labels } });
    })
    .get('/labels/new', { preValidation: app.formAuth }, async (req, reply) => {
      const label = new app.objection.models.label();
      await reply.render('labels/new', { data: { label }, errors: {} });
    })
    .get('/labels/edit/:id', { preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id } } = req;
      const label = await app.objection.models.label.query().findById(id);
      await reply.render('labels/edit', { data: { label }, errors: {} });
    })
    .post('/labels', { preValidation: app.formAuth }, async (req, reply) => {
      const { body } = req;
      try {
        const newlabel = app.objection.models.label.fromJson(req.body);
        await app.objection.models.label.query().insert(newlabel);
        req.flash('success', app.t('labels.index.flash.success.new'));
        await reply.redirect('/labels');
      } catch ({ data }) {
        const label = new app.objection.models.label();
        label.$set(body);
        req.flash('danger', app.t('labels.new.flash.fail'));
        await reply.code(422).render('labels/new', { data: { label }, errors: data });
      }
    })
    .patch('/labels/:id', { preValidation: app.formAuth }, async (req, reply) => {
      const { body, params: { id } } = req;
      try {
        const updatedlabel = app.objection.models.label.fromJson(body);
        const existinglabel = await app.objection.models.label.query().findById(id);
        await existinglabel.$query().patch(updatedlabel);
        req.flash('success', app.t('labels.index.flash.success.edit'));
        await reply.redirect('/labels');
      } catch ({ message, data }) {
        const label = new app.objection.models.label();
        label.$set(body);
        req.flash('danger', app.t('labels.edit.flash.fail'));
        await reply.code(422).render('labels/edit', { data: { label }, errors: data });
      }
    })
    .delete('/labels/:id', async (req, reply) => {
      const { params: { id } } = req;
      const relatedTasks = await app.objection.models.task.query().withGraphJoined('labels').where('labels.id', id);
      if (relatedTasks.length > 0) {
        req.flash('danger', app.t('labels.index.flash.fail.delete'));
        return reply.redirect('/labels');
      }
      await app.objection.models.label.query().deleteById(id);
      req.flash('success', app.t('labels.index.flash.success.delete'));
      return reply.redirect('/labels');
    });
};
