const path = require('path');

module.exports = (fastify, opts, next) => {
  fastify.register(require('fastify-static'), {
    root: path.join(__dirname, '../../public')
  });
  next();
};
