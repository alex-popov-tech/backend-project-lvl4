import fastify from '..';

(async () => {
  const app = fastify();
  try {
    await app.listen(process.env.PORT || 3000);
    console.log(`server listening on ${app.server.address().port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
