import dotenv from 'dotenv';
import fastify from 'fastify';
import fastifyErrorPage from 'fastify-error-page';
import fastifyStatic from 'fastify-static';
import fastifyWebpackHMR from 'fastify-webpack-hmr'
import path from 'path';
import pointOfView from 'point-of-view';
import pug from 'pug';
import Rollbar from 'rollbar';
import routes from './routes';

dotenv.config();

const errorHandler = (app) => {
  app.setNotFoundHandler((req, reply) => reply.redirect('/404'));
  if (process.env.NODE_ENV === 'development') {
    app.register(fastifyErrorPage);
  } else {
    app.setErrorHandler((req, reply) => reply.redirect('/500'));
    const rollbar = new Rollbar({
      accessToken: process.env.ROLLBAR_TOKEN,
      captureUncaught: true,
      captureUnhandledRejections: true,
    });
    app.addHook('onError', async (err) => {
      rollbar.error(err);
    });
  }
};

export default () => {
  const app = fastify({
    logger: true,
  });

  app.register(pointOfView, {
    engine: { pug },
    includeViewExtension: true,
    root: path.join(__dirname, 'views'),
  });
  if (process.env.NODE_ENV === 'production') {
    app.register(fastifyStatic, { root: path.join(__dirname, '..', 'public'), prefix: '/assets/' });
  } else {
    app.register(fastifyWebpackHMR , { config: path.join(__dirname, '..', 'webpack.config.js') })
  }
  errorHandler(app);
  app.register(routes);
  return app;
};
