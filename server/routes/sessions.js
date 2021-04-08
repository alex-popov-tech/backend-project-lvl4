export default (app) => {
  app
    .get('/sessions/new', async (req, reply) => {
      await reply.render('sessions/new', { data: { user: {} }, errors: {} });
    })
    .post('/sessions', async (req, reply) => {
      const existingUser = await app.objection.models.user.query().findOne({
        email: req.body.email,
      });
      if (!existingUser) {
        const user = new app.objection.models.user();
        user.$set(req.body);
        req.flash('danger', app.t('session.signin.flash.fail'));
        return reply.code(404).render('sessions/new', {
          data: { user },
          errors: { email: [] },
        });
      }

      const passwordMatch = await existingUser.verifyPassword(req.body.password);
      if (!passwordMatch) {
        const user = new app.objection.models.user();
        user.$set(req.body);
        req.flash('danger', app.t('session.signin.flash.fail'));
        return reply.code(404).render('sessions/new', {
          data: { user },
          errors: { email: [] },
        });
      }

      req.session.set('userId', existingUser.id);
      req.flash('success', app.t('welcome.flash.success.login'));
      return reply.redirect('/');
    })
    .delete('/sessions', async (req, reply) => {
      req.session.delete();
      req.flash('info', app.t('welcome.flash.success.logout'));
      return reply.redirect('/');
    });
};
