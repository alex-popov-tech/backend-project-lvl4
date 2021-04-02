export default (app) => {
  app
    .get('/users', async (req, reply) => {
      const users = await app.objection.models.user.query();
      await reply.render('users/index', { data: { users, currentUser: req.user ?? {} } });
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
    .patch('/users', { preValidation: app.formAuth }, async (req, reply) => {
      try {
        if (Number(req.body.id) !== req.user.id) {
          return reply.redirect('/users');
        }
        const updatedUser = app.objection.models.user.fromJson(req.body);
        const existingUser = await app.objection.models.user.query().findById(req.user.id);
        await existingUser.$query().patch(updatedUser);
        return reply.redirect('/users');
      } catch ({ data }) {
        const user = new app.objection.models.user();
        user.$set(req.body);
        return reply.code(422).render('users/edit', { data: { user }, errors: data });
      }
    })
    .delete('/users', { preValidation: app.formAuth }, async (req, reply) => {
      const { id } = req.body;
      if (req.user.id === Number(id)) {
        await req.logout(req.user);
        await app.objection.models.user.query().deleteById(id);
      }
      await reply.redirect('/users');
    });
};
