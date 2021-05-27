import { Model } from 'objection';
import objectionUnique from 'objection-unique';
import Task from './Task';

const unique = objectionUnique({ fields: ['name'] });

export default class Label extends unique(Model) {
  static get tableName() {
    return 'labels';
  }


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
