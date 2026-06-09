import { useState, type FormEvent } from "react";
import { TextField, Button, Paragraph, Spacing, SegmentedControl } from "@toss/tds-mobile";

interface ContractFormProps {
  ci: string;
  userName: string;
  onComplete: () => void;
}

type SalaryType = "monthly" | "hourly" | "daily";

interface FormData {
  employer: string;
  position: string;
  startDate: string;
  salaryType: SalaryType;
  salary: string;
  workHours: string;
  workDays: string;
}

const SALARY_OPTIONS: { value: SalaryType; label: string; unit: string }[] = [
  { value: "monthly", label: "월급", unit: "원/월" },
  { value: "hourly", label: "시급", unit: "원/시간" },
  { value: "daily", label: "일당", unit: "원/일" },
];

export function ContractForm({ ci: _ci, userName, onComplete }: ContractFormProps) {
  const [form, setForm] = useState<FormData>({
    employer: "",
    position: "",
    startDate: "",
    salaryType: "monthly",
    salary: "",
    workHours: "",
    workDays: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.employer.trim()) newErrors.employer = "사업장명을 입력하세요";
    if (!form.position.trim()) newErrors.position = "직무/직급을 입력하세요";
    if (!form.startDate) newErrors.startDate = "입사일을 선택하세요";
    if (!form.salary || Number(form.salary) <= 0)
      newErrors.salary = "급여를 입력하세요";
    if (!form.workHours.trim()) newErrors.workHours = "근무 시간을 입력하세요";
    if (!form.workDays.trim()) newErrors.workDays = "근무 요일을 입력하세요";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  const selectedUnit = SALARY_OPTIONS.find((o) => o.value === form.salaryType)?.unit ?? "원";

  return (
    <form onSubmit={handleSubmit}>
      <Paragraph typography="st1" fontWeight="bold">근로계약서 작성</Paragraph>
      <Spacing size={4} />
      <Paragraph typography="st4" color="grey600">{userName}님의 정보가 확인되었습니다</Paragraph>
      <Spacing size={24} />

      {/* 사업장명 */}
      <TextField
        variant="box"
        label="사업장명"
        value={form.employer}
        onChange={(e) => handleChange("employer", e.target.value)}
        placeholder="사업장명을 입력하세요"
        hasError={!!errors.employer}
        help={errors.employer}
      />
      <Spacing size={16} />

      {/* 직무/직급 */}
      <TextField
        variant="box"
        label="직무/직급"
        value={form.position}
        onChange={(e) => handleChange("position", e.target.value)}
        placeholder="직무 또는 직급"
        hasError={!!errors.position}
        help={errors.position}
      />
      <Spacing size={16} />

      {/* 입사일 */}
      <TextField
        variant="box"
        label="입사일"
        type="date"
        value={form.startDate}
        onChange={(e) => handleChange("startDate", e.target.value)}
        hasError={!!errors.startDate}
        help={errors.startDate}
      />
      <Spacing size={16} />

      {/* 급여 유형 */}
      <Paragraph typography="st6" fontWeight="bold" color="grey600">급여 유형</Paragraph>
      <Spacing size={8} />
      <SegmentedControl
        value={form.salaryType}
        onChange={(value) => handleChange("salaryType", value as SalaryType)}
      >
        {SALARY_OPTIONS.map((opt) => (
          <SegmentedControl.Item key={opt.value} value={opt.value}>{opt.label}</SegmentedControl.Item>
        ))}
      </SegmentedControl>
      <Spacing size={16} />

      {/* 금액 */}
      <TextField
        variant="box"
        label={`금액 (${selectedUnit})`}
        type="number"
        value={form.salary}
        onChange={(e) => handleChange("salary", e.target.value)}
        placeholder={`급여 금액 (${selectedUnit})`}
        min="0"
        hasError={!!errors.salary}
        help={errors.salary}
      />
      <Spacing size={16} />

      {/* 근무 시간 */}
      <TextField
        variant="box"
        label="근무 시간"
        value={form.workHours}
        onChange={(e) => handleChange("workHours", e.target.value)}
        placeholder="예: 09:00 ~ 18:00"
        hasError={!!errors.workHours}
        help={errors.workHours}
      />
      <Spacing size={16} />

      {/* 근무 요일 */}
      <TextField
        variant="box"
        label="근무 요일"
        value={form.workDays}
        onChange={(e) => handleChange("workDays", e.target.value)}
        placeholder="예: 월~금"
        hasError={!!errors.workDays}
        help={errors.workDays}
      />
      <Spacing size={16} />

      <Button
        color="primary"
        variant="fill"
        display="block"
        size="large"
        type="submit"
        disabled={submitting}
      >
        {submitting ? "제출 중..." : "계약서 제출"}
      </Button>
    </form>
  );
}
