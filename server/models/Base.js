const { Model } = require('objection');

export default class BaseModel extends Model {
  static get modelPaths() {
    return [__dirname];
  }
}
