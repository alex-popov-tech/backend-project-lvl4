import welcome from './welcome';
import users from './users';
import session from './session';
import statuses from './statuses';
import labels from './labels';
import tasks from './tasks';

export default (app) => [welcome, users, session, statuses, labels, tasks]
  .forEach((routes) => routes(app));
