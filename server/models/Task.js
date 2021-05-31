import { Model } from 'objection';
import Base from './Base';

export default class Task extends Base {
  static tableName = 'tasks';

  static pickJsonSchemaProperties = true;

  static relationMappings = {
    labels: {
      relation: Model.ManyToManyRelation,
      modelClass: 'Label',
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
      relation: Model.BelongsToOneRelation,
      modelClass: 'Status',
      join: {
        from: 'tasks.status_id',
        to: 'statuses.id',
      },
    },
    creator: {
      relation: Model.BelongsToOneRelation,
      modelClass: 'User',
      join: {
        from: 'tasks.creator_id',
        to: 'users.id',
      },
    },
    executor: {
      relation: Model.BelongsToOneRelation,
      modelClass: 'User',
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
    withStatus(query, statusId) {
      query.where('statusId', status);
    },
    withCreator(query, userId) {
      query.where('creatorId', req.user.id);
    },
    withExecutor(query, executorId) {
      query.where('executorId', executor);
    },
    withLabel(query, labelId) {
      query.whereExists(Task.relatedQuery('labels').where('labels.id', labelId));
    },
  };
}
