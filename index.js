import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Koa from 'koa';
import Logger from 'koa-logger';
import Pug from 'koa-pug';
import _ from 'lodash';
import path from 'path';
import Rollbar from 'rollbar';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

const app = new Koa();
const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true
});

const pug = new Pug({
  viewPath: path.resolve(__dirname, 'views'),
  basedir: path.join(__dirname, 'views'),
});
pug.use(app);

app.use(Logger());
const logError = (error) => {
  if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
    console.error(error);
  } else {
    rollbar.error(error);
  }
}
app.on('error', logError);

app.use(async ctx => {
  await ctx.render('index');
});

app.listen(process.env.PORT);
console.log('STARTED!')
