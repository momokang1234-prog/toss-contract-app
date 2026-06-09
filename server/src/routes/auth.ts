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
import { query } from "../db/client.js";
import { config } from "../config/index.js";
import { validate, registerSchema, loginSchema } from "../middleware/validation.js";
import type { RegisterBody, LoginBody, JwtPayload } from "../models/index.js";

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

export default router;
