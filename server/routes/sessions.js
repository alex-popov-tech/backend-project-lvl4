export default (app) => {
  app
    .get('/sessions/new', async (req, reply) => {
      const user = new app.objection.models.user();
      await reply.render('sessions/new', { data: { user }, errors: {} });
    })
    .post('/sessions', app.passport.authenticate('form', async (req, reply, err, existingUser) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (existingUser) {
        await req.login(existingUser);
        req.flash('success', app.t('welcome.flash.success.login'));
        return reply.redirect('/');
      }
      const user = new app.objection.models.user();
      user.$set(req.body);
      req.flash('danger', app.t('session.signin.flash.fail'));
      return reply.code(404).render('sessions/new', {
        data: { user },
        errors: { email: [{ message: 'User with such credentials pair does not exist' }] },
      });
    }))
    .delete('/sessions', async (req, reply) => {
      req.session.delete();
      req.flash('info', app.t('welcome.flash.success.logout'));
      return reply.redirect('/');
    });
};
