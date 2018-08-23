module.exports = (fastify, opts, next) => {
  fastify.get('/api', async () => ({
    hello: 'world'
  }));

  next();
};
