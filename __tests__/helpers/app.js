import server from '../../server';

export const launchApp = async () => {
  const app = await server();
  await app.objection.knex.migrate.latest();
  return app;
};

export const shutdownApp = async (app) => {
  await app.close();
  await app.objection.knex.destroy();
};
