/**
 * VARIANT C — bottom-sheet (field-by-field focus)
 * 요약 ListRow 탭 → BottomSheet 집중 입력, 항목별 완료 후 닫힘.
 */
import { useState } from 'react';
import { Paragraph, List, ListRow, BottomSheet, TextField, Button, Spacing, Badge } from '@toss/tds-mobile';
import type { ContractFormData } from '../../types';

interface Props {
  form: ContractFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string) => void;
}

type Field = 'name' | 'phone' | 'address' | null;

export default function VariantC({ form, errors, handleChange }: Props) {
  const [openField, setOpenField] = useState<Field>('name');
  const [draft, setDraft] = useState({ name: '', phone: '', address: '' });

  const open = (field: Field) => {
    setDraft({
      name: form.worker_name,
      phone: form.worker_phone,
      address: form.worker_address,
    });
    setOpenField(field);
  };

  const confirm = (field: 'name' | 'phone' | 'address') => {
    if (field === 'name') handleChange('worker_name', draft.name);
    if (field === 'phone') handleChange('worker_phone', draft.phone.replace(/\D/g, '').slice(0, 11));
    if (field === 'address') handleChange('worker_address', draft.address);
    setOpenField(null);
  };

  return (
    <div>
      <Paragraph typography="st3" fontWeight="bold" color="grey-900">
        근로자 기본 정보
      </Paragraph>
      <Spacing size={24} />

      <List>
        <ListRow
          title="이름"
          subtitle={form.worker_name || '탭해서 입력하세요'}
          right={form.worker_name ? <Badge color="blue">완료</Badge> : undefined}
          onClick={() => open('name')}
        />
        <ListRow
          title="전화번호"
          subtitle={form.worker_phone || '탭해서 입력하세요'}
          right={form.worker_phone ? <Badge color="blue">완료</Badge> : undefined}
          onClick={() => open('phone')}
        />
        <ListRow
          title="주소 (선택)"
          subtitle={form.worker_address || '탭해서 입력하세요'}
          right={form.worker_address ? <Badge color="teal">입력됨</Badge> : undefined}
          onClick={() => open('address')}
        />
      </List>

      {/* 이름 BottomSheet */}
      <BottomSheet open={openField === 'name'} onClose={() => setOpenField(null)}>
        <Paragraph typography="st4" fontWeight="bold">근로자 이름</Paragraph>
        <Spacing size={16} />
        <TextField
          label="이름"
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          placeholder="예: 홍길동"
          required
          error={errors.worker_name}
        />
        <Spacing size={24} />
        <Button
          color="primary"
          variant="fill"
          display="block"
          size="xlarge"
          disabled={!draft.name.trim()}
          onClick={() => confirm('name')}
        >
          확인
        </Button>
        <Spacing size={16} />
      </BottomSheet>

      {/* 전화번호 BottomSheet */}
      <BottomSheet open={openField === 'phone'} onClose={() => setOpenField(null)}>
        <Paragraph typography="st4" fontWeight="bold">전화번호</Paragraph>
        <Spacing size={16} />
        <TextField
          label="전화번호"
          value={draft.phone}
          onChange={(e) =>
            setDraft((d) => ({ ...d, phone: e.target.value.replace(/\D/g, '').slice(0, 11) }))
          }
          placeholder="01012345678"
          required
          error={errors.worker_phone}
        />
        <Spacing size={24} />
        <Button
          color="primary"
          variant="fill"
          display="block"
          size="xlarge"
          disabled={draft.phone.length < 10}
          onClick={() => confirm('phone')}
        >
          확인
        </Button>
        <Spacing size={16} />
      </BottomSheet>

      {/* 주소 BottomSheet */}
      <BottomSheet open={openField === 'address'} onClose={() => setOpenField(null)}>
        <Paragraph typography="st4" fontWeight="bold">근로자 주소 (선택)</Paragraph>
        <Spacing size={16} />
        <TextField
          label="주소"
          value={draft.address}
          onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))}
          placeholder="서울특별시 강남구..."
        />
        <Spacing size={24} />
        <Button
          color="primary"
          variant="fill"
          display="block"
          size="xlarge"
          onClick={() => confirm('address')}
        >
          확인
        </Button>
        <Spacing size={16} />
      </BottomSheet>
    </div>
  );
}
