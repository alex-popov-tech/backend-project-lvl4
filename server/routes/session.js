export default (app) => {
  app
    .get('/session/new', { name: 'newSession' }, async (req, reply) => {
      const user = new app.objection.models.user();
      await reply.render('session/new', { data: { user }, errors: {} });
    })
    .post('/session', { name: 'createSession' }, app.passport.authenticate('form', async (req, reply, err, existingUser) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (existingUser) {
        await req.login(existingUser);
        req.flash('success', app.t('views.welcome.flash.success.login'));
        return reply.redirect(app.reverse('welcome'));
      }
      const user = new app.objection.models.user();
      user.$set(req.body.data);
      req.flash('danger', app.t('views.new.session.flash.fail'));
      return reply.code(404).render('session/new', {
        data: { user },
        errors: { email: [{ message: app.t('views.new.session.flash.fail') }] },
      });
    }))
    .delete('/session', { name: 'destroySession' }, async (req, reply) => {
      req.logOut();
      req.flash('info', app.t('views.welcome.flash.success.logout'));
      return reply.redirect(app.reverse('welcome'));
    });
};
