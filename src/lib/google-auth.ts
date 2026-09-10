import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

/* Google service-account auth, signed by hand (same approach as LeadFlow):
   two REST calls don't justify the 100 MB googleapis package. Read-only scope —
   this app never writes to the sheets. */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

function loadServiceAccount(): ServiceAccount {
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  let raw: string;
  if (inline && inline.trim().startsWith("{")) raw = inline;
  else if (path) raw = readFileSync(path, "utf8");
  else throw new Error("No Google credentials configured (GOOGLE_SERVICE_ACCOUNT_JSON).");

  const parsed = JSON.parse(raw) as Partial<ServiceAccount>;
  if (!parsed.client_email || !parsed.private_key) {
    throw new Error("Service-account JSON is missing client_email or private_key.");
  }
  return {
    client_email: parsed.client_email,
    private_key: parsed.private_key.replace(/\\n/g, "\n"),
  };
}

const b64url = (input: string | Buffer) =>
  Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

let cache: { token: string; expiresAt: number } | null = null;

export async function accessToken(): Promise<string> {
  if (cache && Date.now() < cache.expiresAt) return cache.token;

  const sa = loadServiceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = b64url(signer.sign(sa.private_key));

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  const body = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!res.ok || !body.access_token) {
    throw new Error(`Google refused the credentials (${res.status}): ${body.error_description ?? "unknown"}`);
  }
  cache = { token: body.access_token, expiresAt: Date.now() + ((body.expires_in ?? 3600) - 120) * 1000 };
  return cache.token;
}
