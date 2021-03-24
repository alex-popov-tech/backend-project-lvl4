export default (app) => {
  app
    .get('/users', async (req, reply) => {
      const users = await app.objection.models.user.query();
      await reply.render('users/index', { data: { users, currentUser: req.currentUser } });
    })
    .get('/users/new', async (req, reply) => {
      await reply.render('users/new', { data: { user: {} }, errors: [] });
    })
    .get('/users/edit', async (req, reply) => {
      await reply.render('users/edit', { data: { currentUser: req.currentUser }, errors: [] });
    })
    .post('/users', async (req, reply) => {
      try {
        const newUser = await app.objection.models.user.fromJson(req.body);
        await app.objection.models.user.query().insert(newUser);
        await reply.redirect('/sessions/new');
      } catch ({ data }) {
        const user = new app.objection.models.user();
        user.$set(req.body);
        await reply.code(400).render('users/new', { data: { user }, errors: data });
      }
    })
    .patch('/users', async (req, reply) => {
      try {
        const updatedUser = app.objection.models.user.fromJson(req.body);
        const existingUser = await app.objection.models.user.query().findById(req.currentUser.id);
        await existingUser.$query().patch(updatedUser);
        await reply.redirect('/userss');
      } catch ({ data }) {
        const user = new app.objection.models.user();
        user.$set(req.body);
        await reply.code(400).render('users/edit', { data: { user }, errors: data });
      }
    })
    .delete('/users', async (req, reply) => {
      const { id } = req.body;
      await app.objection.models.user.query().deleteById(id);
      if (req.currentUser.id === Number(id)) {
        req.session.delete();
        await reply.redirect('/');
        return;
      }
      await reply.redirect('/users');
    });
};
