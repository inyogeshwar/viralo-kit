import crypto from "node:crypto";

import { env } from "@/lib/env";

const PREFIX = "enc:v1:";

function deriveKey(): Buffer {
  if (env.encryptionKey) {
    const key = Buffer.from(env.encryptionKey, "hex");
    if (key.length === 32) return key;
  }
  return crypto.createHash("sha256").update("social-copilot-dev-key").digest();
}

export function encryptToken(plain: string): string {
  if (!plain) return plain;
  const key = deriveKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${Buffer.concat([iv, tag, encrypted]).toString("base64")}`;
}

export function decryptToken(stored: string): string {
  if (!stored) return stored;
  if (!stored.startsWith(PREFIX)) return stored;
  const raw = Buffer.from(stored.slice(PREFIX.length), "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const data = raw.subarray(28);
  const key = deriveKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
