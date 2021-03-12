import { internet } from 'faker';
import { launchApp, shutdownApp, clear } from './helpers.js';

describe('Session', () => {
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
    app = await launchApp();
  });

  afterAll(async () => {
    await shutdownApp(app);
  });

  it('should return 302 and a cookie when using valid credentials', async () => {
    const res = await app.inject({
      method: 'post',
      url: '/session',
      body: { email: user.email, password: 'test' },
    });
    expect(res.statusCode).toBe(302);
    expect(res.headers['set-cookie']).toBeTruthy();
  });

  describe('when using invalid credentials', () => {
    it.each([
      ['empty email', { email: '', password: 'test' }],
      ['email does not match pattern', { email: 'aa.com', password: 'test' }],
      ['email not exist', { email: 'not@exist.com', password: 'test' }],
      ['empty password', { email: 'a@a.com', password: 'test' }],
      ['password does not match', { email: 'test@test.com', password: 'invalid' }],
    ])('should return 404 when %s', async (_, body) => {
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/session',
        body,
      });
      expect(statusCode).toBe(404);
    });
  });
});
