let session;
let email;

try {
  session = require('./secret/session.json');
  email = require('./secret/mail.json');
} catch (e) {
  console.log(e);
}

module.exports = {
  salt: 10,
  mongoose: {
    uri: 'mongodb://localhost:27017/test_db',
    useNewUrlParser: true
  },
  session: {
    cookieName: 'SentiFastifyExample',
    sessionMaxAge: 3600000,
    cookie: {
      maxAge: 3600000,
      domain: '127.0.0.1:8080'
    },
    ...session
  },
  email
};
