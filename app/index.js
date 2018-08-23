'use strict';

const path = require('path');
const AutoLoad = require('fastify-autoload');
const config = require('../server.config.js');

module.exports = (fastify, opts, next) => {
  const options = { ...opts, ...config };

  // Do not touch the following lines
  fastify.register(require('fastify-cookie'));
  fastify.register(require('fastify-caching'));
  fastify.register(require('fastify-server-session'), options.session);
  fastify.register(require('fastify-nodemailer'), {
    service: 'gmail',
    auth: {
      user: options.email.username,
      pass: options.email.password
    }
  });

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'schemas'),
    options
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options
  });

  // fastify.register(require('./routes/auth.js'));
  // This loads all plugins defined in services
  // define your routes in one of these
  // fastify.register(AutoLoad, {
  //   dir: path.join(__dirname, 'services')
  // })

  // Make sure to call next when done
  next();
};
