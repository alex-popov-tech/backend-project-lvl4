import { Model } from 'objection';
import Status from './Status';
import User from './User';

export default class Task extends Model {
  static tableName = 'tasks';

  static pickJsonSchemaProperties = true;

  static relationMappings = {
    status: {
      relation: Model.HasOneRelation,
      modelClass: Status,
      join: {
        from: 'tasks.status_id',
        to: 'statuses.id',
      },
    },
    creator: {
      relation: Model.BelongsToOneRelation,
      modelClass: User,
      join: {
        from: 'tasks.creator_id',
        to: 'users.id',
      },
    },
    assigned: {
      relation: Model.HasOneRelation,
      modelClass: User,
      join: {
        from: 'tasks.assigned_id',
        to: 'users.id',
      },
    },
  };

  static jsonSchema = {
    type: 'object',
    required: ['name', 'description', 'statusId', 'creatorId'],
    properties: {
      id: { type: 'integer' },
      name: { type: 'string', minLength: 3 },
      description: { type: 'string', minLength: 3 },
      statusId: { type: 'integer' },
      creatorId: { type: 'integer' },
      assignedId: { type: ['integer', 'null'] },
    },
  };
}