const jwt = require('jsonwebtoken');
exports.generateIdToken = function (userId, secret, expiresIn = '1h') {
    const payload = {
        sub: userId,
        iss: 'your-issuer',
        iat: Math.floor(Date.now() / 1000),
      };
    
      return jwt.sign(payload, secret, { algorithm: 'HS256', expiresIn });
}