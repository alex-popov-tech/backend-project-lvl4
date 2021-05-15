exports.up = (knex) => knex.schema.createTable('tasks_labels', (table) => {
  table.integer('task_id');
  table.integer('label_id');
  table.timestamp('created_at').defaultTo(knex.fn.now());
  table.timestamp('updated_at').defaultTo(knex.fn.now());
});

exports.down = (knex) => knex.schema.dropTable('tasks_labels');
