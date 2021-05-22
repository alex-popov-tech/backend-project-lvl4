import {
  create, getDatabaseHelpers, launchApp, shutdownApp,
} from './helpers';

describe('Session', () => {
  let app;
  let db;
  let existingUserData;

  beforeAll(async () => {
    app = await launchApp();
    db = getDatabaseHelpers(app);
    existingUserData = create.user();
    await db.model.insert.user(existingUserData);
  });

  afterAll(async () => {
    await shutdownApp(app);
  });

  afterEach(async () => {
    await db.clear();
  });

  it('should login and logout when using valid credentials', async () => {
    const user = create.user();
    await db.model.insert.user(user);
    let res = await app.inject({
      method: 'post',
      url: '/session',
      body: { data: user },
    });
    expect(res.statusCode).toBe(302);
    const cookie = res.headers['set-cookie'];
    expect(typeof cookie).toBe('string');
    res = await app.inject({
      method: 'delete',
      url: '/session',
      headers: {
        Cookie: cookie,
      },
    });
    expect(res.statusCode).toBe(302);
  });

  describe('when using invalid credentials', () => {
    it.each([
      ['empty email', () => create.user({ email: '' })],
      ['email does not match pattern', () => create.user({ email: 'aa.com' })],
      ['email not exist', () => create.user({ email: 'not@exist.com' })],
      ['empty password', () => create.user({ password: '' })],
      ['password does not match', () => create.user({ email: existingUserData.email, password: 'invalid' })],
    ])('should not allow login and return 404 when %s', async (_, data) => {
      const { statusCode } = await app.inject({
        method: 'post',
        url: '/session',
        body: { data: data() },
      });
      expect(statusCode).toBe(404);
    });
  });
});
