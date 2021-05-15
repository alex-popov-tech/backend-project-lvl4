exports.up = (knex) => knex.schema.table('tasks', (table) => {
  table.renameColumn('assigned_id', 'executor_id');
});

exports.down = (knex) => knex.schema.table('tasks', (table) => {
  table.renameColumn('executor_id', 'assigned_id');
});
