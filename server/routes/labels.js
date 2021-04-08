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
        // is not working?
        req.flash('success', app.t('labels.index.flash.success.new'));
        await reply.redirect('/labels');
      } catch ({ data }) {
        req.flash('danger', app.t('labels.new.flash.fail'));
        await reply.code(422).render('labels/new', { data: { label: req.body }, errors: data });
      }
    })
    .patch('/labels', async (req, reply) => {
      try {
        const updatedlabel = app.objection.models.label.fromJson(req.body);
        const existinglabel = await app.objection.models.label.query().findById(req.body.id);
        await existinglabel.$query().patch(updatedlabel);
        // is not working?
        req.flash('success', app.t('labels.index.flash.success.edit'));
        await reply.redirect('/labels');
      } catch ({ message, data }) {
        const label = new app.objection.models.label();
        label.$set(req.body);
        req.flash('danger', app.t('labels.edit.flash.fail'));
        await reply.code(422).render('labels/edit', { data: { label }, errors: data });
      }
    })
    .delete('/labels', async (req, reply) => {
      const relatedTasks = await app.objection.models.task.query().withGraphJoined('labels').where('labels.id', req.body.id);
      if (relatedTasks.length > 0) {
        // is not working?
        req.flash('danger', app.t('labels.index.flash.fail.delete'));
        return reply.redirect('/labels');
      }
      await app.objection.models.label.query().deleteById(req.body.id);
      req.flash('success', app.t('labels.index.flash.success.delete'));
      return reply.redirect('/labels');
    });
};
