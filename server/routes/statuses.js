import { ValidationError } from 'objection';

export default (app) => {
  app
    .get('/statuses', { name: 'statuses', preValidation: app.formAuth }, async (req, reply) => {
      const statuses = await app.objection.models.status.query();
      return reply.render('statuses/index', { data: { statuses } });
    })
    .get('/statuses/new', { name: 'newStatus', preValidation: app.formAuth }, async (req, reply) => {
      const status = new app.objection.models.status();
      return reply.render('statuses/new', { data: { status }, errors: {} });
    })
    .post('/statuses', { name: 'createStatus', preValidation: app.formAuth }, async (req, reply) => {
      const { body: { data: reqData } } = req;
      try {
        const newStatus = app.objection.models.status.fromJson(reqData);
        await app.objection.models.status.query().insert(newStatus);
        req.flash('success', app.t('views.index.statuses.flash.success.new'));
        return reply.redirect(app.reverse('statuses'));
      } catch (error) {
        if (error instanceof ValidationError) {
          const status = new app.objection.models.status();
          status.$set(reqData);
          req.flash('danger', app.t('views.new.statuses.flash.fail'));
          return reply.code(422).render('statuses/new', { data: { status }, errors: error.data });
        }
        throw error;
      }
    })
    .get('/statuses/:id/edit', { name: 'editStatus', preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id } } = req;
      const status = await app.objection.models.status.query().findById(id);
      return reply.render('statuses/edit', { data: { status }, errors: {} });
    })
    .patch('/statuses/:id', { name: 'updateStatus', preValidation: app.formAuth }, async (req, reply) => {
      const { body: { data: reqData }, params: { id } } = req;
      try {
        const updatedStatus = app.objection.models.status.fromJson(reqData);
        const existingStatus = await app.objection.models.status.query().findById(id);
        await existingStatus.$query().patch(updatedStatus);
        req.flash('info', app.t('views.index.statuses.flash.success.edit'));
        return reply.redirect(app.reverse('statuses'));
      } catch (error) {
        if (error instanceof ValidationError) {
          const status = new app.objection.models.status();
          status.$set({ id, ...reqData });
          req.flash('danger', app.t('views.edit.statuses.flash.fail'));
          return reply.code(422).render('statuses/edit', { data: { status }, errors: error.data });
        }
        throw error;
      }
    })
    .delete('/statuses/:id', { name: 'destroyStatus', preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id } } = req;
      const status = await app.objection.models.status.query().findById(id);
      if (!status) {
        req.flash('danger', app.t('views.index.statuses.flash.fail.delete'));
        return reply.redirect(app.reverse('statuses'));
      }
      const relatedTasks = await status.$relatedQuery('tasks');
      if (relatedTasks.length > 0) {
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
