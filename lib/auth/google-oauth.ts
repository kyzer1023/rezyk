const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/forms.responses.readonly",
  "https://www.googleapis.com/auth/forms.body.readonly",
];

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export function getOAuthConfig() {
  return {
    clientId: requireEnv("GOOGLE_CLIENT_ID"),
    clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
    redirectUri: requireEnv("GOOGLE_REDIRECT_URI"),
  };
}

export function buildConsentUrl(state?: string): string {
  const config = getOAuthConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
  });
  if (state) params.set("state", state);
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export interface TokenSet {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
  scope: string;
}

export async function exchangeCodeForTokens(code: string): Promise<TokenSet> {
  const config = getOAuthConfig();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Token exchange failed: ${data.error} — ${data.error_description}`);
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? null,
    expiresAt: Date.now() + (data.expires_in as number) * 1000,
    scope: data.scope,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenSet> {
  const config = getOAuthConfig();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Token refresh failed: ${data.error} — ${data.error_description}`);
  }

  return {
    accessToken: data.access_token,
    refreshToken,
    expiresAt: Date.now() + (data.expires_in as number) * 1000,
    scope: data.scope ?? "",
  };
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export async function fetchUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user info: ${res.status}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture ?? "",
  };
}
