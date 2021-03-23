export default (app) => {
  app
    .get('/user', async (req, reply) => {
      const users = await app.objection.models.user.query();
      await reply.render('user/index', { data: { users, currentUser: req.currentUser } });
    })
    .get('/user/new', async (req, reply) => {
      await reply.render('user/new', { data: { user: {} }, errors: [] });
    })
    .get('/user/edit', async (req, reply) => {
      await reply.render('user/edit', { data: { currentUser: req.currentUser }, errors: [] });
    })
    .post('/user', async (req, reply) => {
      try {
        const newUser = await app.objection.models.user.fromJson(req.body);
        await app.objection.models.user.query().insert(newUser);
        await reply.redirect('/session/new');
      } catch ({ data }) {
        await reply.code(400).render('user/new', { data: { user: req.body }, errors: data });
      }
    })
    .put('/user', async (req, reply) => {
      try {
        const updatedUser = app.objection.models.user.fromJson(req.body);
        const existingUser = await app.objection.models.user.query().findById(req.currentUser.id);
        await existingUser.$query().patch(updatedUser);
        await reply.redirect('/users');
      } catch ({ data }) {
        await reply.code(400).render('user/edit', { data: { user: req.body }, errors: data });
      }
    })
    .delete('/user', async (req, reply) => {
      const { id } = req.body;
      await app.objection.models.user.query().deleteById(id);
      if (req.currentUser.id === Number(id)) {
        req.session.delete();
        await reply.redirect('/');
        return;
      }
      await reply.redirect('/user');
    });
};
