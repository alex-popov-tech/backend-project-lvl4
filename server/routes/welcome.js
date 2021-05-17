export default (app) => {
  app.get('/', { name: 'welcome' }, async (req, reply) => reply.render('welcome/index'));
};
