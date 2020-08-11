export default (app) => {
  app
    .get('/users', async (req, reply) => {
      const users = await app.objection.models.user.query();
      await reply.render('users/index', { currentUser: req.currentUser, users });
    })
    .get('/users/new', async (req, reply) => {
      await reply.render('users/new', { data: {}, errors: [] });
    })
    .get('/users/edit', async (req, reply) => {
      await reply.render('users/edit', { data: req.currentUser, errors: [] });
    })
    .post('/users', async (req, reply) => {
      try {
        const newUser = await app.objection.models.user.fromJson(req.body);
        await app.objection.models.user.query().insert(newUser);
        await reply.redirect('/session/new');
      } catch ({ data }) {
        await reply.code(400).render('users/new', { data: req.body, errors: data });
      }
    })
    .put('/users', async (req, reply) => {
      try {
        const updatedUser = app.objection.models.user.fromJson(req.body);
        const existingUser = await app.objection.models.user.query().findById(req.currentUser.id);
        await existingUser.$query().patch(updatedUser);
        await reply.redirect('/users');
      } catch ({ data }) {
        await reply.code(400).render('users/edit', { data: req.body, errors: data });
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
