module.exports = (fastify, opts, next) => {
  const route = '/dashboard/user';
  const { User, ResetToken, auth, authByCookie, authByEmailAndPassword, bcrypt, chance } = fastify;

  // create new user
  fastify.post(`${route}`, {}, async (request, response) => {
    const { body } = request;
    const user = new User(body);
    try {
      await user.save();
      return {
        success: true,
        data: {
          id: user.id
        }
      };
    } catch (error) {
      response.status(500);
      return { success: false, error };
    }
  });

  // update user
  fastify.put(`${route}`, {
    beforeHandler: auth([
      authByCookie
    ])
  }, async (request, response) => {
    const { body, session } = request;
    const { userId: id } = session;
    try {
      if (!id) throw new Error('No user found');
      const doc = await User.findById(id).exec();
      if (!doc) throw new Error('No user found');
      doc.name = body.name;
      await doc.save();
      return { success: true };
    } catch (error) {
      response.status(500);
      return { success: false, error };
    }
  });

  // new password
  fastify.put(`${route}/new-password`, {
    beforeHandler: auth([
      fastify.authById
    ])
  }, async (request, response) => {
    const { body, session } = request;
    const { userId: id } = session;
    try {
      if (!id) throw new Error('You are not authorized');
      const doc = await User.findById(id).exec();
      if (!doc) throw new Error('No user found');
      doc.password = body.newPassword;
      await doc.save();
      return { success: true };
    } catch (error) {
      response.status(500);
      return { success: false, error };
    }
  });

  // send reset email
  fastify.post(`${route}/send-reset-email`, {}, (request, response) => {
    const { body } = request;
    const { email, host } = body;
    const token = chance.string({ length: 20 });
    const resetToken = new ResetToken({ email, token });
    resetToken.save()
      .then(doc => {
        const url = `${host}/reset-email/${doc.id}/${encodeURI(token)}`;
        fastify.nodemailer.sendMail({
          from: opts.email.email,
          to: email,
          subject: 'Reset Password for Hele Registry',
          text: `Please visit this url to reset your password: ${url}`
        }, error => {
          if (error) throw error;
          response.send({
            success: true
          });
        });
      })
      .catch(error => {
        console.log(error);
        response.status(500);
        response.send({
          success: false,
          error
        });
      });
  });

  // verify reset-password
  fastify.get(`${route}/verify-reset-password/:id/:token`, {}, async (request, response) => {
    const { params } = request;
    const { id, token } = params;
    try {
      const resetToken = await ResetToken.findById(id).exec();
      const today = new Date();
      const flag = await bcrypt.compare(token, resetToken.token);
      if (!resetToken || !flag) throw new Error('Token given is not correct');
      if (today > resetToken.verifiedDate) throw new Error('Token has expired');
      return { success: true };
    } catch (error) {
      response.status(500);
      return { success: false, error };
    }
  });

  // reset password
  fastify.post(`${route}/verify-reset-password/:id/:token`, {}, async (request, response) => {
    const { params, body } = request;
    const { id, token, email } = params;
    const { newPassword } = body;
    try {
      const resetToken = await ResetToken.findById(id).exec();
      const today = new Date();
      const flag = await bcrypt.compare(token, resetToken.token);
      if (!resetToken || !flag) throw new Error('Token given is not correct');
      if (today > resetToken.verifiedDate) throw new Error('Token has expired');

      const user = await User.findOne({ email }).exec();
      if (!user) throw new Error('User doesn\'t exists');
      user.password = newPassword;
      await user.save();
      await resetToken.remove();

      return { success: true };
    } catch (error) {
      response.status(500);
      return { success: false, error };
    }
  });

  // login
  fastify.post('/dashboard/login', {
    beforeHandler: auth([
      authByEmailAndPassword
    ])
  }, async () => ({
    success: true
  }));

  // logout
  fastify.get('/dashboard/authenticate', {
    beforeHandler: auth([
      authByCookie
    ])
  }, async () => ({
    success: true
  }));

  fastify.get('/dashboard/logout', {
    beforeHandler: auth([
      authByCookie
    ])
  }, async (request, response) => {
    request.session.userId = null;
    return { success: true };
  });

  next();
};
