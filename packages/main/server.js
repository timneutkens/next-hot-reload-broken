const next = require('next');
const express = require('express');
const routes = require('./routes');

const app = next({
  dev: process.env.NODE_ENV !== 'production',
});

app.prepare().then(() => {
  const server = express();
  server.use(routes.getRequestHandler(app));
  server.listen(3000);
});
