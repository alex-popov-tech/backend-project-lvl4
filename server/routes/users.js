import { ValidationError } from 'objection';

export default (app) => {
  app
    .get('/users', { name: 'users' }, async (req, reply) => {
      const users = await app.objection.models.user.query();
      return reply.render('users/index', { data: { users } });
    })
    .get('/users/new', { name: 'newUser' }, async (req, reply) => {
      const user = new app.objection.models.user();
      return reply.render('users/new', { data: { user }, errors: [] });
    })
    .post('/users', { name: 'createUser' }, async (req, reply) => {
      try {
        const newUser = await app.objection.models.user.fromJson(req.body.data);
        await app.objection.models.user.query().insert(newUser);
        await req.login(newUser);
        req.flash('success', app.t('views.welcome.flash.success.registration'));
        return reply.redirect(app.reverse('welcome'));
      } catch (error) {
                        if (error instanceof ValidationError) {
        const user = new app.objection.models.user();
        user.$set(req.body.data);
        return reply.code(422).render('users/new', { data: { user }, errors: error.data });
      }
      throw error;
      }
    })
    .get('/users/:id/edit', { name: 'editUser', preValidation: app.formAuth }, async (req, reply) => {
      const { user, params: { id } } = req;
      if (user.id !== Number(id)) {
        req.flash('danger', app.t('views.index.users.flash.fail.deleteOrEditOtherUser'));
        const users = await app.objection.models.user.query();
        return reply.code(422).render('users/index', { data: { users } });
      }
      return reply.render('users/edit', { data: { user }, errors: {} });
    })
    .patch('/users/:id', { name: 'updateUser', preValidation: app.formAuth }, async (req, reply) => {
      const { params: { id } } = req;
      try {
        if (req.user.id !== Number(id)) {
          const users = await app.objection.models.user.query();
          req.flash('danger', app.t('views.index.users.flash.fail.deleteOrEditOtherUser'));
          return reply.code(422).render('users/index', { data: { users } });
        }
        const updatedUser = app.objection.models.user.fromJson(req.body.data);
        const existingUser = await app.objection.models.user.query().findById(id);
        await existingUser.$query().patch(updatedUser);
        req.flash('success', app.t('views.index.users.flash.success.edit'));
        return reply.redirect(app.reverse('users'));
      } catch (error) {
                                if (error instanceof ValidationError) {
        const user = new app.objection.models.user();
        user.$set(req.body.data);
        req.flash('danger', app.t('views.edit.users.flash.fail'));
        return reply.code(422).render('users/edit', { data: { user }, errors: error.data });
      }
      throw error;
    }
    })
    .delete('/users/:id', { name: 'destroyUser', preValidation: app.formAuth }, async (req, reply) => {
      const { user, params: { id } } = req;
      try {
        if (user.id !== Number(id)) {
          const users = await app.objection.models.user.query();
          req.flash('danger', app.t('views.index.users.flash.fail.deleteOrEditOtherUser'));
          return reply.code(422).render('users/index', { data: { users } });
        }
        await req.logout(user);
        req.flash('success', app.t('views.index.users.flash.success.delete'));
        await app.objection.models.user.query().deleteById(id);
        return reply.redirect(app.reverse('users'));
      } catch (error) {
        if (error instanceof ValidationError) {
        req.flash('danger', app.t('views.index.users.flash.fail.deleteOrEditOtherUser'));
        return reply.code(422).render('users/edit', { data: { user }, errors: error.data });
      }
      throw error;
    }
    });
};
