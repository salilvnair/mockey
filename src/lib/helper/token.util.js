// token.util.js
const jwt = require('jsonwebtoken');
const { jwtPrivateKeySync } = require('./key.util');

exports.generateIdToken = function (userId, expiresIn = '1h') {
  const privateKey = jwtPrivateKeySync();

  const payload = {
    sub: userId,
    iss: 'http://localhost:31333',
    aud: 'mockey-oidc',
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: expiresIn,
    keyid: 'dev-1'
  });
};
