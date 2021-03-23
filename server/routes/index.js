import welcome from './welcome';
import user from './user';
import session from './session';
import status from './status';
import label from './label';
import task from './task';

export default (app) => [welcome, user, session, status, label, task]
  .forEach((routes) => routes(app));
