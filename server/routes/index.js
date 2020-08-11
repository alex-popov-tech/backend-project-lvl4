import welcome from './welcome';
import users from './users';
import session from './session';

export default (app) => [
  welcome,
  users,
  session,
].forEach((routes) => routes(app));
