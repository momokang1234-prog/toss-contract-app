/**
 * Test helpers: in-memory mock of pg Pool for route testing.
 * Provides a mock `pool` compatible with the db/client.ts interface.
 */
import { vi } from "vitest";

// In-memory stores
interface Row {
  [key: string]: unknown;
}

const createMockPool = () => {
  let users: Row[] = [];
  let accounts: Row[] = [];
  let transactions: Row[] = [];

  const queryFn = vi.fn(async (sql: string, params?: unknown[]) => {
    // Normalize sql for matching
    const s = sql.toLowerCase().trim();

    // ── Users queries ──
    if (s.includes("select id from users where phone")) {
      const phone = params?.[0] as string;
      const match = users.filter((u) => u.phone === phone);
      return { rows: match };
    }

    if (s.includes("select id, password_hash from users where phone")) {
      const phone = params?.[0] as string;
      const match = users.filter((u) => u.phone === phone);
      return { rows: match };
    }

    if (s.includes("select id from users where phone = $2")) {
      // transfer: find receiver
      const phone = params?.[0] as string;
      const match = users.filter((u) => u.phone === phone);
      return { rows: match };
    }

    // ── Register (WITH new_user INSERT users + accounts) ──
    if (s.includes("with new_user as") && s.includes("insert into users")) {
      const phone = params?.[0] as string;
      const passwordHash = params?.[1] as string;
      const userId = `u-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      users.push({
        id: userId,
        phone,
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date(),
      });
      accounts.push({
        id: `a-${Date.now()}`,
        user_id: userId,
        balance: 0,
        created_at: new Date(),
        updated_at: new Date(),
      });
      return { rows: [{ user_id: userId }] };
    }

    // ── Account balance ──
    if (s.includes("select balance from accounts where user_id")) {
      const uid = params?.[0] as string;
      const match = accounts.filter((a) => a.user_id === uid);
      return { rows: match };
    }

    // ── Deposit ──
    if (
      s.includes("update accounts set balance = balance +") &&
      s.includes("returning balance")
    ) {
      const amount = params?.[0] as number;
      const uid = params?.[1] as string;
      const acct = accounts.find((a) => a.user_id === uid);
      if (!acct) return { rows: [] };
      (acct as any).balance = Number(acct.balance) + amount;
      return { rows: [{ balance: acct.balance }] };
    }

    // ── Transaction insert (deposit) ──
    if (
      s.includes("insert into transactions") &&
      s.includes("'deposit'")
    ) {
      const txId = `tx-${Date.now()}`;
      transactions.push({
        id: txId,
        sender_id: params?.[0],
        receiver_id: params?.[1],
        amount: params?.[2],
        kind: "deposit",
        created_at: new Date(),
      });
      return { rows: [{ id: txId }] };
    }

    // ── Transaction insert (transfer) ──
    if (
      s.includes("insert into transactions") &&
      s.includes("'transfer'")
    ) {
      const txId = `tx-${Date.now()}`;
      transactions.push({
        id: txId,
        sender_id: params?.[0],
        receiver_id: params?.[1],
        amount: params?.[2],
        kind: "transfer",
        created_at: new Date(),
      });
      return { rows: [{ id: txId, created_at: new Date().toISOString() }] };
    }

    // ── Transaction history ──
    if (s.includes("select") && s.includes("from transactions t")) {
      const uid = params?.[0] as string;
      const all = transactions
        .filter((t) => t.sender_id === uid || t.receiver_id === uid)
        .sort(
          (a, b) =>
            new Date(b.created_at as string).getTime() -
            new Date(a.created_at as string).getTime(),
        );

      const limit = (params?.[params.length - 1] as number) || 20;
      const rows = all.slice(0, limit).map((t) => ({
        ...t,
        sender_phone: users.find((u) => u.id === t.sender_id)?.phone || "",
        receiver_phone:
          users.find((u) => u.id === t.receiver_id)?.phone || "",
      }));
      return { rows };
    }

    // ── Cursor lookup ──
    if (
      s.includes("select created_at from transactions where id")
    ) {
      const id = params?.[0] as string;
      const match = transactions.filter((t) => t.id === id);
      return { rows: match };
    }

    // Default
    return { rows: [] };
  });

  // Client for transfers (transactional)
  const clientQueryFn = vi.fn(async (sql: string, params?: unknown[]) => {
    const s = sql.toLowerCase().trim();

    if (s === "begin" || s === "commit" || s === "rollback") {
      return { rows: [] };
    }

    if (s.includes("select balance from accounts") && s.includes("for update")) {
      const uid = params?.[0] as string;
      const match = accounts.filter((a) => a.user_id === uid);
      return { rows: match };
    }

    if (
      s.includes("select id from users where phone") &&
      s.includes("$1")
    ) {
      const phone = params?.[0] as string;
      const match = users.filter((u) => u.phone === phone);
      return { rows: match };
    }

    if (
      s.includes("update accounts set balance = balance -")
    ) {
      const amount = params?.[0] as number;
      const uid = params?.[1] as string;
      const acct = accounts.find((a) => a.user_id === uid);
      if (acct) (acct as any).balance = Number(acct.balance) - amount;
      return { rows: [] };
    }

    if (
      s.includes("update accounts set balance = balance +")
    ) {
      const amount = params?.[0] as number;
      const uid = params?.[1] as string;
      const acct = accounts.find((a) => a.user_id === uid);
      if (acct) (acct as any).balance = Number(acct.balance) + amount;
      return { rows: [] };
    }

    if (
      s.includes("insert into transactions") &&
      s.includes("'transfer'")
    ) {
      const txId = `tx-${Date.now()}`;
      transactions.push({
        id: txId,
        sender_id: params?.[0],
        receiver_id: params?.[1],
        amount: params?.[2],
        kind: "transfer",
        created_at: new Date(),
      });
      return {
        rows: [{ id: txId, created_at: new Date().toISOString() }],
      };
    }

    return { rows: [] };
  });

  const mockClient = {
    query: clientQueryFn,
    release: vi.fn(),
  };

  const getClientFn = vi.fn(async () => mockClient);

  // Reset helper
  const reset = () => {
    users = [];
    accounts = [];
    transactions = [];
    queryFn.mockClear();
    clientQueryFn.mockClear();
    getClientFn.mockClear();
  };

  return {
    query: queryFn,
    getClient: getClientFn,
    mockClient,
    mockQuery: queryFn,
    mockClientQuery: clientQueryFn,
    reset,
    _stores: { get users() { return users; }, get accounts() { return accounts; }, get transactions() { return transactions; } },
  };
};

export const mockPool = createMockPool();
