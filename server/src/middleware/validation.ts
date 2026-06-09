import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

/**
 * Creates a validation middleware from a Zod schema.
 * Validates req.body and returns 400 with Korean error messages on failure.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map(
        (i) => `${i.path.join(".")}: ${i.message}`,
      );
      res.status(400).json({ error: "입력값이 올바르지 않습니다.", details: errors });
      return;
    }
    req.body = result.data;
    next();
  };
}

// ── Shared validation schemas ──

const PHONE_REGEX = /^010\d{8}$/;

export const registerSchema = z.object({
  phone: z
    .string()
    .regex(PHONE_REGEX, "올바른 휴대폰 번호를 입력하세요 (예: 01012345678)"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

export const loginSchema = z.object({
  phone: z
    .string()
    .regex(PHONE_REGEX, "올바른 휴대폰 번호를 입력하세요 (예: 01012345678)"),
  password: z.string().min(1, "비밀번호를 입력하세요"),
});

export const transferSchema = z.object({
  receiverPhone: z
    .string()
    .regex(PHONE_REGEX, "올바른 수신자 휴대폰 번호를 입력하세요"),
  amount: z
    .number()
    .int("금액은 정수여야 합니다")
    .positive("금액은 0보다 커야 합니다"),
});

export const depositSchema = z.object({
  amount: z
    .number()
    .int("금액은 정수여야 합니다")
    .positive("금액은 0보다 커야 합니다"),
});
