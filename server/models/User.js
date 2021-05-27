import { Model } from 'objection';
import objectionPassword from 'objection-password';
import objectionUnique from 'objection-unique';
import Base from './Base';

const password = objectionPassword();
const unique = objectionUnique({ fields: ['email'] });

export default class User extends unique(password(Base)) {
  static get tableName() {
    return 'users';
  }

  static relationMappings = {
    ownTasks: {
      relation: Model.HasManyRelation,
      modelClass: 'Task',
      join: {
        from: 'users.id',
        to: 'tasks.creator_id',
      },
    },
    assignedTasks: {
      relation: Model.HasManyRelation,
      modelClass: 'Task',
      join: {
        from: 'users.id',
        to: 'tasks.executor_id',
      },
    },
  };

  static pickJsonSchemaProperties = true;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 3 },
        firstName: { type: 'string', minLength: 3 },
        lastName: { type: 'string', minLength: 3 },
      },
    };
  }

  toString() {
    return `${this.firstName} ${this.lastName}`;
  }
}
