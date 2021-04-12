export default (app) => {
  app
    .get('/statuses', { preValidation: app.formAuth }, async (req, reply) => {
      const statuses = await app.objection.models.status.query();
      await reply.render('statuses/index', { data: { statuses } });
    })
    .get('/statuses/new', { preValidation: app.formAuth }, async (req, reply) => {
      const status = new app.objection.models.status();
      await reply.render('statuses/new', { data: { status }, errors: {} });
    })
    .get('/statuses/edit/:id', { preValidation: app.formAuth }, async (req, reply) => {
      const status = await app.objection.models.status.query().findById(req.params.id);
      await reply.render('statuses/edit', { data: { status }, errors: {} });
    })
    .post('/statuses', { preValidation: app.formAuth }, async (req, reply) => {
      try {
        const newStatus = app.objection.models.status.fromJson(req.body);
        await app.objection.models.status.query().insert(newStatus);
        req.flash('success', app.t('statuses.index.flash.success.new'));
        await reply.redirect('/statuses');
      } catch ({ data }) {
        const status = new app.objection.models.status();
        status.$set(req.body);
        req.flash('danger', app.t('statuses.new.flash.fail'));
        await reply.code(422).render('statuses/new', { data: { status }, errors: data });
      }
    })
    .patch('/statuses/:id', { preValidation: app.formAuth }, async (req, reply) => {
      try {
        const updatedStatus = app.objection.models.status.fromJson(req.body);
        const existingStatus = await app.objection.models.status.query().findById(req.params.id);
        await existingStatus.$query().patch(updatedStatus);
        req.flash('info', app.t('statuses.index.flash.success.edit'));
        await reply.redirect('/statuses');
      } catch ({ message, data }) {
        const status = new app.objection.models.status();
        status.$set(req.body);
        req.flash('danger', app.t('statuses.edit.flash.fail'));
        await reply.code(422).render('statuses/edit', { data: { status }, errors: data });
      }
    })
    .delete('/statuses/:id', { preValidation: app.formAuth }, async (req, reply) => {
      const relatedTasksCount = await app.objection.models.task.query().where('statusId', req.params.id).resultSize();
      if (relatedTasksCount > 0) {
        const statuses = await app.objection.models.status.query();
        req.flash('danger', app.t('statuses.index.flash.fail.delete'));
        return reply.code(422).render('/statuses/index', {
          data: { statuses },
        });
      }
      await app.objection.models.status.query().deleteById(req.params.id);
      req.flash('success', app.t('statuses.index.flash.success.delete'));
      return reply.redirect('/statuses');
    });
};
