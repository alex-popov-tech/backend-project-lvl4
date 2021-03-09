import knex from 'knex';
import server from '../server';
import config from '../knexfile';

export const launchApp = async () => {
  const db = knex(config.test);
  await db.migrate.latest();
  const app = await server();
  return {
    db,
    app,
  };
};

export const shutdownApp = async (app, db) => {
  await app.close();
  await db.destroy();
};

export const clear = async (app) => {
  await app.objection.models.task.query().delete();
  await app.objection.models.status.query().delete();
  await app.objection.models.user.query().delete();
};
