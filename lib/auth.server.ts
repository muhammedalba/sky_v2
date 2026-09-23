import { errors, importSPKI, jwtVerify, type JWTPayload } from "jose";
import { getServerUserFromToken } from "@/lib/auth";
import { User } from "@/types";

// Server-only: never import this from a "use client" module.
// The API signs access tokens with its ES256 private key; this server only
// holds the public key, so it can verify tokens but never mint them.

const ALG = "ES256";
let publicKeyPromise: ReturnType<typeof importSPKI> | null = null;

function getPublicKey() {
  const pem = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, "\n");
  if (!pem) return null;
  publicKeyPromise ??= importSPKI(pem, ALG);
  return publicKeyPromise;
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  const key = getPublicKey();
  if (!key) {
    console.error("JWT_PUBLIC_KEY is not set — treating all tokens as unauthenticated");
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, await key, { algorithms: [ALG] });
    return payload;
  } catch (e) {
    // jose checks the signature before claims, so JWTExpired means the token is
    // authentic but expired — keep the user; the client refresh flow renews it.
    if (e instanceof errors.JWTExpired) return e.payload;
    return null; // forged, tampered or malformed
  }
}

/** Returns the user from a signature-verified access token, or null. */
export async function getVerifiedServerUser(token: string): Promise<Partial<User> | null> {
  if (!token) return null;
  return (await verifyToken(token)) ? getServerUserFromToken(token) : null;
}
