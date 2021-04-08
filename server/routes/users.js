export default (app) => {
  app
    .get('/users', async (req, reply) => {
      const users = await app.objection.models.user.query();
      await reply.render('users/index', { data: { users, currentUser: req.currentUser } });
    })
    .get('/users/new', async (req, reply) => {
      await reply.render('users/new', { data: { user: {} }, errors: [] });
    })
    .get('/users/edit/:id', async (req, reply) => {
      const { id } = req.params;
      if (req.currentUser.id !== Number(id)) {
        req.flash('danger', app.t('users.index.flash.fail.deleteOrEditOtherUser'));
        return reply.redirect('/users');
      }
      return reply.render('users/edit', { data: { user: req.currentUser }, errors: [] });
    })
    .post('/users', async (req, reply) => {
      try {
        const newUser = await app.objection.models.user.fromJson(req.body);
        await app.objection.models.user.query().insert(newUser);
        await reply.redirect('/sessions/new');
      } catch ({ data }) {
        const user = new app.objection.models.user();
        user.$set(req.body);
        await reply.code(422).render('users/new', { data: { user }, errors: data });
      }
    })
    .patch('/users', async (req, reply) => {
      try {
        const { id } = req.body;
        if (req.currentUser.id !== Number(id)) {
          req.flash('danger', app.t('users.index.flash.fail.deleteOrEditOtherUser'));
          return reply.redirect('/users');
        }
        const updatedUser = app.objection.models.user.fromJson(req.body);
        const existingUser = await app.objection.models.user.query().findById(req.currentUser.id);
        await existingUser.$query().patch(updatedUser);
        req.flash('success', app.t('users.index.flash.success.edit'));
        return reply.redirect('/users');
      } catch ({ message, data }) {
        const user = new app.objection.models.user();
        user.$set(req.body);
        req.flash('danger', app.t('users.edit.flash.fail'));
        return reply.code(422).render('users/edit', { data: { user }, errors: data });
      }
    })
    .delete('/users/:id', async (req, reply) => {
      const { id } = req.params;
      if (req.currentUser.id !== Number(id)) {
        req.flash('danger', app.t('users.index.flash.fail.deleteOrEditOtherUser'));
        return reply.redirect('/users');
      }
      req.session.delete();
      await app.objection.models.user.query().deleteById(id);
      return reply.redirect('/');
    });
};
