import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";

// In-memory test db
let users: any[] = [];
let accounts: any[] = [];
let transactions: any[] = [];

const queryFn = vi.fn(async (sql: string, params?: any[]) => {
  const s = sql.toLowerCase().trim();

  if (s.includes("select id from users where phone") && !s.includes("password_hash")) {
    const phone = params?.[0];
    return { rows: users.filter((u) => u.phone === phone) };
  }

  if (s.includes("select id, password_hash from users where phone")) {
    const phone = params?.[0];
    return { rows: users.filter((u) => u.phone === phone) };
  }

  if (s.includes("with new_user as") && s.includes("insert into users")) {
    const phone = params?.[0];
    const passwordHash = params?.[1];
    const userId = `u-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    users.push({ id: userId, phone, password_hash: passwordHash });
    accounts.push({ id: `a-${Date.now()}`, user_id: userId, balance: 0 });
    return { rows: [{ user_id: userId }] };
  }

  if (s.includes("select balance from accounts where user_id")) {
    const uid = params?.[0];
    return { rows: accounts.filter((a) => a.user_id === uid) };
  }

  if (s.includes("update accounts set balance = balance +") && s.includes("returning balance")) {
    const amount = params?.[0];
    const uid = params?.[1];
    const acct = accounts.find((a) => a.user_id === uid);
    if (!acct) return { rows: [] };
    acct.balance = Number(acct.balance) + amount;
    return { rows: [{ balance: acct.balance }] };
  }

  if (s.includes("insert into transactions") && s.includes("'deposit'")) {
    const txId = `tx-${Date.now()}`;
    transactions.push({
      id: txId, sender_id: params?.[0], receiver_id: params?.[1],
      amount: params?.[2], kind: "deposit", created_at: new Date(),
    });
    return { rows: [{ id: txId }] };
  }

  if (s.includes("insert into transactions") && s.includes("'transfer'")) {
    const txId = `tx-${Date.now()}`;
    transactions.push({
      id: txId, sender_id: params?.[0], receiver_id: params?.[1],
      amount: params?.[2], kind: "transfer", created_at: new Date(),
    });
    return { rows: [{ id: txId, created_at: new Date().toISOString() }] };
  }

  if (s.includes("from transactions t") && s.includes("join users")) {
    const uid = params?.[0];
    let limit: number;

    if (s.includes("and t.created_at <")) {
      // cursor-based: params = [userId, cursorTime, limit]
      const cursorTime = params?.[1];
      limit = (params?.[2] as number) || 20;
      const rows = transactions
        .filter((t: any) => (t.sender_id === uid || t.receiver_id === uid) && new Date(t.created_at) < new Date(cursorTime as string))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit)
        .map((t: any) => ({
          ...t,
          sender_phone: users.find((u) => u.id === t.sender_id)?.phone || "",
          receiver_phone: users.find((u) => u.id === t.receiver_id)?.phone || "",
        }));
      return { rows };
    } else {
      // no cursor: params = [userId, limit]
      limit = (params?.[1] as number) || 20;
      const rows = transactions
        .filter((t: any) => t.sender_id === uid || t.receiver_id === uid)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit)
        .map((t: any) => ({
          ...t,
          sender_phone: users.find((u) => u.id === t.sender_id)?.phone || "",
          receiver_phone: users.find((u) => u.id === t.receiver_id)?.phone || "",
        }));
      return { rows };
    }
  }

  if (s.includes("select created_at from transactions where id")) {
    const id = params?.[0];
    return { rows: transactions.filter((t) => t.id === id) };
  }

  if (s.includes("select id from users where phone = $2")) {
    const phone = params?.[0];
    return { rows: users.filter((u) => u.phone === phone) };
  }

  return { rows: [] };
});

const clientQueryFn = vi.fn(async (sql: string, params?: any[]) => {
  const s = sql.toLowerCase().trim();

  if (["begin", "commit", "rollback"].includes(s)) {
    return { rows: [] };
  }

  if (s.includes("select balance from accounts") && s.includes("for update")) {
    const uid = params?.[0];
    return { rows: accounts.filter((a) => a.user_id === uid) };
  }

  if (s.includes("select id from users where phone") && s.includes("$1")) {
    const phone = params?.[0];
    return { rows: users.filter((u) => u.phone === phone) };
  }

  if (s.includes("update accounts set balance = balance -")) {
    const amount = params?.[0];
    const uid = params?.[1];
    const acct = accounts.find((a) => a.user_id === uid);
    if (acct) acct.balance = Number(acct.balance) - amount;
    return { rows: [] };
  }

  if (s.includes("update accounts set balance = balance +") && !s.includes("returning")) {
    const amount = params?.[0];
    const uid = params?.[1];
    const acct = accounts.find((a) => a.user_id === uid);
    if (acct) acct.balance = Number(acct.balance) + amount;
    return { rows: [] };
  }

  if (s.includes("insert into transactions") && s.includes("'transfer'")) {
    const txId = `tx-${Date.now()}`;
    transactions.push({
      id: txId, sender_id: params?.[0], receiver_id: params?.[1],
      amount: params?.[2], kind: "transfer", created_at: new Date(),
    });
    return { rows: [{ id: txId, created_at: new Date().toISOString() }] };
  }

  return { rows: [] };
});

const mockClient = { query: clientQueryFn, release: vi.fn() };

vi.mock("../src/db/client.js", () => ({
  query: queryFn,
  getClient: vi.fn(async () => mockClient),
}));

const { createApp } = await import("../src/app.js");

let app: Express;

beforeEach(() => {
  users = [];
  accounts = [];
  transactions = [];
  queryFn.mockClear();
  clientQueryFn.mockClear();
  app = createApp();
});

async function registerAndLogin(app: Express, phone = "01011112222", depositAmount?: number) {
  await request(app).post("/auth/register").send({ phone, password: "pass1234" });
  const login = await request(app).post("/auth/login").send({ phone, password: "pass1234" });
  if (depositAmount) {
    await request(app)
      .post("/accounts/deposit")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ amount: depositAmount });
  }
  return { token: login.body.token, userId: login.body.userId, phone };
}

describe("GET /transactions", () => {
  it("should return empty list for new user", async () => {
    const { token } = await registerAndLogin(app);

    const res = await request(app)
      .get("/transactions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
    expect(res.body.nextCursor).toBeNull();
  });

  it("should list deposits and transfers with correct direction", async () => {
    const sender = await registerAndLogin(app, "01011112222", 100000);
    const receiver = await registerAndLogin(app, "01033334444");

    // Deposit (sender)
    await request(app)
      .post("/accounts/deposit")
      .set("Authorization", `Bearer ${sender.token}`)
      .send({ amount: 10000 });

    // Transfer sender → receiver
    await request(app)
      .post("/transfers")
      .set("Authorization", `Bearer ${sender.token}`)
      .send({ receiverPhone: "01033334444", amount: 30000 });

    // Check sender's transactions
    const senderTx = await request(app)
      .get("/transactions")
      .set("Authorization", `Bearer ${sender.token}`);

    expect(senderTx.status).toBe(200);
    expect(senderTx.body.items.length).toBe(3); // 2 deposits (helper + explicit) + 1 transfer

    // Most recent first — the transfer should be first
    expect(senderTx.body.items[0].kind).toBe("transfer");
    expect(senderTx.body.items[0].direction).toBe("sent");
    expect(senderTx.body.items[0].amount).toBe(30000);

    // Second should be a deposit (explicit 10000)
    expect(senderTx.body.items[1].kind).toBe("deposit");

    // Check receiver's transactions
    const receiverTx = await request(app)
      .get("/transactions")
      .set("Authorization", `Bearer ${receiver.token}`);

    expect(receiverTx.body.items.length).toBe(1);
    expect(receiverTx.body.items[0].direction).toBe("received");
    expect(receiverTx.body.items[0].amount).toBe(30000);
    expect(receiverTx.body.items[0].counterpartyPhone).toBe("01011112222");
  });

  it("should support pagination with limit", async () => {
    const sender = await registerAndLogin(app, "01011112222", 100000);
    await registerAndLogin(app, "01033334444");
    await registerAndLogin(app, "01044445555");

    // Make 4 transfers (total: 1 deposit + 4 transfers = 5 items)
    for (let i = 0; i < 4; i++) {
      await request(app)
        .post("/transfers")
        .set("Authorization", `Bearer ${sender.token}`)
        .send({ receiverPhone: i % 2 === 0 ? "01033334444" : "01044445555", amount: 1000 });
    }

    // Get first page with limit=3
    const page1 = await request(app)
      .get("/transactions?limit=3")
      .set("Authorization", `Bearer ${sender.token}`);

    expect(page1.body.items.length).toBe(3);
    expect(page1.body.nextCursor).toBeTruthy();

    // Get second page
    const page2 = await request(app)
      .get(`/transactions?limit=3&cursor=${page1.body.nextCursor}`)
      .set("Authorization", `Bearer ${sender.token}`);

    expect(page2.body.items.length).toBe(2); // 5 total - 3 = 2
    expect(page2.body.nextCursor).toBeNull(); // last page
  });

  it("should require authentication", async () => {
    const res = await request(app).get("/transactions");
    expect(res.status).toBe(401);
  });
});
