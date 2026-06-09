import { useState } from 'react';
import { Button, Paragraph, Spacing } from '@toss/tds-mobile';
import type { Contract } from '../../hooks/useContracts';
import { downloadContractPDF } from '../../utils/pdf';

interface ContractPreviewProps {
  contract: Contract;
}

export function ContractPreview({ contract }: ContractPreviewProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadContractPDF(contract);
    } catch (err) {
      console.error('PDF 생성 실패:', err);
      alert('PDF 생성에 실패했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  const wageLabel = contract.wage_type === 'hourly' ? '시급'
    : contract.wage_type === 'daily' ? '일급'
    : contract.wage_type === 'weekly' ? '주급'
    : '월급';

  const contractTypeLabel = contract.contract_type === 'partTime' ? '단시간'
    : contract.contract_type === 'fullTime' ? '정규직'
    : '기간제';

  const dayLabels: Record<string, string> = {
    mon: '월', tue: '화', wed: '수', thu: '목', fri: '금', sat: '토', sun: '일',
  };
  const workDaysStr = contract.work_days.map(d => dayLabels[d] ?? d).join(', ');

  return (
    <div>
      <div style={{ border: '1px solid #E5E8EB', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '20px 16px', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E8EB', textAlign: 'center' }}>
          <Paragraph typography="st1" fontWeight="bold">근로계약서</Paragraph>
        </div>

        <div style={{ padding: 16 }}>
          <SectionTitle>1. 근로자</SectionTitle>
          <InfoRow label="성명" value={contract.worker_name} />
          <InfoRow label="연락처" value={contract.worker_phone} />

          <SectionTitle>2. 근로조건</SectionTitle>
          <InfoRow label="계약 유형" value={contractTypeLabel} />
          <InfoRow label="근무 장소" value={contract.workplace} />
          <InfoRow label="직무 내용" value={contract.job_description} />
          <InfoRow label="시작일" value={contract.start_date} />
          {contract.end_date && <InfoRow label="종료일" value={contract.end_date} />}

          <SectionTitle>3. 임금</SectionTitle>
          <InfoRow label="급여 형태" value={wageLabel} />
          <InfoRow label="기본급" value={`${contract.base_wage.toLocaleString()}원`} />
          <InfoRow label="지급일" value={contract.wage_payment_date} />

          <SectionTitle>4. 근무 시간</SectionTitle>
          <InfoRow label="근무일" value={workDaysStr} />
          <InfoRow label="근무 시간" value={`${contract.start_time} ~ ${contract.end_time}`} />
          <InfoRow label="휴게시간" value={`${contract.break_minutes}분`} />
          {contract.weekly_holiday && (
            <InfoRow label="주휴일" value={dayLabels[contract.weekly_holiday] ?? contract.weekly_holiday} />
          )}

          <SectionTitle>5. 기타 근로조건</SectionTitle>
          <InfoRow label="연차유급휴가" value={contract.paid_leave_clause ? '근로기준법에 따름' : '미포함'} />
          <InfoRow label="사회보험" value={contract.social_insurance_clause ? '4대보험 적용' : '미적용'} />
          <InfoRow label="퇴직금" value={contract.severance_clause ? '퇴직급여 보장법에 따름' : '해당 없음'} />

          {contract.worker_signature_data && (
            <div style={{ marginTop: 16, padding: 12, backgroundColor: '#F9FAFB', borderRadius: 8 }}>
              <Paragraph typography="st4" fontWeight="bold">근로자 서명</Paragraph>
              <Spacing size={8} />
              <img src={contract.worker_signature_data} alt="근로자 서명" style={{ maxWidth: 160, border: '1px solid #E5E8EB', borderRadius: 4 }} />
              {contract.worker_signed_at && (
                <Paragraph as="span" typography="st6" color="grey500">
                  {new Date(contract.worker_signed_at).toLocaleString('ko-KR')}
                </Paragraph>
              )}
            </div>
          )}
        </div>
      </div>

      <Spacing size={12} />
      <Button
        color="light"
        variant="weak"
        display="full"
        size="large"
        onClick={handleDownload}
        disabled={downloading}
      >
        📄 {downloading ? 'PDF 생성 중...' : 'PDF 다운로드'}
      </Button>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Paragraph typography="st3" fontWeight="bold" style={{ marginTop: 20, marginBottom: 8 }}>{children}</Paragraph>;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid #F2F4F6', padding: '8px 0' }}>
      <Paragraph as="span" typography="st5" color="grey600" style={{ width: 100, flexShrink: 0 }}>{label}</Paragraph>
      <Paragraph as="span" typography="st4">{value}</Paragraph>
    </div>
  );
}
