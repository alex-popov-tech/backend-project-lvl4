export default (app) => {
  app
    .get('/session/new', async (req, reply) => {
      await reply.render('session/new', { data: {}, errors: {} });
    })
    .post('/session', async (req, reply) => {
      const existingUser = await app.objection.models.user.query().findOne({
        email: req.body.email,
      });
      console.log(existingUser)

      if (!existingUser) {
        await reply.code(404).render('session/new', {
          data: { email: req.body.email },
          errors: { email: [{ message: 'User with such email does not exist' }] },
        });
        return;
      }

      const passwordMatch = await existingUser.verifyPassword(req.body.password);
      if (!passwordMatch) {
        await reply.code(404).render('session/new', {
          data: { email: req.body.email },
          errors: { password: [{ message: 'Password does not match' }] },
        });
        return;
      }

      req.session.set('userId', existingUser.id);
      await reply.redirect('/');
    })
    .delete('/session', async (req, reply) => {
      req.session.delete();
      await reply.redirect('/');
    });
};
