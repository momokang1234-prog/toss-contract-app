import { useState } from 'react';
import { Button, Paragraph, Spacing, Border, Top, List, ListRow } from '@toss/tds-mobile';
import type { Contract } from '../../hooks/useContracts';

interface ContractPreviewProps {
  contract: Contract;
}

export function ContractPreview({ contract }: ContractPreviewProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { downloadContractPDF } = await import('../../utils/pdf');
      await downloadContractPDF(contract);
    } catch (err) {
      console.error(err);
      alert('PDF 다운로드에 실패했어요.');
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
      <Top title="근로계약서">
        <Paragraph typography="st1" fontWeight="bold">근로계약서</Paragraph>
      </Top>

      <Spacing size={16} />

      <SectionTitle>1. 근로자</SectionTitle>
      <List>
        <InfoRow label="성명" value={contract.worker_name} />
        <InfoRow label="연락처" value={contract.worker_phone} />
      </List>

      <SectionTitle>2. 근로조건</SectionTitle>
      <List>
        <InfoRow label="계약 유형" value={contractTypeLabel} />
        <InfoRow label="근무 장소" value={contract.workplace} />
        <InfoRow label="직무 내용" value={contract.job_description} />
        <InfoRow label="시작일" value={contract.start_date} />
        {contract.end_date && <InfoRow label="종료일" value={contract.end_date} />}
      </List>

      <SectionTitle>3. 임금</SectionTitle>
      <List>
        <InfoRow label="급여 형태" value={wageLabel} />
        <InfoRow label="기본급" value={`${contract.base_wage.toLocaleString()}원`} />
        <InfoRow label="지급일" value={contract.wage_payment_date} />
      </List>

      <SectionTitle>4. 근무 시간</SectionTitle>
      <List>
        <InfoRow label="근무일" value={workDaysStr} />
        <InfoRow label="근무 시간" value={`${contract.start_time} ~ ${contract.end_time}`} />
        <InfoRow label="휴게시간" value={`${contract.break_minutes}분`} />
        {contract.weekly_holiday && (
          <InfoRow label="주휴일" value={dayLabels[contract.weekly_holiday] ?? contract.weekly_holiday} />
        )}
      </List>

      <SectionTitle>5. 기타 근로조건</SectionTitle>
      <List>
        <InfoRow label="연차유급휴가" value={contract.paid_leave_clause ? '근로기준법에 따름' : '미포함'} />
        <InfoRow label="사회보험" value={contract.social_insurance_clause ? '4대보험 적용' : '미적용'} />
        <InfoRow label="퇴직금" value={contract.severance_clause ? '퇴직급여 보장법에 따름' : '해당 없음'} />
      </List>

      {contract.worker_signature_data && (
        <>
          <Spacing size={16} />
          <Border />
          <Spacing size={16} />
          <Paragraph typography="st4" fontWeight="bold">근로자 서명</Paragraph>
          <Spacing size={8} />
          <img src={contract.worker_signature_data} alt="근로자 서명" />
          {contract.worker_signed_at && (
            <>
              <Spacing size={8} />
              <Paragraph typography="st6" color="grey-500">
                {new Date(contract.worker_signed_at).toLocaleString('ko-KR')}
              </Paragraph>
            </>
          )}
        </>
      )}

      <Spacing size={16} />
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
  return (
    <>
      <Spacing size={20} />
      <Paragraph typography="st3" fontWeight="bold">{children}</Paragraph>
      <Spacing size={12} />
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <ListRow
      left={
        <>
          <Paragraph typography="st6" color="grey-500">{label}</Paragraph>
          <Paragraph typography="st5">{value}</Paragraph>
        </>
      }
    />
  );
}
