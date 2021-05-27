import { Model } from 'objection';
import objectionUnique from 'objection-unique';
import Base from './Base';

const unique = objectionUnique({ fields: ['name'] });

export default class Status extends unique(Base) {
  static get tableName() {
    return 'statuses';
  }

  static relationMappings = {
    task: {
      relation: Model.HasManyRelation,
      modelClass: 'Task',
      join: {
        from: 'statuses.id',
        to: 'tasks.status_id',
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
