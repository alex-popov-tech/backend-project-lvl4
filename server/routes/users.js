export default (app) => {
  app
    .get('/users', async (req, reply) => {
      const users = await app.objection.models.user.query();
      await reply.render('users/index', { data: { users } });
    })
    .get('/users/new', async (req, reply) => {
      await reply.render('users/new', { data: { user: {} }, errors: [] });
    })
    .get('/users/edit/:id', { preValidation: app.formAuth }, async (req, reply) => {
      const { user, params: { id } } = req;
      if (user.id !== Number(id)) {
        req.flash('danger', app.t('users.index.flash.fail.deleteOrEditOtherUser'));
        const users = await app.objection.models.user.query();
        return reply.code(422).render('users/index', { data: { users } });
      }
      return reply.render('users/edit', { data: { user }, errors: [] });
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
      const { params: { id } } = req;
      try {
        if (req.user.id !== Number(id)) {
          const users = await app.objection.models.user.query();
          req.flash('danger', app.t('users.index.flash.fail.deleteOrEditOtherUser'));
          return reply.code(422).render('users/index', { data: { users } });
        }
        const updatedUser = app.objection.models.user.fromJson(req.body);
        const existingUser = await app.objection.models.user.query().findById(id);
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
    .delete('/users/:id', { preValidation: app.formAuth }, async (req, reply) => {
      const { user, params: { id } } = req;
      try {
        if (user.id !== Number(id)) {
          const users = await app.objection.models.user.query();
          req.flash('danger', app.t('users.index.flash.fail.deleteOrEditOtherUser'));
          return reply.code(422).render('users/index', { data: { users } });
        }
        await req.logout(user);
        await app.objection.models.user.query().deleteById(id);
        return reply.redirect('/users');
      } catch ({ data }) {
        req.flash('danger', app.t('users.index.flash.fail.deleteOrEditOtherUser'));
        return reply.code(422).render('users/edit', { data: { user }, errors: data });
      }
    });
};
