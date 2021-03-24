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
        await reply.code(404).render('sessions/new', {
          data: { user },
          errors: { email: [{ message: 'User with such email does not exist' }] },
        });
        return;
      }

      const passwordMatch = await existingUser.verifyPassword(req.body.password);
      if (!passwordMatch) {
        const user = new app.objection.models.user();
        user.$set(req.body);
        await reply.code(404).render('sessions/new', {
          data: { user },
          errors: { password: [{ message: 'Password does not match' }] },
        });
        return;
      }

      req.session.set('userId', existingUser.id);
      await reply.redirect('/');
    })
    .delete('/sessions', async (req, reply) => {
      req.session.delete();
      await reply.redirect('/');
    });
};
