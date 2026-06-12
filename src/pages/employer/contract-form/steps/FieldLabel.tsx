import { Paragraph } from '@toss/tds-mobile';

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Paragraph typography="st6" fontWeight="bold" color="grey-600" style={{ marginBottom: 8 }}>{children}</Paragraph>;
}
