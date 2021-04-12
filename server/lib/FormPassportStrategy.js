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

    const email = request?.body?.email ?? null;
    const password = request?.body?.password ?? null;
    const user = await this.app.objection.models.user.query().findOne({ email });

    if (user && await user.verifyPassword(password)) {
      return this.success(user);
    }

    return this.fail();
  }
}
