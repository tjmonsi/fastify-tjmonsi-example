const fp = require('fastify-plugin');

module.exports = fp((fastify, { salt }, next) => {
  const schema = {
    name: String,
    password: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    }
  };

  const options = {
    timestamps: true
  };

  const schemaObj = new fastify.mongo.Schema(schema, options);
  schemaObj.pre('save', async function () {
    if (this.password) {
      this.password = await fastify.bcrypt.hash(this.password, salt);
    }
  });

  fastify.decorate('User', fastify.mongo.model('User', schemaObj));
  next();
});
