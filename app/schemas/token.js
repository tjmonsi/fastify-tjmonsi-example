const fp = require('fastify-plugin');

module.exports = fp((fastify, { salt }, next) => {
  const { bcrypt, mongo } = fastify;

  const schema = {
    userId: {
      type: String,
      required: true,
      index: true
    },
    api: {
      type: String,
      required: true,
      unique: true
    },
    secret: {
      type: String,
      required: true
    }
  };

  const options = {
    timestamps: true
  };

  const schemaObj = new mongo.Schema(schema, options);
  schemaObj.pre('save', async function () {
    this.secret = await bcrypt.hash(this.secret, salt);
  });

  fastify.decorate('Token', mongo.model('Token', schemaObj));
  next();
});
