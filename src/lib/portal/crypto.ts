import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scrypt,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";

import { env } from "@/lib/env";

const SCRYPT = { N: 16_384, r: 8, p: 1, keyLength: 64 } as const;
const HASH_VERSION = "scrypt1";
const SEAL_VERSION = "v1";

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

function sealKey(): Buffer {
  return createHash("sha256").update(env.PORTAL_LINK_SECRET).digest();
}

/** Encrypts a setup token so its link can be shown again; the hash stays the lookup key. */
export function sealToken(token: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", sealKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return [SEAL_VERSION, iv, cipher.getAuthTag(), ciphertext].map((part) => (typeof part === "string" ? part : part.toString("base64url"))).join("$");
}

/** Returns the token, or null when the value is malformed, tampered with, or sealed with another secret. */
export function openToken(sealed: string): string | null {
  const [version, iv, tag, ciphertext] = sealed.split("$");

  if (version !== SEAL_VERSION || !iv || !tag || !ciphertext) {
    return null;
  }

  try {
    const decipher = createDecipheriv("aes-256-gcm", sealKey(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
