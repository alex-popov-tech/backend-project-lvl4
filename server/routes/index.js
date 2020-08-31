import welcome from './welcome';
import users from './users';
import session from './session';
import statuses from './statuses';
import tasks from './tasks';

export default (app) => [welcome, users, session, statuses, tasks].forEach((routes) => routes(app));
