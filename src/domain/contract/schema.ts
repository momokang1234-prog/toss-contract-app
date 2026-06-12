import { z } from "zod";

// ============================================================
// Worker Schema (근로자)
// ============================================================
export const WorkerSchema = z.object({
  name: z.string().min(1, "근로자 성명 필수"),
  ci: z.string().optional(),
  ciHash: z.string().optional(),
  phone: z.string().regex(/^\d{10,11}$/, "연락처 10~11자리 숫자"),
  address: z.string().optional(),
});

// ============================================================
// Employer Schema (사업주)
// ============================================================
export const EmployerSchema = z.object({
  businessNumber: z
    .string()
    .regex(/^\d{3}-\d{2}-\d{5}$/, "사업자등록번호 형식: 000-00-00000"),
  businessName: z.string().min(1, "사업장명 필수"),
  representative: z.string().min(1, "대표자명 필수"),
  address: z.string().min(1, "사업장 소재지 필수"),
});

// ============================================================
// Enums
// ============================================================
export const ContractTypeSchema = z.enum([
  "fullTime",
  "partTime",
  "fixedTerm",
]);

export const WageTypeSchema = z.enum([
  "hourly",
  "daily",
  "weekly",
  "monthly",
]);

export const WagePaymentMethodSchema = z.enum([
  "bankTransfer",
  "cash",
  "mixed",
]);

export const DayOfWeekSchema = z.enum([
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
]);

// ============================================================
// Contract Schema (계약 내용)
// ============================================================
export const ContractSchema = z.object({
  contractType: ContractTypeSchema,
  templateVersion: z.string().default("1.0.0"),
  status: z
    .enum([
      "draft",
      "sent",
      "viewed",
      "signed",
      "completed",
      "cancelled",
      "expired",
    ])
    .default("draft"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식: YYYY-MM-DD"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  workplace: z.string().min(1, "근무 장소 필수"),
  jobDescription: z.string().min(1, "직무 내용 필수"),
  wageType: WageTypeSchema,
  baseWage: z.number().positive("임금은 양수"),
  wagePaymentDate: z.string().min(1, "임금 지급일 필수"),
  wagePaymentMethod: WagePaymentMethodSchema,
  workDays: z.array(DayOfWeekSchema).min(1, "근무일 1일 이상"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "시간 형식: HH:MM"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "시간 형식: HH:MM"),
  breakStartTime: z.string().regex(/^\d{2}:\d{2}$/, "시간 형식: HH:MM"),
  breakEndTime: z.string().regex(/^\d{2}:\d{2}$/, "시간 형식: HH:MM"),
  weeklyHoliday: DayOfWeekSchema.optional(),
  paidLeaveClause: z.boolean(),
  socialInsuranceClause: z.boolean(),
  severanceClause: z.boolean(),
});

// ============================================================
// Labor Contract Schema (근로계약서 전체)
// ============================================================
export const LaborContractSchema = z.object({
  worker: WorkerSchema,
  employer: EmployerSchema,
  contract: ContractSchema,
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// ============================================================
// Type Inference (타입 추론)
// ============================================================
export type Worker = z.infer<typeof WorkerSchema>;
export type Employer = z.infer<typeof EmployerSchema>;
export type Contract = z.infer<typeof ContractSchema>;
export type LaborContract = z.infer<typeof LaborContractSchema>;
export type ContractType = z.infer<typeof ContractTypeSchema>;
export type WageType = z.infer<typeof WageTypeSchema>;
export type DayOfWeek = z.infer<typeof DayOfWeekSchema>;
