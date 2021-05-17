export default (app) => {
  app
    .get('/session/new', async (req, reply) => {
      const user = new app.objection.models.user();
      await reply.render('session/new', { data: { user }, errors: {} });
    })
    .post('/session', app.passport.authenticate('form', async (req, reply, err, existingUser) => {
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
        errors: { email: [{ message: 'User with such credentials pair does not exist' }] },
      });
    }))
    .delete('/session', async (req, reply) => {
      req.logOut();
      req.flash('info', app.t('views.welcome.flash.success.logout'));
      return reply.redirect(app.reverse('welcome'));
    });
};
