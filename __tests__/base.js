import knex from 'knex';
import app from '../server';
import config from '../knexfile';

export const launchApp = async () => {
  const db = knex(config.test);
  await db.migrate.latest();
  const server = await app();
  return {
    db,
    app: server,
  };
};

export const shutdownApp = async (server, db) => {
  await server.close();
  await db.destroy();
};

export const clear = async (server) => {
    await server.objection.models.task.query().delete();
    await server.objection.models.status.query().delete();
    await server.objection.models.user.query().delete();
}
