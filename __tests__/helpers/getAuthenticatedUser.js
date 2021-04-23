import { parse } from 'cookie';
import getDatabaseHelpers from './getDatabaseHelpers';
import create from './fabrics';

export default async (app) => {
  const userData = create.user();
  const user = await getDatabaseHelpers(app).insert.user(userData);
  const response = await app.inject({
    method: 'post',
    url: '/sessions',
    body: { email: userData.email, password: userData.password },
  });
  return { user, cookies: parse(response.headers['set-cookie']) };
};
