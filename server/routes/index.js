export default async (app) => {
  app.get('/', (req, reply) => {
    reply.view('index');
  });
  app.get('/404', (req, reply) => {
    reply.code(404).view('404');
  });
  app.get('/500', (req, reply) => {
    reply.code(500).view('500');
  });
  app.get('/favicon.ico', (req, reply) => {
    reply.code(200).send();
  });
};
