export default (app) => {
  app
    .get('/users', async (req, reply) => {
      const users = await app.objection.models.user.query();
      await reply.render('users/index', { data: { users } });
    })
    .get('/users/new', async (req, reply) => {
      await reply.render('users/new', { data: { user: {} }, errors: [] });
    })
    .get('/users/edit', { preValidation: app.formAuth }, async (req, reply) => {
      await reply.render('users/edit', { data: { currentUser: req.currentUser }, errors: [] });
    })
    .post('/users', async (req, reply) => {
      try {
        const newUser = await app.objection.models.user.fromJson(req.body);
        await app.objection.models.user.query().insert(newUser);
        await req.login(newUser);
        await reply.redirect('/');
      } catch ({ data }) {
        const user = new app.objection.models.user();
        user.$set(req.body);
        await reply.code(422).render('users/new', { data: { user }, errors: data });
      }
    })
    .patch('/users/:id', { preValidation: app.formAuth }, async (req, reply) => {
      try {
        const { id } = req.params;
        const updatedUser = app.objection.models.user.fromJson(req.body);
        const existingUser = await app.objection.models.user.query().findById(id);
        await existingUser.$query().patch(updatedUser);
        return reply.redirect('/users');
      } catch ({ data }) {
        const user = new app.objection.models.user();
        user.$set(req.body);
        return reply.code(422).render('users/edit', { data: { user }, errors: data });
      }
    })
    .delete('/users/:id', { preValidation: app.formAuth }, async (req, reply) => {
      const { id } = req.params;
      if (req.user.id === Number(id)) {
        await req.logout(req.user);
        await app.objection.models.user.query().deleteById(Number(id));
      }
      await reply.redirect('/users');
    });
};
