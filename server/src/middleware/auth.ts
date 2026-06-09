import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import type { JwtPayload } from "../models/index.js";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      phone?: string;
    }
  }
}

/**
 * JWT authentication middleware.
 * Verifies Bearer token and attaches userId + phone to request.
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "인증 토큰이 필요합니다." });
    return;
  }

  const token = header.slice(7);
  try {
    const secret = Buffer.from(config.jwt.secret);
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.userId = payload.userId;
    req.phone = payload.phone;
    next();
  } catch {
    res.status(401).json({ error: "유효하지 않은 토큰입니다." });
  }
}
