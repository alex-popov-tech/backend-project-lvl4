import fastify from '..';

(async () => {
  const app = fastify();
  try {
    await app.listen(process.env.PORT || 3000, process.env.HOST || '127.0.0.1');
    console.log(`server listening on ${app.server.address().address}:${app.server.address().port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
