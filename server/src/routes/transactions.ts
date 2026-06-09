import { Router, Request, Response } from "express";
import { query } from "../db/client.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: List transaction history
 *     description: Returns sent and received transactions with cursor pagination.
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Pagination cursor (transaction id from previous page)
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransactionList'
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const limit = Math.min(
      Math.max(parseInt(req.query.limit as string) || 20, 1),
      100,
    );
    const cursor = req.query.cursor as string | undefined;

    try {
      let rows: any[];

      if (cursor) {
        const cursorResult = await query(
          "SELECT created_at FROM transactions WHERE id = $1",
          [cursor],
        );
        if (cursorResult.rows.length === 0) {
          res.status(400).json({ error: "잘못된 커서입니다." });
          return;
        }
        const cursorTime = cursorResult.rows[0].created_at;

        rows = (
          await query(
            `SELECT
               t.id, t.amount, t.kind, t.created_at,
               t.sender_id, t.receiver_id,
               su.phone AS sender_phone,
               ru.phone AS receiver_phone
             FROM transactions t
             JOIN users su ON t.sender_id = su.id
             JOIN users ru ON t.receiver_id = ru.id
             WHERE (t.sender_id = $1 OR t.receiver_id = $1)
               AND t.created_at < $2
             ORDER BY t.created_at DESC
             LIMIT $3`,
            [req.userId, cursorTime, limit],
          )
        ).rows;
      } else {
        rows = (
          await query(
            `SELECT
               t.id, t.amount, t.kind, t.created_at,
               t.sender_id, t.receiver_id,
               su.phone AS sender_phone,
               ru.phone AS receiver_phone
             FROM transactions t
             JOIN users su ON t.sender_id = su.id
             JOIN users ru ON t.receiver_id = ru.id
             WHERE t.sender_id = $1 OR t.receiver_id = $1
             ORDER BY t.created_at DESC
             LIMIT $2`,
            [req.userId, limit],
          )
        ).rows;
      }

      const items = rows.map((row) => ({
        id: row.id,
        amount: Number(row.amount),
        kind: row.kind as "transfer" | "deposit",
        direction: row.sender_id === req.userId ? "sent" : "received",
        counterpartyPhone:
          row.sender_id === req.userId ? row.receiver_phone : row.sender_phone,
        createdAt: row.created_at,
      }));

      const nextCursor =
        items.length === limit ? items[items.length - 1].id : null;

      res.json({ items, nextCursor });
    } catch (err) {
      console.error("transactions error:", err);
      res.status(500).json({ error: "거래 내역 조회에 실패했습니다." });
    }
  },
);

export default router;
