import dotenv from 'dotenv';
import fastify from 'fastify';
import fastifyErrorsProperties from 'fastify-errors-properties';
import fastifyFlash from 'fastify-flash';
import fastifyFormbody from 'fastify-formbody';
import fastifyMethodOverride from 'fastify-method-override';
import fastifyObjection from 'fastify-objectionjs';
import fastifySecureSession from 'fastify-secure-session';
import fastifyStatic from 'fastify-static';
import fastifyWebpackHMR from 'fastify-webpack-hmr';
import i18next from 'i18next';
import _ from 'lodash';
import path from 'path';
import pointOfView from 'point-of-view';
import pug from 'pug';
import Rollbar from 'rollbar';
import knexConfig from '../knexfile';
import { en } from './locales';
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
    defaultContext: {
      _,
      t: (key) => i18next.t(key),
    },
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
  app.register(fastifyFlash);
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
const addLocalization = () => {
  i18next
    .init({
      lng: 'en',
      fallbackLng: 'en',
      debug: isDevelopment,
      resources: { en },
    });
};
export default async () => {
  const app = fastify({
    logger: {
      prettyPrint: isDevelopment,
    },
  });
  await addSession(app);
  await addPlugins(app);
  addLocalization();
  await addTemplatesEngine(app);
  await addAssets(app);
  await addErrorHandler(app);
  await addDatabase(app);
  addRoutes(app);

  return app;
};
