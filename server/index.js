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
import addRoutes from './routes';

dotenv.config();

const mode = process.env.NODE_ENV || 'development';
const isDevelopment = mode === 'development';
const isTest = mode === 'test';

const addErrorHandler = async (app) => {
  if (isTest) {
    return;
  }
  if (isDevelopment) {
    await app.register(fastifyErrorsProperties);
  } else {
    const rollbar = new Rollbar({
      accessToken: process.env.ROLLBAR_TOKEN,
      captureUncaught: true,
      captureUnhandledRejections: true,
    });
    app.addHook('onError', async (err) => rollbar.error(err));
  }
};
const addTemplatesEngine = async (app) => {
  await app.register(pointOfView, {
    engine: {
      pug,
    },
    includeViewExtension: true,
    root: path.join(__dirname, 'views'),
    defaultContext: _,
  });
  app.decorateReply('render', function render(viewPath, locals) {
    return this.view(viewPath, {
      ...locals,
      reply: this,
    });
  });
};
const addAssets = async (app) => {
  if (isTest) {
    return;
  }
  if (isDevelopment) {
    await app.register(fastifyWebpackHMR, {
      config: path.join(__dirname, '..', 'webpack.config.js'),
    });
  } else {
    await app.register(fastifyStatic, {
      root: path.join(__dirname, '..', 'assets'),
      prefix: '/assets',
    });
  }
};
const addDatabase = async (app) => {
  await app.register(fastifyObjection, {
    knexConfig: knexConfig[mode],
    models,
  });
};
const addPlugins = async (app) => {
  await app.register(fastifyFormbody);
  await app.register(fastifyMethodOverride);
};
const addSession = async (app) => {
  await app.register(fastifySecureSession, {
    secret: process.env.SECRET,
    salt: process.env.SALT,
  });
  app.addHook('preHandler', async (req) => {
    const userId = req.session.get('userId');
    if (userId !== undefined) {
      req.currentUser = await app.objection.models.user.query().findById(userId);
    }
  });
};

export default async () => {
  const app = fastify({
    logger: {
      prettyPrint: true,
      level: 'error',
    },
  });
  await addPlugins(app);
  await addSession(app);
  await addTemplatesEngine(app);
  await addAssets(app);
  await addErrorHandler(app);
  await addDatabase(app);
  addRoutes(app);

  return app;
};
