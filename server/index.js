import dotenv from 'dotenv';
import qs from 'qs';
import fastify from 'fastify';
import fastifyQs from 'fastify-qs';
import fastifyErrorPage from 'fastify-error-page';
import fastifyFormbody from 'fastify-formbody';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import fastifyMethodOverride from 'fastify-method-override-wrapper';
import fastifyObjection from 'fastify-objectionjs';
import fastifyPassport from 'fastify-passport';
import fastifySensible from 'fastify-sensible';
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
const isProduction = mode === 'production';

const addErrorHandler = (app) => {
  if (isDevelopment) {
    app.register(fastifyErrorPage);
  }
  if (isProduction) {
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
      route: (name, args, options) => app.reverse(name, args, options),
    },
  });
  app.decorateReply('render', async function render(viewPath, locals) {
    return this.view(viewPath, {
      ...locals,
      reply: this,
    });
  });
};
const addAssets = (app) => {
  if (isDevelopment) {
    app.register(fastifyWebpackHMR, {
      config: path.join(__dirname, '..', 'webpack.config.js'),
    });
  }
  if (isProduction) {
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
  app.register(fastifySensible);
  app.register(fastifyFormbody, { parser: (str) => qs.parse(str) });
  app.register(fastifyQs, {});
  app.register(fastifyReverseRoutes);
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
      failureFlash: app.t('views.auth.flash.fail'),
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
const createLoggedApp = () => {
  const app = fastifyMethodOverride(fastify)({
    logger: {
      serializers: {
        req: (it) => _.pick(it, 'method', 'url', 'query'),
        res: (it) => _.pick(it, 'statusCode'),
      },
    },
  });
  app.addHook('preHandler', async (req) => {
    if (req.body) {
      req.log.info({ body: req.body });
    }
  });
  return app;
};
export default () => {
  const app = createLoggedApp();
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
