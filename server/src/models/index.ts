/** User record as stored in DB */
export interface User {
  id: string;
  phone: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

/** Account with balance */
export interface Account {
  id: string;
  user_id: string;
  balance: number; // stored in won (BIGINT)
  created_at: Date;
  updated_at: Date;
}

/** Transaction record */
export interface Transaction {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  kind: "transfer" | "deposit";
  created_at: Date;
}

/** JWT payload */
export interface JwtPayload {
  userId: string;
  phone: string;
}

/** Auth routes DTOs */
export interface RegisterBody {
  phone: string;
  password: string;
}

export interface LoginBody {
  phone: string;
  password: string;
}

export interface TransferBody {
  receiverPhone: string;
  amount: number;
}

export interface DepositBody {
  amount: number;
}
