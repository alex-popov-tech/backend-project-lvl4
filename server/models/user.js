import { Model } from 'objection';
import objectionPassword from 'objection-password';
import objectionUnique from 'objection-unique';

const password = objectionPassword();
const unique = objectionUnique({ fields: ['email'] });

export default class User extends unique(password(Model)) {
  static get tableName() {
    return 'users';
  }

  static get pickJsonSchemaProperties() {
    return true;
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password', 'firstName', 'lastName'],
      properties: {
        id: { type: 'integer' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 3 },
        firstName: { type: 'string', minLength: 3 },
        lastName: { type: 'string', minLength: 3 },
      },
    };
  }
}
