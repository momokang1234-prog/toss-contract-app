import { Spacing, Paragraph } from '@toss/tds-mobile';
import type { ValidationWarning } from '../../../../domain/contract/validation';

interface ValidationResultData {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
  warnings: ValidationWarning[];
}

interface Step5LegalValidationProps {
  validationResult: ValidationResultData | null;
  warnings: ValidationWarning[];
}

export default function Step5LegalValidation({ validationResult, warnings }: Step5LegalValidationProps) {
  return (
    <div>
      <Paragraph typography="st3" fontWeight="bold" style={{ marginBottom: 12 }}>법정 검증 결과</Paragraph>
      {!validationResult && (
        <Paragraph typography="st6" color="grey-500">검증을 실행하려면 '검증 실행'을 눌러주세요.</Paragraph>
      )}
      {validationResult && validationResult.valid && warnings.length === 0 && (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <img src="https://static.toss.im/illusts/wiki-highlight-L.png" alt=""
            style={{ width: 120, height: 120, marginBottom: 16 }}
          />
          <Paragraph typography="st4" fontWeight="bold" color="grey-800">모든 검증을 통과했습니다</Paragraph>
          <Spacing size={8} />
          <Paragraph typography="st6" color="grey-500">법정 요건을 충족하는 계약서입니다.</Paragraph>
        </div>
      )}
      {validationResult && validationResult.valid && warnings.length > 0 && (
        <>
          <Paragraph typography="st4" fontWeight="bold" color="grey-800" style={{ marginBottom: 8 }}>✅ 형식 검증 통과</Paragraph>
          <div style={{ backgroundColor: '#FFF9DB', borderRadius: 8, padding: 16, border: '1px solid #F2E49B', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#8B6F00', marginBottom: 8 }}>⚠ 검토 필요 사항</div>
            {warnings.map((w, i) => (
              <div key={i} style={{ fontSize: 12, color: '#8B6F00', marginBottom: 4, lineHeight: 1.5 }}>• {w.message}</div>
            ))}
          </div>
        </>
      )}
      {validationResult && !validationResult.valid && (
        <>
          <div style={{ backgroundColor: '#FFF0F0', borderRadius: 8, padding: 16, marginBottom: 16, border: '1px solid #FFD4D4' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#D12E2E', marginBottom: 8 }}>❌ 수정이 필요한 항목</div>
            {validationResult.errors.map((err, i) => (
              <div key={i} style={{ fontSize: 12, color: '#D12E2E', marginBottom: 4, lineHeight: 1.5 }}>• {err.message}</div>
            ))}
          </div>
          {warnings.length > 0 && (
            <div style={{ backgroundColor: '#FFF9DB', borderRadius: 8, padding: 16, marginBottom: 16, border: '1px solid #F2E49B' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#8B6F00', marginBottom: 8 }}>⚠ 검토 필요 사항</div>
              {warnings.map((w, i) => (
                <div key={i} style={{ fontSize: 12, color: '#8B6F00', marginBottom: 4, lineHeight: 1.5 }}>• {w.message}</div>
              ))}
            </div>
          )}
          <Paragraph typography="st6" color="grey-600" style={{ textAlign: 'center' }}>오류를 수정한 후 다시 검증을 실행해주세요.</Paragraph>
        </>
      )}
    </div>
  );
}
