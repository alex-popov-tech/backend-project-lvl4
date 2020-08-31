import { Model } from 'objection';
import objectionUnique from 'objection-unique';

const unique = objectionUnique({ fields: ['name'] });

export default class Status extends unique(Model) {
  static get tableName() {
    return 'statuses';
  }

  static get pickJsonSchemaProperties() {
    return true;
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 2 },
      },
    };
  }

  toString() {
    return this.name;
  }
}
