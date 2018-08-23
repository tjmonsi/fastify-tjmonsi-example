const fp = require('fastify-plugin');

module.exports = fp((fastify, opts, next) => {
  fastify.decorate('moment', require('moment'));
  next();
});
