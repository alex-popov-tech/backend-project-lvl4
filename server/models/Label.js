import { Model } from 'objection';
import objectionUnique from 'objection-unique';
import Task from './Task';

const unique = objectionUnique({ fields: ['name'] });

export default class Label extends unique(Model) {
  static get tableName() {
    return 'labels';
  }

  static relationMappings = {
    tasks: {
      relation: Model.ManyToManyRelation,
      modelClass: Task,
      join: {
        from: 'labels.id',
        to: 'tasks.id',
        through: {
          from: 'tasks_labels.label_id',
          to: 'tasks_labels.task_id',
        },
      },
    },
  };

  static pickJsonSchemaProperties = true;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', minLength: 2 },
      },
    };
  }

  toString() {
    return this.name;
  }
}
