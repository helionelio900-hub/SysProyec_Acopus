export interface PkcePair {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Genera el par PKCE (code_verifier y code_challenge con SHA-256)
 * y el parámetro state para proteger contra ataques CSRF (S11 - Paso 3.2).
 */
export async function generarPkce(): Promise<PkcePair> {
  const verifierBytes = new Uint8Array(32);
  crypto.getRandomValues(verifierBytes);
  const codeVerifier = base64UrlEncode(verifierBytes.buffer);

  const encoder = new TextEncoder();
  const verifierBuffer = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', verifierBuffer);
  const codeChallenge = base64UrlEncode(hash);

  const stateBytes = new Uint8Array(16);
  crypto.getRandomValues(stateBytes);
  const state = base64UrlEncode(stateBytes.buffer);

  return { codeVerifier, codeChallenge, state };
}
