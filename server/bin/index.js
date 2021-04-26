import fastify from '..';

(async () => {
  console.log('before create app');
  const app = fastify();
  console.log('after create app');
  try {
    console.log('before start app');
    await app.listen(process.env.PORT || 3000, process.env.HOST || '127.0.0.1');
    console.log(`server listening on ${app.server.address().address}:${app.server.address().port}`);
  } catch (err) {
    console.log('before throw error');
    app.log.error(err);
    process.exit(1);
  }
})();
