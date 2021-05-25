exports.up = (knex) => knex.schema.createTable('tasks_labels', (table) => {
  table.integer('task_id').references('id').inTable('tasks');
  table.integer('label_id').references('id').inTable('labels');
  table.timestamp('created_at').defaultTo(knex.fn.now());
  table.timestamp('updated_at').defaultTo(knex.fn.now());
});

exports.down = (knex) => knex.schema.dropTable('tasks_labels');
