import { parse } from 'cookie';
import { internet } from 'faker';

export default async (app, email = internet.email(), password = 'test') => {
  const user = await app.objection.models.user.query().insert({
    firstName: 'foo',
    lastName: 'bar',
    email,
    password,
  });
  const response = await app.inject({
    method: 'post',
    url: '/sessions',
    body: { data: { email, password } },
  });
  const cookieString = response.headers['set-cookie'];
  return { user, cookies: parse(cookieString) };
};
