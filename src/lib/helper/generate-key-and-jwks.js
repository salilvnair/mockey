const fs = require('fs');
const path = require('path');
const jose = require('node-jose');

const PRIVATE_KEY_FILE = path.resolve(__dirname, 'private.pem');
const PUBLIC_KEY_FILE = path.resolve(__dirname, 'public.pem');
const JWKS_FILE = path.resolve(__dirname, 'mock-jwks.json');

(async () => {
  try {
    // 1. Generate a 2048-bit RSA key pair
    const key = await jose.JWK.createKey('RSA', 2048, {
      alg: 'RS256',
      use: 'sig',
      kid: 'dev-1'
    });

    // 2. Save private.pem
    const privatePem = key.toPEM(true);
    fs.writeFileSync(PRIVATE_KEY_FILE, privatePem);
    console.log('✅ Saved private key to private.pem');

    // 3. Save public.pem
    const publicPem = key.toPEM(false);
    fs.writeFileSync(PUBLIC_KEY_FILE, publicPem);
    console.log('✅ Saved public key to public.pem');

    // 4. Save JWKS file
    const jwks = { keys: [key.toJSON()] };
    fs.writeFileSync(JWKS_FILE, JSON.stringify(jwks, null, 2));
    console.log('✅ Saved JWKS to mock-jwks.json');

  } catch (err) {
    console.error('❌ Error generating keys or JWKS:', err);
  }
})();
