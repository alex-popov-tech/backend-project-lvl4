import welcome from './welcome';
import users from './users';
import sessions from './sessions';
import statuses from './statuses';
import labels from './labels';
import tasks from './tasks';

export default (app) => [welcome, users, sessions, statuses, labels, tasks]
  .forEach((routes) => routes(app));
