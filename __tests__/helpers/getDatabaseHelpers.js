export default (app) => ({
  insert: {
    status: (data) => app.objection.models.status.query().insert(data),
    label: (data) => app.objection.models.label.query().insert(data),
    user: (data) => app.objection.models.user.query().insert(data),
    task: (data) => app.objection.models.task.query().insert(data),
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
