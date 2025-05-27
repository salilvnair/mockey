const fs = require('fs');
const path = require('path');
const jose = require('node-jose');

const PRIVATE_KEY_PATH = path.join(__dirname, 'jwk', 'private.pem');
const PUBLIC_KEY_PATH = path.join(__dirname, 'jwk', 'public.pem');
const JWKS_PATH = path.join(__dirname, '..', '..', '..', 'response', 'jwk', 'mock-jwks.json');


function generateRsaKeyPairSync() {
  if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
    console.log('🔁 RSA key pair already exists. Skipping generation.');
    return;
  }

  const deasync = require('deasync');
  let done = false;
  let error = null;
  let key;

  jose.JWK.createKey('RSA', 2048, {
    alg: 'RS256',
    use: 'sig',
    kid: 'dev-1'
  }).then(result => {
    key = result;
    done = true;
  }).catch(err => {
    error = err;
    done = true;
  });

  deasync.loopWhile(() => !done);
  if (error) throw error;

  fs.writeFileSync(PRIVATE_KEY_PATH, key.toPEM(true));
  fs.writeFileSync(PUBLIC_KEY_PATH, key.toPEM(false));
  fs.writeFileSync(JWKS_PATH, JSON.stringify({ keys: [key.toJSON()] }, null, 2));

  console.log('✅ RSA key pair and JWKS generated');
}

function jwtPrivateKeySync() {
  generateRsaKeyPairSync(); // ensure keys exist
  return fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
}

module.exports = {
    jwtPrivateKeySync
};
