import dotenv from 'dotenv';
import fastify from 'fastify';
import fastifyErrorsProperties from 'fastify-errors-properties';
import fastifyFormbody from 'fastify-formbody';
import fastifyMethodOverride from 'fastify-method-override';
import fastifyObjection from 'fastify-objectionjs';
import fastifySecureSession from 'fastify-secure-session';
import fastifyStatic from 'fastify-static';
import fastifyWebpackHMR from 'fastify-webpack-hmr';
import _ from 'lodash';
import path from 'path';
import pointOfView from 'point-of-view';
import pug from 'pug';
import Rollbar from 'rollbar';
import knexConfig from '../knexfile';
import models from './models/index';
import routes from './routes';

dotenv.config();

const mode = process.env.NODE_ENV || 'development';

const errorHandler = (app) => {
  if (process.env.NODE_ENV === 'development') {
    app.register(fastifyErrorsProperties);
  } else {
    const rollbar = new Rollbar({
      accessToken: process.env.ROLLBAR_TOKEN,
      captureUncaught: true,
      captureUnhandledRejections: true,
    });
    app.addHook('onError', async (err) => rollbar.error(err));
  }
};

const templatesEngine = (app) => {
  app.register(pointOfView, {
    engine: { pug },
    includeViewExtension: true,
    root: path.join(__dirname, 'views'),
    defaultContext: _,
  });
  app.decorateReply('render', function render(viewPath, locals) {
    return this.view(viewPath, { ...locals, reply: this });
  });
};

const assets = (app) => {
  if (process.env.NODE_ENV === 'production') {
    app.register(fastifyStatic, { root: path.join(__dirname, '..', 'assets'), prefix: '/assets' });
  } else {
    app.register(fastifyWebpackHMR, { config: path.join(__dirname, '..', 'webpack.config.js') });
  }
};

const database = (app) => {
  app.register(fastifyObjection, {
    knexConfig: knexConfig[mode],
    models,
  });
};

const plugins = (app) => {
  app.register(fastifyFormbody);
  app.register(fastifyMethodOverride);
};

const session = (app) => {
  app.register(fastifySecureSession, {
    secret: 'averylogphrasebiggerthanthirtytwochars',
    salt: 'mq9hDxBVDbspDR6n',
  });
  app.addHook('preHandler', async (req) => {
    const userId = req.session.get('userId');
    if (userId !== undefined) {
      req.currentUser = await app.objection.models.user.query().findById(userId);
    }
  });
  app.addHook('preHandler', async (req) => {
    console.log('============')
    console.log(`REQ - ${req.method} ${req.url} ${ JSON.stringify(req.body) }`)
    console.log('------------')
  });
  app.addHook('onSend', async (req, reply, payload) => {
    if (!req.url.includes('assets')) {
      console.log(`RES - ${req.method} ${req.url} ${reply.statusCode}\n${payload}`)
      console.log('============')
    }
  })
};

export default () => {
  const app = fastify({
    logger: {
      prettyPrint: true,
      level: 'error'
      // base: null,
      // timestamp: false,
    },
  });

  plugins(app);
  session(app);
  templatesEngine(app);
  assets(app);
  // errorHandler(app);
  routes(app);
  database(app);

  return app;
};
