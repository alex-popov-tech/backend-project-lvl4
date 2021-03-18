import welcome from './welcome';
import users from './users';
import session from './session';
import status from './status';
import label from './label';
import tasks from './tasks';

export default (app) => [welcome, users, session, status, label, tasks].forEach((routes) => routes(app));
