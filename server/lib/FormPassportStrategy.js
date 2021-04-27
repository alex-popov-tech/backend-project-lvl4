import { Strategy } from 'fastify-passport';

export default class FormStrategy extends Strategy {
  constructor(name, app) {
    super(name);
    this.app = app;
  }

  async authenticate(request) {
    if (request.isAuthenticated()) {
      return this.pass();
    }

    const body = request?.body || {};
    const email = body['data[email]'] ?? null;
    const password = body['data[password]'] ?? null;
    const user = await this.app.objection.models.user.query().findOne({ email });

    if (user && await user.verifyPassword(password)) {
      return this.success(user);
    }

    return this.fail();
  }
}
