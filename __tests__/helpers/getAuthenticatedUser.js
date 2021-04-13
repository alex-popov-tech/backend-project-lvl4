import { parse } from 'cookie';
import { internet } from 'faker';
import database from './database';

export default async (app) => {
  const email = internet.email();
  const password = internet.password();
  const user = await database(app).insert.user({
    email,
    password,
  });
  const response = await app.inject({
    method: 'post',
    url: '/sessions',
    body: { email, password },
  });
  return { user, cookies: parse(response.headers['set-cookie']) };
};
