/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT access token
 *         userId:
 *           type: string
 *           format: uuid
 *         phone:
 *           type: string
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         details:
 *           type: array
 *           items:
 *             type: string
 *     BalanceResponse:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         balance:
 *           type: number
 *           description: Current balance in won
 *     DepositResponse:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         balance:
 *           type: number
 *         deposited:
 *           type: number
 *     TransferResponse:
 *       type: object
 *       properties:
 *         transactionId:
 *           type: string
 *         amount:
 *           type: number
 *         receiverPhone:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     TransactionItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         amount:
 *           type: number
 *         kind:
 *           type: string
 *           enum: [transfer, deposit]
 *         direction:
 *           type: string
 *           enum: [sent, received]
 *         counterpartyPhone:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     TransactionList:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TransactionItem'
 *         nextCursor:
 *           type: string
 *           nullable: true
 */

import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { v5 as uuidv5 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import { query } from "../db/client.js";
import { config } from "../config/index.js";
import { validate, registerSchema, loginSchema } from "../middleware/validation.js";
import type { RegisterBody, LoginBody, JwtPayload } from "../models/index.js";
import axios from "axios";
import https from "https";
import fs from "fs";
import crypto from "crypto";
import path from "path";

const router = Router();

function signToken(payload: JwtPayload): string {
  const secret = Buffer.from(config.jwt.secret);
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as unknown as number,
  };
  return jwt.sign(payload as object, secret, options);
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "test1234"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate phone number
 */
router.post(
  "/register",
  validate(registerSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { phone, password }: RegisterBody = req.body;

    try {
      const existing = await query("SELECT id FROM users WHERE phone = $1", [phone]);
      if (existing.rows.length > 0) {
        res.status(409).json({ error: "이미 등록된 휴대폰 번호입니다." });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const client = await query(
        `WITH new_user AS (
           INSERT INTO users (phone, password_hash) VALUES ($1, $2) RETURNING id
         )
         INSERT INTO accounts (user_id) SELECT id FROM new_user
         RETURNING (SELECT id FROM new_user) AS user_id`,
        [phone, passwordHash],
      );

      const userId = client.rows[0].user_id;
      const token = signToken({ userId, phone });

      res.status(201).json({ token, userId, phone });
    } catch (err) {
      console.error("register error:", err);
      res.status(500).json({ error: "회원가입에 실패했습니다." });
    }
  },
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with phone and password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *               password:
 *                 type: string
 *                 example: "test1234"
 *     responses:
 *       200:
 *         description: Login success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post(
  "/login",
  validate(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { phone, password }: LoginBody = req.body;

    try {
      const result = await query(
        "SELECT id, password_hash FROM users WHERE phone = $1",
        [phone],
      );

      if (result.rows.length === 0) {
        res.status(401).json({ error: "등록되지 않은 휴대폰 번호입니다." });
        return;
      }

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
        return;
      }

      const token = signToken({ userId: user.id, phone });

      res.json({ token, userId: user.id, phone });
    } catch (err) {
      console.error("login error:", err);
      res.status(500).json({ error: "로그인에 실패했습니다." });
    }
  },
);

function decryptAesGcm(encryptedTextBase64: string, keyBase64: string, aadStr: string) {
  if (!encryptedTextBase64) return null;
  try {
    const IV_LENGTH = 12;
    const decoded = Buffer.from(encryptedTextBase64, "base64");
    const key = Buffer.from(keyBase64, "base64");

    const iv = decoded.subarray(0, IV_LENGTH);
    const ciphertext = decoded.subarray(IV_LENGTH, decoded.length - 16);
    const authTag = decoded.subarray(decoded.length - 16);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(aadStr));

    let decrypted = decipher.update(ciphertext);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
  } catch (e) {
    console.error("Decryption failed:", e);
    throw new Error(`Decryption failed: ${e instanceof Error ? e.message : String(e)}`);
  }
}

/**
 * @swagger
 * /auth/toss:
 *   post:
 *     summary: Toss OAuth Login (mTLS)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [authorizationCode]
 *             properties:
 *               authorizationCode:
 *                 type: string
 *               referrer:
 *                 type: string
 */
router.post("/toss", async (req: Request, res: Response): Promise<void> => {
  const { authorizationCode, referrer } = req.body;

  if (!authorizationCode) {
    res.status(400).json({ error: "Missing authorizationCode" });
    return;
  }

  try {
    const certPath = process.env.TOSS_CERT_PATH || path.resolve(process.cwd(), "certs", "toss_cert.pem");
    const keyPath = process.env.TOSS_KEY_PATH || path.resolve(process.cwd(), "certs", "toss_key.pem");

    let httpsAgent;
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      httpsAgent = new https.Agent({
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
      });
    } else {
      console.warn("mTLS certificates not found. API calls to Toss will likely fail with CertificateRequired.");
    }

    const TOSS_API_BASE = "https://apps-in-toss-api.toss.im";

    // 1. Get Toss Access Token
    const tokenRes = await axios.post(
      `${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`,
      { authorizationCode, referrer },
      { httpsAgent }
    );

    if (tokenRes.data.resultType !== "SUCCESS") {
      res.status(400).json({ error: "Token exchange failed", details: tokenRes.data });
      return;
    }

    const accessToken = tokenRes.data.success.accessToken;

    // 2. Get User Info
    const userRes = await axios.get(
      `${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/login-me`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        httpsAgent,
      }
    );

    if (userRes.data.resultType !== "SUCCESS") {
      res.status(400).json({ error: "User fetch failed", details: userRes.data });
      return;
    }

    const userProfile = userRes.data.success;

    // 3. Decrypt User Info
    const aesKey = process.env.TOSS_AES_KEY;
    if (!aesKey) throw new Error('TOSS_AES_KEY environment variable is required');
    const aad = process.env.TOSS_AAD || "TOSS";

    if (userProfile.name) userProfile.name = decryptAesGcm(userProfile.name, aesKey, aad);
    if (userProfile.phone) userProfile.phone = decryptAesGcm(userProfile.phone, aesKey, aad);
    if (userProfile.birthday) userProfile.birthday = decryptAesGcm(userProfile.birthday, aesKey, aad);
    if (userProfile.ci) userProfile.ci = decryptAesGcm(userProfile.ci, aesKey, aad);
    if (userProfile.gender) userProfile.gender = decryptAesGcm(userProfile.gender, aesKey, aad);
    if (userProfile.nationality) userProfile.nationality = decryptAesGcm(userProfile.nationality, aesKey, aad);

    // 4. Generate custom JWT (same format as Edge Function)
    const jwtSecret = process.env.CUSTOM_JWT_SECRET || process.env.SUPABASE_JWT_SECRET || config.jwt.secret;
    
    // Convert Toss userKey to a deterministic UUID
    const NAMESPACE_UUID = "1b671a64-40d5-491e-99b0-da01ff1f3341";
    const userUuid = uuidv5(String(userProfile.userKey), NAMESPACE_UUID);

    // 5. Upsert User into Supabase DB (Registration/Login)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      // .trim()을 추가하여 대시보드 복사 시 발생할 수 있는 공백 및 줄바꿈 문자를 제거합니다.
      const supabase = createClient(supabaseUrl.trim(), supabaseServiceKey.trim());
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: userUuid,
        toss_user_key: String(userProfile.userKey),
        name: userProfile.name || 'Unknown',
        phone: userProfile.phone || null,
        ci: userProfile.ci || null,
        birthday: userProfile.birthday || null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
      if (upsertError) {
        console.error("[Supabase Upsert Error]:", upsertError);
      } else {
        console.log(`[Supabase] Successfully upserted profile for ${userUuid}`);
      }
    } else {
      console.warn("[Supabase] SUPABASE_URL or SUPABASE_SERVICE_KEY not provided. Skipping profile upsert.");
    }


    const token = jwt.sign(
      {
        aud: "authenticated",
        sub: userUuid,
        email: userProfile.email || `${userProfile.userKey}@toss.im`,
        phone: userProfile.phone || "",
        role: "authenticated",
        user_key: String(userProfile.userKey),
      },
      jwtSecret,
      { expiresIn: "24h" }
    );

    res.json({ success: true, customToken: token, user: userProfile });
  } catch (error: any) {
    console.error("Toss login error:", error?.response?.data || error.message);
    res.status(error?.response?.status || 500).json({
      error: error?.response?.data || error.message,
    });
  }
});

export default router;
