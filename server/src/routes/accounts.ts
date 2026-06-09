import { Router, Request, Response } from "express";
import { query } from "../db/client.js";
import { authenticate } from "../middleware/auth.js";
import { validate, depositSchema } from "../middleware/validation.js";
import type { DepositBody } from "../models/index.js";

const router = Router();

/**
 * @swagger
 * /accounts/balance:
 *   get:
 *     summary: Get authenticated user's balance
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BalanceResponse'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/balance",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await query(
        "SELECT balance FROM accounts WHERE user_id = $1",
        [req.userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "계좌를 찾을 수 없습니다." });
        return;
      }

      res.json({
        userId: req.userId,
        balance: Number(result.rows[0].balance),
      });
    } catch (err) {
      console.error("balance error:", err);
      res.status(500).json({ error: "잔액 조회에 실패했습니다." });
    }
  },
);

/**
 * @swagger
 * /accounts/deposit:
 *   post:
 *     summary: Deposit money into authenticated user's account
 *     description: Internal/testing endpoint for adding funds.
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: integer
 *                 minimum: 1
 *                 example: 50000
 *     responses:
 *       200:
 *         description: Deposit success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DepositResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/deposit",
  authenticate,
  validate(depositSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { amount }: DepositBody = req.body;

    try {
      const result = await query(
        `UPDATE accounts SET balance = balance + $1, updated_at = NOW()
         WHERE user_id = $2
         RETURNING balance`,
        [amount, req.userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "계좌를 찾을 수 없습니다." });
        return;
      }

      await query(
        `INSERT INTO transactions (sender_id, receiver_id, amount, kind)
         VALUES ($1, $2, $3, 'deposit')`,
        [req.userId, req.userId, amount],
      );

      res.json({
        userId: req.userId,
        balance: Number(result.rows[0].balance),
        deposited: amount,
      });
    } catch (err) {
      console.error("deposit error:", err);
      res.status(500).json({ error: "입금에 실패했습니다." });
    }
  },
);

export default router;
