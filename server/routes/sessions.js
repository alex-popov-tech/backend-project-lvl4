export default (app) => {
  app
    .get('/sessions/new', async (req, reply) => {
      const user = new app.objection.models.user();
      await reply.render('sessions/new', { data: { user }, errors: {} });
    })
    .post('/sessions', app.pasport.authenticate('form', async (req, reply, err, existingUser) => {
      if (err) {
        return app.httpErrors.internalServerError(err);
      }
      if (existingUser) {
        await req.login(existingUser);
        return reply.redirect('/');
      }
      const user = new app.objection.models.user();
      user.$set(req.body);
      return reply.code(404).render('sessions/new', {
        data: { user },
        errors: { email: [{ message: 'User with such credentials pair does not exist' }] },
      });
    }))
    .delete('/sessions', async (req, reply) => {
      req.session.delete();
      await reply.redirect('/');
    });
};
