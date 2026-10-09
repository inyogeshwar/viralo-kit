import crypto from "crypto";
import { config } from "@/lib/config";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derives a 32-byte key from the environment encryption key.
 * If the environment key is empty, it will throw an error to fail securely.
 */
function getKey(): Buffer {
  const secret = config.security.encryptionKey;
  if (!secret) {
    throw new Error("ENCRYPTION_KEY environment variable is missing.");
  }
  // If the secret is exactly 32 bytes (64 hex chars), use it directly
  if (secret.length === 64) {
    return Buffer.from(secret, "hex");
  }
  // Otherwise, hash it to get 32 bytes
  return crypto.createHash("sha256").update(String(secret)).digest();
}

/**
 * Encrypts a plain text string using AES-256-GCM.
 * Output format: hex(iv):hex(auth_tag):hex(encrypted)
 */
export function encryptToken(text: string): string {
  if (!text) return "";
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an encrypted token string formatted as hex(iv):hex(auth_tag):hex(encrypted).
 */
export function decryptToken(encryptedData: string): string {
  if (!encryptedData) return "";
  
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format.");
  }
  
  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encryptedText = Buffer.from(parts[2], "hex");
  
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, undefined, "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
