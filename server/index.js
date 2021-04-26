import dotenv from 'dotenv';
import fastify from 'fastify';
import fastifyErrorsProperties from 'fastify-errors-properties';
import fastifyFormbody from 'fastify-formbody';
import fastifyMethodOverride from 'fastify-method-override-wrapper';
import fastifyObjection from 'fastify-objectionjs';
import fastifyPassport from 'fastify-passport';
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
import FormPassportStrategy from './lib/FormPassportStrategy';
import ru from './locales';
import models from './models/index';
import addRoutes from './routes';

dotenv.config();

const mode = process.env.NODE_ENV || 'development';
const isDevelopment = mode === 'development';
const isTest = mode === 'test';

const addErrorHandler = (app) => {
  if (isTest) {
    return;
  }
  if (isDevelopment) {
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
const addTemplatesEngine = (app) => {
  app.register(pointOfView, {
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
const addAssets = (app) => {
  if (isTest) {
    return;
  }
  if (isDevelopment) {
    app.register(fastifyWebpackHMR, {
      config: path.join(__dirname, '..', 'webpack.config.js'),
    });
  } else {
    app.register(fastifyStatic, {
      root: path.join(__dirname, '..', 'assets'),
      prefix: '/assets',
    });
  }
};
const addDatabase = (app) => {
  app.register(fastifyObjection, {
    knexConfig: knexConfig[mode],
    models,
  });
};
const addPlugins = (app) => {
  app.register(fastifyFormbody);
};
const addAuthentification = (app) => {
  app.register(fastifySecureSession, {
    secret: process.env.SECRET,
    salt: process.env.SALT,
    cookie: {
      path: '/',
    },
  });
  app.register(fastifyPassport.initialize());
  app.register(fastifyPassport.secureSession());
  fastifyPassport.use('form', new FormPassportStrategy('form', app));
  fastifyPassport.registerUserSerializer(async (user) => user.id);
  fastifyPassport.registerUserDeserializer(
    async (userId) => app.objection.models.user.query().findById(userId),
  );
  app.decorate('passport', fastifyPassport);
  app.decorate('formAuth', (...args) => fastifyPassport.authenticate(
    'form',
    {
      failureRedirect: '/',
      failureFlash: app.t('flash.fail.auth'),
    },
  )(...args));
};
const addHooks = (app) => {
  app.addHook('preHandler', async (req, reply) => {
    // eslint-disable-next-line
    reply.locals = {
      isAuthenticated: () => req.isAuthenticated(),
    };
  });
};
const addLocalization = (app) => {
  i18next
    .init({
      lng: 'ru',
      fallbackLng: 'en',
      debug: isDevelopment,
      resources: { ru },
    });
  app.decorate('t', (key) => i18next.t(key));
};
export default () => {
  const app = fastifyMethodOverride(fastify)({
    logger: {
      prettyPrint: isDevelopment,
      level: isDevelopment ? 'trace' : 'info',
    },
  });
  addHooks(app);
  addPlugins(app);
  addAuthentification(app);
  addLocalization(app);
  addTemplatesEngine(app);
  addAssets(app);
  addErrorHandler(app);
  addDatabase(app);
  addRoutes(app);

  return app;
};
