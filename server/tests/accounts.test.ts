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
    const limit = (params?.[params.length - 1]) || 20;
    const rows = transactions
      .filter((t) => t.sender_id === uid || t.receiver_id === uid)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
      .map((t: any) => ({
        ...t,
        sender_phone: users.find((u) => u.id === t.sender_id)?.phone || "",
        receiver_phone: users.find((u) => u.id === t.receiver_id)?.phone || "",
      }));
    return { rows };
  }

  if (s.includes("select created_at from transactions where id")) {
    const id = params?.[0];
    return { rows: transactions.filter((t) => t.id === id) };
  }

  if (s.includes("select id from users where phone = $2")) {
    // transfer: find receiver
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

// Helper: register and get token
async function registerAndLogin(app: Express, phone = "01011112222") {
  await request(app).post("/auth/register").send({ phone, password: "pass1234" });
  const login = await request(app).post("/auth/login").send({ phone, password: "pass1234" });
  return { token: login.body.token, userId: login.body.userId };
}

describe("GET /accounts/balance", () => {
  it("should return balance 0 for new user", async () => {
    const { token } = await registerAndLogin(app);

    const res = await request(app)
      .get("/accounts/balance")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(0);
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/accounts/balance");
    expect(res.status).toBe(401);
  });
});

describe("POST /accounts/deposit", () => {
  it("should deposit and return updated balance", async () => {
    const { token } = await registerAndLogin(app);

    const res = await request(app)
      .post("/accounts/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 50000 });

    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(50000);
    expect(res.body.deposited).toBe(50000);
  });

  it("should return updated balance after balance query", async () => {
    const { token } = await registerAndLogin(app);

    await request(app)
      .post("/accounts/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 10000 });

    const res = await request(app)
      .get("/accounts/balance")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.balance).toBe(10000);
  });

  it("should reject negative deposit amount", async () => {
    const { token } = await registerAndLogin(app);

    const res = await request(app)
      .post("/accounts/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: -1000 });

    expect(res.status).toBe(400);
  });

  it("should reject zero deposit amount", async () => {
    const { token } = await registerAndLogin(app);

    const res = await request(app)
      .post("/accounts/deposit")
      .set("Authorization", `Bearer ${token}`)
      .send({ amount: 0 });

    expect(res.status).toBe(400);
  });
});
