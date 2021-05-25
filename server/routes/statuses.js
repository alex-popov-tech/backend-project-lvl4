export default (app) => {
  app
    .get('/statuses', { name: 'statuses', preValidation: app.formAuth }, async (req, reply) => {
      const statuses = await app.objection.models.status.query();
      await reply.render('statuses/index', { data: { statuses } });
    })
    .get('/statuses/new', { name: 'newStatus', preValidation: app.formAuth }, async (req, reply) => {
      const status = new app.objection.models.status();
      await reply.render('statuses/new', { data: { status }, errors: {} });
    })
    .post('/statuses', { name: 'createStatus', preValidation: app.formAuth }, async (req, reply) => {
      const { body: { data: reqData } } = req;
      try {
        const newStatus = app.objection.models.status.fromJson(reqData);
        await app.objection.models.status.query().insert(newStatus);
        req.flash('success', app.t('views.index.statuses.flash.success.new'));
        await reply.redirect(app.reverse('statuses'));
      } catch ({ message, data }) {
        const status = new app.objection.models.status();
        status.$set(reqData);
        req.flash('danger', app.t('views.new.statuses.flash.fail'));
        await reply.code(422).render('statuses/new', { data: { status }, errors: data });
      }
    })
    .get('/statuses/:id/edit', { name: 'editStatus', preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id } } = req;
      const status = await app.objection.models.status.query().findById(id);
      await reply.render('statuses/edit', { data: { status }, errors: {} });
    })
    .patch('/statuses/:id', { name: 'updateStatus', preValidation: app.formAuth }, async (req, reply) => {
      const { body: { data: reqData }, params: { id } } = req;
      try {
        const updatedStatus = app.objection.models.status.fromJson(reqData);
        const existingStatus = await app.objection.models.status.query().findById(id);
        await existingStatus.$query().patch(updatedStatus);
        req.flash('info', app.t('views.index.statuses.flash.success.edit'));
        await reply.redirect(app.reverse('statuses'));
      } catch ({ message, data }) {
        const status = new app.objection.models.status();
        status.$set({ id, ...reqData });
        req.flash('danger', app.t('views.edit.statuses.flash.fail'));
        await reply.code(422).render('statuses/edit', { data: { status }, errors: data });
      }
    })
    .delete('/statuses/:id', { name: 'destroyStatus', preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id } } = req;
      const relatedTasksCount = await app.objection.models.task.query().where('statusId', id).resultSize();
      if (relatedTasksCount > 0) {
        const statuses = await app.objection.models.status.query();
        req.flash('danger', app.t('views.index.statuses.flash.fail.delete'));
        return reply.code(422).render('/statuses/index', {
          data: { statuses },
        });
      }
      await app.objection.models.status.query().deleteById(id);
      req.flash('success', app.t('views.index.statuses.flash.success.delete'));
      return reply.redirect(app.reverse('statuses'));
    });
};
