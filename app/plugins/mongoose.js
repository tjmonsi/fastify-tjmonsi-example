const mongoose = require('mongoose');
const fp = require('fastify-plugin');

module.exports = fp(async (fastify, { mongoose: options }, next) => {
  const { uri } = options;
  const opts = { ...options };
  delete opts.uri;
  try {
    await mongoose.connect(uri, opts);
    fastify
      .decorate('mongo', mongoose)
      .addHook('onClose', function (fastify, done) {
        fastify.mongo.db.close(done);
      });

    next();
  } catch (error) {
    next(error);
  }
});
