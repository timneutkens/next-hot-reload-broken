const routes = (module.exports = require('next-routes')());

routes.add('/:path*', 'router');
