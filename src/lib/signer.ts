import { sign as cryptoSign, verify as cryptoVerify, generateKeyPairSync } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const KEY_DIR = process.env.VANTAGE_KEY_DIR ?? join(process.cwd(), ".keys");
const PRIV_PATH = join(KEY_DIR, "vantage.key");
const PUB_PATH = join(KEY_DIR, "vantage.pub");

function ensureKeys() {
  if (existsSync(PRIV_PATH) && existsSync(PUB_PATH)) return;
  mkdirSync(KEY_DIR, { recursive: true });
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  writeFileSync(
    PRIV_PATH,
    privateKey.export({ type: "pkcs8", format: "pem" }) as string,
    { mode: 0o600 }
  );
  writeFileSync(
    PUB_PATH,
    publicKey.export({ type: "spki", format: "pem" }) as string
  );
}

export function sign(payload: object): string {
  ensureKeys();
  const priv = readFileSync(PRIV_PATH, "utf8");
  const data = Buffer.from(JSON.stringify(payload));
  return cryptoSign(null, data, priv).toString("base64");
}

export function verify(payload: object, signature: string): boolean {
  ensureKeys();
  const pub = readFileSync(PUB_PATH, "utf8");
  const data = Buffer.from(JSON.stringify(payload));
  return cryptoVerify(null, data, pub, Buffer.from(signature, "base64"));
}

export function publicKeyPem(): string {
  ensureKeys();
  return readFileSync(PUB_PATH, "utf8");
}

export interface Attestation {
  tool: string;
  timestamp: string;
  result: Record<string, unknown>;
  signature: string;
}

export function attest(tool: string, result: Record<string, unknown>): Attestation {
  const payload = { tool, timestamp: new Date().toISOString(), result };
  return { ...payload, signature: sign(payload) };
}
