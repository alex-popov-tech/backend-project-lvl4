import fastify from '..';

(async () => {
  const app = fastify();
  try {
    await app.listen(process.env.PORT || 3000, process.env.HOST || '127.0.0.1');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
