import welcome from './welcome';
import users from './users';
import session from './session';
import status from './status';
import tasks from './tasks';

export addRoutes (app) => [welcome, users, session, status, tasks].forEach((routes) => routes(app));
