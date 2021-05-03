import { Model } from 'objection';
import Label from './Label';
import Status from './Status';
import User from './User';

export default class Task extends Model {
  static tableName = 'tasks';

  static pickJsonSchemaProperties = true;

  static relationMappings = {
    labels: {
      relation: Model.ManyToManyRelation,
      modelClass: Label,
      join: {
        from: 'tasks.id',
        through: {
          from: 'tasks_labels.task_id',
          to: 'tasks_labels.label_id',
        },
        to: 'labels.id',
      },
    },
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
    executor: {
      relation: Model.HasOneRelation,
      modelClass: User,
      join: {
        from: 'tasks.executor_id',
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
      description: { type: 'string' },
      statusId: { type: 'integer' },
      creatorId: { type: 'integer' },
      executorId: {
        anyOf: [
          { type: 'integer' },
          { type: 'null' },
        ],
      },
    },
  };

  static modifiers = {
    withLabelIn(query, labelIds) {
      query.whereExists(Task.relatedQuery('labels').where('labels.id', 'in', labelIds));
    },
    withStatusIn(query, statusIds) {
      query.where('status_id', 'in', statusIds);
    },
    withExecutorIn(query, assignedIds) {
      query.where('executor_id', 'in', assignedIds);
    },
  };
}
