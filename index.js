import dotenv from 'dotenv';
import Koa from 'koa';
import Rollbar from 'rollbar';

dotenv.config();
const app = new Koa();
const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true
});


app.on('error', err => rollbar.error(err));
app.use(async ctx => {
  ctx.body = 'Hello world!';
});

app.listen(process.env.PORT);
