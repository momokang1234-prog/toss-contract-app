import { Paragraph, Spacing, List, ListRow } from '@toss/tds-mobile';

interface BusinessInfo {
  businessNumber: string;
  businessName: string;
  representative: string;
  address: string;
}

interface BusinessVerifyProps {
  result: BusinessInfo;
}

export function BusinessVerify({ result }: BusinessVerifyProps) {
  return (
    <div>
      <Paragraph typography="t4" fontWeight="bold">사업장 정보 확인</Paragraph>
      <Spacing size={24} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Paragraph typography="t6" color="grey-500">사업자등록번호</Paragraph>
          <Paragraph typography="t5">{result.businessNumber}</Paragraph>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Paragraph typography="t6" color="grey-500">상호(법인명)</Paragraph>
          <Paragraph typography="t5">{result.businessName}</Paragraph>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Paragraph typography="t6" color="grey-500">대표자</Paragraph>
          <Paragraph typography="t5">{result.representative}</Paragraph>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Paragraph typography="t6" color="grey-500">사업장 소재지</Paragraph>
          <div style={{ textAlign: 'right', maxWidth: '60%' }}>
            <Paragraph typography="t5">{result.address}</Paragraph>
          </div>
        </div>
      </div>
      <Spacing size={24} />
      <Paragraph typography="t7" color="grey-500">사업자등록정보는 국세청에 등록된 정보와 일치해야 해요.</Paragraph>
    </div>
  );
}
