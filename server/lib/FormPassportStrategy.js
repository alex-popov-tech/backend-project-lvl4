import { Strategy } from 'fastify-passport';

export default class FormStrategy extends Strategy {
  constructor(name, app) {
    super(name);
    this.app = app;
  }

  async authenticate(req) {
    if (req.isAuthenticated()) {
      return this.pass();
    }

    const email = req.body?.data?.email ?? null;
    const password = req.body?.data?.password ?? null;
    const user = await this.app.objection.models.user.query().findOne({ email });

    if (user && await user.verifyPassword(password)) {
      return this.success(user);
    }

    return this.fail();
  }
}
