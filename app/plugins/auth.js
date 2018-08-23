const fp = require('fastify-plugin');

module.exports = fp((fastify, opts, next) => {
  fastify.decorate('authByEmailAndPassword', async (request, response, next) => {
    const { body } = request;
    const { password, email } = body;
    try {
      const doc = await fastify.User.findOne({ email }).exec();
      if (doc) {
        const flag = await fastify.bcrypt.compare(password, doc.password);
        if (!flag) {
          throw new Error('Wrong password');
        }
      } else {
        throw new Error('No user found');
      }
      request.session.userId = doc.id;
      next();
    } catch (error) {
      next(error);
    }
  });

  fastify.decorate('authByCookie', async (request, response, next) => {
    const { session } = request;
    const { userId: id } = session;
    try {
      if (!id) throw new Error('You are not authorized');
      const doc = await fastify.User.findById(id).exec();
      if (!doc) throw new Error('No user found');
      next();
    } catch (error) {
      next(error);
    }
  });

  fastify.decorate('authByToken', async (request, response, next) => {
    const { headers } = request;
    const { authorization } = headers;
    try {
      if (!authorization) throw new Error('No Authorization header');
      const [ api, token ] = authorization.split('::');
      if (!api || !token) throw new Error('No api/token key found');
      const tokenObj = await fastify.Token.findOne({ api }).exec();
      if (!tokenObj) throw new Error('No api/token key found');
      const flag = fastify.bcrypt.compare(token, tokenObj.token);
      if (!flag) throw new Error('Api/token key pair are incorrect');
      next();
    } catch (error) {
      next(error);
    }
  });

  fastify.decorate('authById', async (request, response, next) => {
    const { body, session } = request;
    const { password } = body;
    const { userId: id } = session;
    try {
      if (!id) throw new Error('You are not authorized');
      const doc = await fastify.User.findById(id).exec();
      if (doc) {
        const flag = await fastify.bcrypt.compare(password, doc.password);
        if (!flag) {
          throw new Error('Wrong password');
        }
      } else {
        throw new Error('No user found');
      }
      next();
    } catch (error) {
      next(error);
    }
  });
  fastify.register(require('fastify-auth'));
  next();
});
