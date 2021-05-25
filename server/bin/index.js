import getApp from '..';

(async () => {
  const app = getApp();
  try {
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '127.0.0.1';
    await app.listen(port, host);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
