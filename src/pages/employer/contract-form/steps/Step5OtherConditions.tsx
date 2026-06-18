import { TextArea, Spacing } from '@toss/tds-mobile';
import type { ContractFormData } from '../types';
import { CommentBoundary } from '../../../dev/CommentBoundary';
import { FunnelQuestion } from '../../../../components/funnel/FunnelQuestion';

interface Step5OtherConditionsProps {
  form: ContractFormData;
  handleChange: (field: string, value: string | boolean | string[]) => void;
}

export default function Step5OtherConditions({ form, handleChange }: Step5OtherConditionsProps) {
  return (
    <div>
      <CommentBoundary name="기타조건-자유텍스트">
        <FunnelQuestion
          title={<>추가로 기재할 내용이<br />있나요?</>}
          subtitle="선택사항이며, 계약서에 그대로 포함됩니다"
          isActive
        >
          <TextArea
            variant="line"
            label="기타 조건"
            value={form.other_conditions}
            onChange={(e) => handleChange('other_conditions', e.target.value)}
            placeholder="예: 수습 기간 3개월, 수습 기간 중 시급 90% 적용"
            minHeight={120}
          />
          <Spacing size={16} />
        </FunnelQuestion>
      </CommentBoundary>
    </div>
  );
}
