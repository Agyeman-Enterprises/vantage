import { sign, verify } from "./dist/lib/signer.js";

const payload = { test: "hello", timestamp: new Date().toISOString() };
try {
  const signature = sign(payload);
  console.log("✅ Signed successfully.");
  console.log("Signature:", signature);

  const ok = verify(payload, signature);
  if (ok) {
    console.log("✅ Verified successfully.");
  } else {
    console.log("❌ Verification failed.");
    process.exit(1);
  }
} catch (e) {
  console.error("❌ Error during sign/verify:", e);
  process.exit(1);
}
