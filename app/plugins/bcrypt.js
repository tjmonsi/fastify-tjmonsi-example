const bcrypt = require('bcrypt');
const fp = require('fastify-plugin');

module.exports = fp((fastify, opts, next) => {
  fastify.decorate('bcrypt', bcrypt);
  next();
});
