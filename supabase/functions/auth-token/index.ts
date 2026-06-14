import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';
import { decode } from 'https://deno.land/std@0.177.0/encoding/base64.ts';

const ALLOWED_ORIGINS = [
  'https://bossimclockedin.private-apps.tossmini.com',
  'http://localhost:5173',
];

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
});

async function decryptAesGcm(encryptedTextBase64: string, keyBase64: string, aadStr: string) {
  if (!encryptedTextBase64) return null;
  try {
    const IV_LENGTH = 12;
    const decoded = decode(encryptedTextBase64); // Uint8Array
    const keyByteArray = decode(keyBase64);
    
    const iv = decoded.slice(0, IV_LENGTH);
    const ciphertext = decoded.slice(IV_LENGTH);

    const key = await crypto.subtle.importKey(
      "raw",
      keyByteArray,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );

    const encoder = new TextEncoder();
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
        additionalData: encoder.encode(aadStr),
      },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (e) {
    console.error("Decryption failed:", e);
    return encryptedTextBase64;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req.headers.get('origin') || '') });
  }

  try {
    const { authorizationCode, referrer } = await req.json();

    if (!authorizationCode) {
      return new Response(JSON.stringify({ error: 'Missing authorizationCode' }), { status: 400, headers: corsHeaders(req.headers.get('origin') || '') });
    }

    const TOSS_API_BASE = 'https://apps-in-toss-api.toss.im';

    // 1. Get Toss Access Token
    const tokenRes = await fetch(`${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorizationCode, referrer }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: 'Token exchange failed', details: err }), { status: 400, headers: corsHeaders(req.headers.get('origin') || '') });
    }

    const tokenData = await tokenRes.json();
    if (tokenData.resultType !== 'SUCCESS') {
      return new Response(JSON.stringify({ error: 'Token exchange failed', details: tokenData }), { status: 400, headers: corsHeaders(req.headers.get('origin') || '') });
    }

    const accessToken = tokenData.success.accessToken;

    // 2. Get User Info
    const userRes = await fetch(`${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/login-me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userRes.ok) {
      const err = await userRes.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: 'User fetch failed', details: err }), { status: 400, headers: corsHeaders(req.headers.get('origin') || '') });
    }

    const userData = await userRes.json();
    if (userData.resultType !== 'SUCCESS') {
      return new Response(JSON.stringify({ error: 'User fetch failed', details: userData }), { status: 400, headers: corsHeaders(req.headers.get('origin') || '') });
    }

    let userProfile = userData.success;

    // 3. Decrypt User Info
    const aesKey = Deno.env.get('TOSS_AES_KEY') || '/QpO9bBSmn/11AQ601gb0NNOIU9Cws61pB2rrJCTcYI=';
    const aad = Deno.env.get('TOSS_AAD') || 'TOSS'; // Usually TOSS or app package name

    userProfile.name = await decryptAesGcm(userProfile.name, aesKey, aad);
    userProfile.phone = await decryptAesGcm(userProfile.phone, aesKey, aad);
    userProfile.birthday = await decryptAesGcm(userProfile.birthday, aesKey, aad);
    userProfile.ci = await decryptAesGcm(userProfile.ci, aesKey, aad);
    userProfile.gender = await decryptAesGcm(userProfile.gender, aesKey, aad);
    userProfile.nationality = await decryptAesGcm(userProfile.nationality, aesKey, aad);

    // 4. Generate Supabase Custom JWT
    const jwtSecret = Deno.env.get('CUSTOM_JWT_SECRET') || Deno.env.get('SUPABASE_AUTH_JWT_SECRET') || Deno.env.get('SUPABASE_JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT Secret is not configured in Edge Function environment variables.');
    }

    const secret = new TextEncoder().encode(jwtSecret);
    const alg = 'HS256';

    const jwt = await new jose.SignJWT({
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
      sub: String(userProfile.userKey),
      email: userProfile.email || `${userProfile.userKey}@toss.im`,
      phone: userProfile.phone || '',
      role: 'authenticated',
      user_key: String(userProfile.userKey), // For RLS policies
    })
      .setProtectedHeader({ alg, typ: 'JWT' })
      .sign(secret);

    return new Response(
      JSON.stringify({ success: true, customToken: jwt, user: userProfile }),
      { headers: { ...corsHeaders(req.headers.get('origin') || ''), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders(req.headers.get('origin') || '') }
    );
  }
});
