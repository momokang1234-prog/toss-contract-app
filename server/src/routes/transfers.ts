import { Router, Request, Response } from "express";
import { query, getClient } from "../db/client.js";
import { authenticate } from "../middleware/auth.js";
import { validate, transferSchema } from "../middleware/validation.js";
import type { TransferBody } from "../models/index.js";

const router = Router();

/**
 * @swagger
 * /transfers:
 *   post:
 *     summary: Send money to another user
 *     description: Atomically transfers money from sender to receiver using a database transaction.
 *     tags: [Transfers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [receiverPhone, amount]
 *             properties:
 *               receiverPhone:
 *                 type: string
 *                 example: "01087654321"
 *               amount:
 *                 type: integer
 *                 minimum: 1
 *                 example: 30000
 *     responses:
 *       201:
 *         description: Transfer success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransferResponse'
 *       400:
 *         description: Insufficient balance or self-transfer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Receiver not found
 */
router.post(
  "/",
  authenticate,
  validate(transferSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { receiverPhone, amount }: TransferBody = req.body;

    if (receiverPhone === req.phone) {
      res.status(400).json({ error: "자기 자신에게 송금할 수 없습니다." });
      return;
    }

    const dbClient = await getClient();
    try {
      await dbClient.query("BEGIN");

      const sender = await dbClient.query(
        "SELECT balance FROM accounts WHERE user_id = $1 FOR UPDATE",
        [req.userId],
      );

      if (sender.rows.length === 0) {
        await dbClient.query("ROLLBACK");
        res.status(404).json({ error: "계좌를 찾을 수 없습니다." });
        return;
      }

      const senderBalance = Number(sender.rows[0].balance);
      if (senderBalance < amount) {
        await dbClient.query("ROLLBACK");
        res.status(400).json({ error: "잔액이 부족합니다." });
        return;
      }

      const receiverResult = await dbClient.query(
        "SELECT id FROM users WHERE phone = $1",
        [receiverPhone],
      );

      if (receiverResult.rows.length === 0) {
        await dbClient.query("ROLLBACK");
        res.status(404).json({ error: "수신자를 찾을 수 없습니다." });
        return;
      }

      const receiverId = receiverResult.rows[0].id;

      await dbClient.query(
        "UPDATE accounts SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2",
        [amount, req.userId],
      );

      await dbClient.query(
        "UPDATE accounts SET balance = balance + $1, updated_at = NOW() WHERE user_id = $2",
        [amount, receiverId],
      );

      const txResult = await dbClient.query(
        `INSERT INTO transactions (sender_id, receiver_id, amount, kind)
         VALUES ($1, $2, $3, 'transfer')
         RETURNING id, created_at`,
        [req.userId, receiverId, amount],
      );

      await dbClient.query("COMMIT");

      res.status(201).json({
        transactionId: txResult.rows[0].id,
        amount,
        receiverPhone,
        createdAt: txResult.rows[0].created_at,
      });
    } catch (err) {
      await dbClient.query("ROLLBACK");
      console.error("transfer error:", err);
      res.status(500).json({ error: "송금에 실패했습니다." });
    } finally {
      dbClient.release();
    }
  },
);

export default router;
