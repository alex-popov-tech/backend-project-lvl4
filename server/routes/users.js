export default (app) => {
  app
    .get('/user', async (req, reply) => {
      const users = await app.objection.models.user.query();
      await reply.render('user/index', { currentUser: req.currentUser, users });
    })
    .get('/user/new', async (req, reply) => {
      await reply.render('user/new', { data: {}, errors: [] });
    })
    .get('/user/edit', async (req, reply) => {
      await reply.render('user/edit', { data: req.currentUser, errors: [] });
    })
    .post('/user', async (req, reply) => {
      try {
        const newUser = await app.objection.models.user.fromJson(req.body);
        await app.objection.models.user.query().insert(newUser);
        await reply.redirect('/session/new');
      } catch ({ data }) {
        await reply.code(400).render('user/new', { data: req.body, errors: data });
      }
    })
    .put('/user', async (req, reply) => {
      try {
        const updatedUser = app.objection.models.user.fromJson(req.body);
        const existingUser = await app.objection.models.user.query().findById(req.currentUser.id);
        await existingUser.$query().patch(updatedUser);
        await reply.redirect('/user');
      } catch ({ data }) {
        await reply.code(400).render('user/edit', { data: req.body, errors: data });
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
