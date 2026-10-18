import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export function ensureRsaKeys(): { privateKey: string; publicKey: string } {
  const keysDir = path.resolve(__dirname, '../../..', 'keys');
  const privateKeyPath = path.join(keysDir, 'rsa_private.pem');
  const publicKeyPath = path.join(keysDir, 'rsa_public.pem');

  if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
    return {
      privateKey: fs.readFileSync(privateKeyPath, 'utf8'),
      publicKey: fs.readFileSync(publicKeyPath, 'utf8'),
    };
  }

  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }

  // Generate 2048-bit RSA key pair for PS512 (RSA-PSS with SHA-512)
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });
  fs.writeFileSync(publicKeyPath, publicKey, { mode: 0o644 });

  console.log('✓ Successfully generated 2048-bit RSA keypair for JWT PS512 algorithm in keys/');
  return { privateKey, publicKey };
}
