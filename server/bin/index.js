import fastify from '..';

(async () => {
  const app = fastify();
  try {
    await app.listen(process.env.PORT);
    console.log(`server listening on ${app.server.address().port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
