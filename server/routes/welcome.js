export default (app) => {
  app.get('/', async (_req, reply) => reply.render('welcome/index'));
};
