import welcome from './welcome';
import users from './users';
import session from './session';
import statuses from './statuses';

export default (app) => [welcome, users, session, statuses].forEach((routes) => routes(app));
