import { internet } from 'faker';
import { launchApp, shutdownApp, clear } from './base.js';

describe('Session', () => {
  let db;
  let app;
  let user;

  beforeEach(async () => {
    await clear(app);
    user = await app.objection.models.user.query().insert({
      firstName: 'foo',
      lastName: 'bar',
      email: internet.email(),
      password: 'test',
    });
  });

  beforeAll(async () => {
    ({ app, db } = await launchApp());
  });

  afterAll(async () => {
    await shutdownApp(app, db);
  });

  it('returns 302 and a cookie when using valid credentials', async () => {
    const res = await app.inject({
      method: 'post',
      url: '/session',
      body: { email: user.email, password: 'test' },
    });
    expect(res.statusCode).toBe(302);
    expect(res.headers['set-cookie']).toBeTruthy();
  });

  describe('when using invalid credentials', () => {
    [
      { name: 'empty email', body: { email: '', password: 'test' } },
      { name: 'email does not match pattern', body: { email: 'aa.com', password: 'test' } },
      { name: 'email not exist', body: { email: 'not@exist.com', password: 'test' } },
      { name: 'empty password', body: { email: 'a@a.com', password: 'test' } },
      { name: 'password does not match', body: { email: 'test@test.com', password: 'invalid' } },
    ].forEach(({ name, body }) => it(`returns 404 when ${name}`, async () => {
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/session',
        body,
      });
      expect(statusCode).toBe(404);
    }));
  });
});
