export default (app) => {
  app.get('/', async (req, reply) => reply.render('welcome/index'));
};
