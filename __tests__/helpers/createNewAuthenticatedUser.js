import getDatabaseHelpers from './getDatabaseHelpers';
import create from './factories';

export default async (app) => {
  const userData = create.user();
  const user = await getDatabaseHelpers(app).model.insert.user(userData);
  const { cookies: [{ name, value }] } = await app.inject({
    method: 'post',
    url: '/session',
    body: { data: { email: userData.email, password: userData.password } },
  });
  return { user, cookies: { [name]: value } };
};
