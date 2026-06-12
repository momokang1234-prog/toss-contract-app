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
      <Paragraph typography="st4" fontWeight="bold">사업장 정보 확인</Paragraph>
      <Spacing size={16} />
      <List>
        <ListRow
          contents={
            <div>
              <Paragraph typography="st6" color="grey-500">사업자등록번호</Paragraph>
              <Paragraph typography="st6" fontWeight="bold">{result.businessNumber}</Paragraph>
            </div>
          }
        />
        <ListRow
          contents={
            <div>
              <Paragraph typography="st6" color="grey-500">상호(법인명)</Paragraph>
              <Paragraph typography="st6" fontWeight="bold">{result.businessName}</Paragraph>
            </div>
          }
        />
        <ListRow
          contents={
            <div>
              <Paragraph typography="st6" color="grey-500">대표자</Paragraph>
              <Paragraph typography="st6" fontWeight="bold">{result.representative}</Paragraph>
            </div>
          }
        />
        <ListRow
          contents={
            <div>
              <Paragraph typography="st6" color="grey-500">사업장 소재지</Paragraph>
              <Paragraph typography="st6" fontWeight="bold">{result.address}</Paragraph>
            </div>
          }
        />
      </List>
      <Spacing size={16} />
      <Paragraph typography="st7" color="grey-500">사업자등록정보는 국세청에 등록된 정보와 일치해야 해요.</Paragraph>
    </div>
  );
}
