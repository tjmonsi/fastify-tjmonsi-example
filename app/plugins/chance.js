const Chance = require('chance');
const fp = require('fastify-plugin');

module.exports = fp((fastify, opts, next) => {
  const chance = new Chance();
  fastify.decorate('chance', chance);
  next();
});
