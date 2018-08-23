module.exports = (fastify, opts, next) => {
  const route = '/token';
  const { Token, User, auth, authByCookie, authByToken, chance } = fastify;

  fastify.get(`${route}/create`, {
    beforeHandler: auth([
      authByCookie
    ])
  }, async (request, response) => {
    const { session } = request;
    const { userId } = session;
    const api = chance.string({ length: 20 });
    const secret = chance.string({ length: 40 });
    const token = new Token({ api, secret, userId });
    try {
      const user = await User.findById(userId).exec();
      if (!user) throw new Error('No User found');
      const oldToken = await Token.findOne({ userId }).exec();
      if (oldToken) oldToken.remove();
      await token.save();
      return {
        success: true,
        data: {
          api,
          secret
        }
      };
    } catch (error) {
      console.log(error);
      response.status(500);
      return { success: false, error };
    }
  });

  fastify.get(`${route}/verify`, {
    beforeHandler: auth([
      authByToken
    ])
  }, async (request, response) => {
    return { success: true };
  });

  next();
};
