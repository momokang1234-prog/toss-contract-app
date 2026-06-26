import { useState } from 'react';
import { Button, Paragraph, Spacing, Top } from '@toss/tds-mobile';
import type { Contract } from '../../hooks/useContracts';
import { ContractDocumentView } from './ContractDocumentView';

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

  return (
    <div>
      <Top title="근로계약서" />
      <Spacing size={16} />
      <div style={{ padding: '0 24px' }}>
        <Paragraph typography="t3" fontWeight="bold">근로계약서 미리보기</Paragraph>
      </div>
      <Spacing size={16} />

      {/* 단일 렌더링 엔진(template.ts)을 사용하는 뷰어로 교체 */}
      <div style={{ padding: '0 16px' }}>
        <ContractDocumentView contract={contract} />
      </div>

      <Spacing size={24} />
      <div style={{ padding: '0 24px 40px' }}>
        <Button
          color="primary"
          variant="weak"
          display="full"
          size="large"
          onClick={handleDownload}
          disabled={downloading}
        >
          📄 {downloading ? 'PDF 생성 중...' : 'PDF 다운로드'}
        </Button>
      </div>
    </div>
  );
}
