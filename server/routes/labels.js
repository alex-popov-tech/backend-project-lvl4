export default (app) => {
  app
    .get('/labels', { name: 'labels', preValidation: app.formAuth }, async (req, reply) => {
      const labels = await app.objection.models.label.query();
      await reply.render('labels/index', { data: { labels } });
    })
    .get('/labels/new', { name: 'newLabel', preValidation: app.formAuth }, async (req, reply) => {
      const label = new app.objection.models.label();
      await reply.render('labels/new', { data: { label }, errors: {} });
    })
    .post('/labels', { name: 'createLabel', preValidation: app.formAuth }, async (req, reply) => {
      const { body: { data: reqData } } = req;
      try {
        const newlabel = app.objection.models.label.fromJson(reqData);
        await app.objection.models.label.query().insert(newlabel);
        req.flash('success', app.t('views.index.labels.flash.success.new'));
        await reply.redirect(app.reverse('labels'));
      } catch ({ data }) {
        const label = new app.objection.models.label();
        label.$set(reqData);
        req.flash('danger', app.t('views.new.labels.flash.fail'));
        await reply.code(422).render('labels/new', { data: { label }, errors: data });
      }
    })
    .get('/labels/:id/edit', { name: 'editLabel', preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id } } = req;
      const label = await app.objection.models.label.query().findById(id);
      await reply.render('labels/edit', { data: { label }, errors: {} });
    })
    .patch('/labels/:id', { name: 'updateLabel', preValidation: app.formAuth }, async (req, reply) => {
      const { body: { data: reqData }, params: { id } } = req;
      try {
        const updatedlabel = app.objection.models.label.fromJson(reqData);
        const existinglabel = await app.objection.models.label.query().findById(id);
        await existinglabel.$query().patch(updatedlabel);
        req.flash('success', app.t('views.index.labels.flash.success.edit'));
        await reply.redirect(app.reverse('labels'));
      } catch ({ message, data }) {
        const label = new app.objection.models.label();
        label.$set({ id, ...reqData });
        req.flash('danger', app.t('views.edit.labels.flash.fail'));
        await reply.code(422).render('labels/edit', { data: { label }, errors: data });
      }
    })
    .delete('/labels/:id', { name: 'destroyLabel' }, async (req, reply) => {
      const { params: { id } } = req;
      const relatedTasks = await app.objection.models.task.query().withGraphJoined('labels').where('labels.id', id);
      if (relatedTasks.length > 0) {
        req.flash('danger', app.t('views.index.labels.flash.fail.delete'));
        return reply.redirect(app.reverse('labels'));
      }
      await app.objection.models.label.query().deleteById(id);
      req.flash('success', app.t('views.index.labels.flash.success.delete'));
      return reply.redirect(app.reverse('labels'));
    });
};
