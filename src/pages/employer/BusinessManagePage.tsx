import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../../hooks/useBusiness';
import { Top, Paragraph, Spacing, Button, TextField, BottomSheet, TextButton } from '@toss/tds-mobile';
import styles from './BusinessManagePage.module.css';

export default function BusinessManagePage() {
  const navigate = useNavigate();
  const { businesses, updateBusiness } = useBusiness();
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const biz = businesses[0];
  
  const [form, setForm] = useState({
    business_name: '',
    representative: '',
    address: '',
    phone: '',
  });

  const handleEditClick = () => {
    if (biz) {
      setForm({
        business_name: biz.business_name || '',
        representative: biz.representative || '',
        address: biz.address || '',
        phone: biz.phone || '',
      });
    }
    setIsEditSheetOpen(true);
  };

  if (!biz) {
    return (
      <div className={styles.page}>
        <Top title="" />
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <Paragraph typography="t5" color="grey-600">등록된 사업장이 없습니다.</Paragraph>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await updateBusiness(biz.id, form);
      setIsEditSheetOpen(false);
    } catch (err: any) {
      alert('저장에 실패했습니다: ' + (err.message || '알 수 없는 오류'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Top title="" />
      
      <div style={{ padding: '0 24px' }}>
        <Spacing size={24} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Paragraph typography="t3" fontWeight="bold">사업장 정보</Paragraph>
          <TextButton size="small" onClick={handleEditClick}>수정하기</TextButton>
        </div>
        <Spacing size={24} />

        <div className={styles.section}>
          <div className={styles.row}>
            <Paragraph typography="t6" color="grey-500">상호</Paragraph>
            <Paragraph typography="t5" color="grey-800" fontWeight="bold">{biz.business_name}</Paragraph>
          </div>
          <div className={styles.row}>
            <Paragraph typography="t6" color="grey-500">사업자등록번호</Paragraph>
            <Paragraph typography="t5" color="grey-800" fontWeight="bold">{biz.business_number}</Paragraph>
          </div>
          <div className={styles.row}>
            <Paragraph typography="t6" color="grey-500">대표자</Paragraph>
            <Paragraph typography="t5" color="grey-800" fontWeight="bold">{biz.representative}</Paragraph>
          </div>
          <div className={styles.row}>
            <Paragraph typography="t6" color="grey-500">사업장 소재지</Paragraph>
            <Paragraph typography="t5" color="grey-800" fontWeight="bold">{biz.address}</Paragraph>
          </div>
          <div className={styles.row}>
            <Paragraph typography="t6" color="grey-500">전화번호</Paragraph>
            <Paragraph typography="t5" color="grey-800" fontWeight="bold">{biz.phone || '-'}</Paragraph>
          </div>
          
          <Spacing size={40} />
          <div style={{ padding: '20px', backgroundColor: '#F2F4F6', borderRadius: '16px', marginBottom: '24px' }}>
            <Paragraph typography="t6" color="grey-700">
              💡 여기에 등록된 사업장 정보가 근로계약서에 들어가요.
            </Paragraph>
          </div>
        </div>
      </div>

      <BottomSheet 
        open={isEditSheetOpen} 
        onClose={() => setIsEditSheetOpen(false)}
        header={<BottomSheet.Header>사업장 정보 수정</BottomSheet.Header>}
      >
        <div style={{ padding: '0 24px 24px' }}>
          <TextField
            variant="line"
            labelOption="sustain"
            label="상호"
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
          />
          <Spacing size={24} />
          <TextField
            variant="line"
            labelOption="sustain"
            label="대표자"
            value={form.representative}
            onChange={(e) => setForm({ ...form, representative: e.target.value })}
          />
          <Spacing size={24} />
          <TextField
            variant="line"
            labelOption="sustain"
            label="사업장 소재지"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <Spacing size={24} />
          <TextField
            variant="line"
            labelOption="sustain"
            label="전화번호"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          
          <Spacing size={32} />
          <div style={{ padding: '20px', backgroundColor: '#F2F4F6', borderRadius: '16px', marginBottom: '16px' }}>
            <Paragraph typography="t6" color="grey-700">
              💡 여기서 수정한 정보는 앞으로 작성할 근로계약서에 자동으로 들어가요. (기존에 작성된 계약서는 바뀌지 않아요)
            </Paragraph>
          </div>
        </div>

        <BottomSheet.CTA>
          <Button color="primary" variant="fill" display="block" size="xlarge" onClick={handleSave} disabled={submitting}>
            {submitting ? '저장 중...' : '저장하기'}
          </Button>
        </BottomSheet.CTA>
      </BottomSheet>
    </div>
  );
}
