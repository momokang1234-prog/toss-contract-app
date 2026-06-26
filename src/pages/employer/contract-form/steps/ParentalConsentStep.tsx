import { useState, useEffect } from 'react';
import type { ContractFormData } from '../types';
import { CommentBoundary } from '../../../dev/CommentBoundary';
import { FunnelQuestion } from '../../../../components/funnel/FunnelQuestion';
import SignaturePad from '../../../../components/SignaturePad';
import { getAge } from '../../../../hooks/useContracts.types';

interface ParentalConsentStepProps {
  form: ContractFormData;
  errors: Record<string, string>;
  handleChange: (field: string, value: string | boolean | string[]) => void;
}

/**
 * 친권자(법정대리인) 동의 스텝 — 미성년자(만 19세 미만) 근로계약 시 필수 (민법·근로기준법 제66조).
 * 친권자 정보 + 동의 서명을 받아 parent_consent_data(JSON)로 조립한다.
 */
export default function ParentalConsentStep({ form, errors, handleChange }: ParentalConsentStepProps) {
  const [activeField, setActiveField] = useState<'parentName' | 'relation' | 'phone' | 'sign'>('parentName');

  // parent_consent_data는 { signer, relation, phone, signature, hash, signedAt } JSON.
  // 입력값 변경 시 부분 업데이트하여 다시 직렬화.
  const consent = parseConsent(form.parent_consent_data);

  useEffect(() => {
    if (errors.parent_consent_data) setActiveField('sign');
    else if (errors.parent_relation) setActiveField('relation');
    else if (errors.parent_phone) setActiveField('phone');
    else if (errors.parent_name) setActiveField('parentName');
  }, [errors.parent_name, errors.parent_relation, errors.parent_phone, errors.parent_consent_data]);

  const updateConsent = (patch: Partial<ConsentData>) => {
    const next = { ...consent, ...patch };
    // signature 없으면 저장하지 않음 (빈 서명 검증 방지)
    handleChange('parent_consent_data', JSON.stringify(next));
  };

  const age = getAge(form.worker_birth_date);

  return (
    <div>
      <CommentBoundary name="친권자동의-이름">
        <FunnelQuestion
          title={<>친권자(법정대리인)의<br/>이름을 입력해주세요</>}
          subtitle={`만 ${age}세 미성년자 근로계약에 필요한 동의예요`}
          isActive={activeField === 'parentName'}
          onEnter={() => setActiveField('parentName')}
          summary={consent.signer ? `친권자: ${consent.signer}` : undefined}
        >
          <label className="funnel-label">친권자 이름</label>
          <input
            className="funnel-huge-input"
            placeholder="예: 홍길동"
            value={consent.signer ?? ''}
            onChange={e => updateConsent({ signer: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter' && (consent.signer ?? '').trim()) setActiveField('relation'); }}
          />
          {errors.parent_name && (
            <div style={{ color: '#f04452', fontSize: 13, marginTop: 8 }}>{errors.parent_name}</div>
          )}
        </FunnelQuestion>
      </CommentBoundary>

      {(consent.signer ?? '').trim().length > 0 && (
        <CommentBoundary name="친권자동의-관계">
          <FunnelQuestion
            title={<>{consent.signer}님과 근로자의<br/>관계를 알려주세요</>}
            isActive={activeField === 'relation'}
            onEnter={() => setActiveField('relation')}
            summary={consent.relation ? `관계: ${consent.relation}` : undefined}
          >
            <label className="funnel-label">근로자와의 관계</label>
            <input
              className="funnel-huge-input"
              placeholder="예: 부, 모, 기타"
              value={consent.relation ?? ''}
              onChange={e => updateConsent({ relation: e.target.value })}
              onKeyDown={e => { if (e.key === 'Enter' && (consent.relation ?? '').trim()) setActiveField('phone'); }}
            />
            {errors.parent_relation && (
              <div style={{ color: '#f04452', fontSize: 13, marginTop: 8 }}>{errors.parent_relation}</div>
            )}
          </FunnelQuestion>
        </CommentBoundary>
      )}

      {(consent.relation ?? '').trim().length > 0 && (
        <CommentBoundary name="친권자동의-연락처">
          <FunnelQuestion
            title={<>{consent.signer}님의 연락처를<br/>알려주세요</>}
            subtitle="- 없이 숫자만 입력해주세요"
            isActive={activeField === 'phone'}
            onEnter={() => setActiveField('phone')}
            summary={consent.phone ? `연락처: ${consent.phone}` : undefined}
          >
            <label className="funnel-label">친권자 연락처</label>
            <input
              className="funnel-huge-input"
              type="tel"
              placeholder="01012345678"
              value={consent.phone ?? ''}
              onChange={e => updateConsent({ phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
              onKeyDown={e => { if (e.key === 'Enter' && (consent.phone ?? '').length >= 10) setActiveField('sign'); }}
            />
            {errors.parent_phone && (
              <div style={{ color: '#f04452', fontSize: 13, marginTop: 8 }}>{errors.parent_phone}</div>
            )}
          </FunnelQuestion>
        </CommentBoundary>
      )}

      {(consent.phone ?? '').length >= 10 && (
        <CommentBoundary name="친권자동의-서명">
          <FunnelQuestion
            title={<>{consent.signer}님의 서명을<br/>남겨주세요</>}
            subtitle="미성년자 근로계약 체결에 동의함을 서명합니다"
            isActive={activeField === 'sign'}
            onEnter={() => setActiveField('sign')}
          >
            <div style={{ background: '#FFF9E6', border: '1px solid #FFE082', borderRadius: 12, padding: 16, fontSize: 14, color: '#694500', lineHeight: 1.6, marginBottom: 16 }}>
              본인은 미성년자 <strong>{form.worker_name}</strong>(만 {age}세)의 근로계약 체결에 동의합니다.
              <br /><span style={{ fontSize: 12 }}>근로기준법 제66조 · 민법 미성년자 규정</span>
            </div>
            <SignaturePad onChange={(data) => {
              if (data) {
                updateConsent({ signature: data, signedAt: new Date().toISOString() });
              } else {
                updateConsent({ signature: undefined, signedAt: undefined });
              }
            }} />
            {errors.parent_consent_data && (
              <div style={{ color: '#f04452', fontSize: 13, marginTop: 8 }}>{errors.parent_consent_data}</div>
            )}
          </FunnelQuestion>
        </CommentBoundary>
      )}
    </div>
  );
}

interface ConsentData {
  signer?: string;
  relation?: string;
  phone?: string;
  signature?: string;
  hash?: string;
  signedAt?: string;
}

function parseConsent(json?: string): ConsentData {
  if (!json) return {};
  try { return JSON.parse(json); } catch { return {}; }
}
