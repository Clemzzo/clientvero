import "server-only";

import { createHash, randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

const SCRYPT = { N: 16_384, r: 8, p: 1, keyLength: 64 } as const;
const HASH_VERSION = "scrypt1";

function deriveKey(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, SCRYPT.keyLength, options, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return [HASH_VERSION, SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [version, N, r, p, salt, expected] = stored.split("$");

  if (version !== HASH_VERSION || !salt || !expected) {
    return false;
  }

  const expectedKey = Buffer.from(expected, "base64url");
  const key = await deriveKey(password, Buffer.from(salt, "base64url"), { N: Number(N), r: Number(r), p: Number(p) });
  return key.length === expectedKey.length && timingSafeEqual(key, expectedKey);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function newToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}
