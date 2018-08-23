const fp = require('fastify-plugin');

module.exports = fp((fastify, { salt }, next) => {
  const { bcrypt, moment, mongo } = fastify;

  const schema = {
    email: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    },
    verifiedDate: {
      type: Date
    }
  };

  const options = {
    timestamps: true
  };

  const schemaObj = new mongo.Schema(schema, options);
  schemaObj.pre('save', async function () {
    this.token = await bcrypt.hash(this.token, salt);
    this.verifiedDate = moment(new Date()).add(30, 'm').toDate();
  });

  fastify.decorate('ResetToken', mongo.model('ResetToken', schemaObj));
  next();
});
