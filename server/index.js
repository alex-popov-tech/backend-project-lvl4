import dotenv from 'dotenv';
import fastify from 'fastify';
import fastifyErrorPage from 'fastify-error-page';
import fastifyStatic from 'fastify-static';
import fastifyWebpackHMR from 'fastify-webpack-hmr';
import path from 'path';
import pointOfView from 'point-of-view';
import pug from 'pug';
import Rollbar from 'rollbar';
import routes from './routes';

dotenv.config();

const errorHandler = (app) => {
  app.setNotFoundHandler((req, reply) => reply.redirect('/404'));
  app.setErrorHandler((req, reply) => reply.redirect('/500'));
  if (process.env.NODE_ENV === 'development') {
    app.register(fastifyErrorPage);
  } else {
    const rollbar = new Rollbar({
      accessToken: process.env.ROLLBAR_TOKEN,
      captureUncaught: true,
      captureUnhandledRejections: true,
    });
    app.addHook('onError', async (err) => rollbar.error(err));
  }
};

const templatesEngine = (app) => app.register(pointOfView, {
  engine: { pug },
  includeViewExtension: true,
  root: path.join(__dirname, 'views'),
});

const assets = (app) => {
  if (process.env.NODE_ENV === 'production') {
    app.register(fastifyStatic, { root: path.join(__dirname, '..', 'public'), prefix: '/' });
  } else {
    app.register(fastifyWebpackHMR, { config: path.join(__dirname, '..', 'webpack.config.js') });
  }
};

export default () => {
  const app = fastify({
    logger: true,
  });

  templatesEngine(app);
  assets(app);
  errorHandler(app);
  routes(app);

  return app;
};
