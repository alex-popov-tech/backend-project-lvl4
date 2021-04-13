import {
  internet, lorem, name,
} from 'faker';
import _ from 'lodash';

export default (app) => ({
  insert: {
    status: (data = {}) => app.objection.models.status.query()
      .insert(_.merge({ name: name.title() }, data)),
    label: (data = {}) => app.objection.models.label.query()
      .insert(_.merge({ name: name.title() }, data)),
    user: (data = {}) => app.objection.models.user.query()
      .insert(_.merge({
        firstName: name.firstName(),
        lastName: name.lastName(),
        email: internet.email(),
        password: internet.password(),
      }, data)),
    task: (data = {}) => app.objection.models.task.query()
      .insert(_.merge({
        name: name.title(),
        description: lorem.paragraph(),
      }, data)),
  },
  find: {
    statuses: () => app.objection.models.status.query(),
    users: () => app.objection.models.user.query(),
    labels: () => app.objection.models.label.query(),
    tasks: () => app.objection.models.task.query(),
  },
  clear: async () => {
    // rollback and migrate to prune database
    await app.objection.knex.migrate.rollback();
    await app.objection.knex.migrate.latest();
  },
});
