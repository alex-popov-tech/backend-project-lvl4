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
  await app.objection.knex.migrate.rollback();
  await app.objection.knex.migrate.latest();
};
