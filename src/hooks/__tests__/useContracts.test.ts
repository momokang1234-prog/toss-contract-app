import { describe, it, expect } from 'vitest';

// 상태 전이 규칙 테스트 (비즈니스 로직만 검증)
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['viewed', 'expired', 'cancelled'],
  viewed: ['signed', 'expired', 'cancelled', 'rejected'],
  signed: ['completed'],
  completed: [],
  cancelled: [],
  expired: [],
  rejected: [],
};

function canTransition(from: string, to: string): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

describe('상태 전이 규칙', () => {
  it('draft → sent 허용', () => expect(canTransition('draft', 'sent')).toBe(true));
  it('sent → viewed 허용', () => expect(canTransition('sent', 'viewed')).toBe(true));
  it('viewed → signed 허용', () => expect(canTransition('viewed', 'signed')).toBe(true));
  it('signed → completed 허용', () => expect(canTransition('signed', 'completed')).toBe(true));
  it('draft → cancelled 허용', () => expect(canTransition('draft', 'cancelled')).toBe(true));
  it('viewed → rejected 허용', () => expect(canTransition('viewed', 'rejected')).toBe(true));

  it('completed → cancelled 불가', () => expect(canTransition('completed', 'cancelled')).toBe(false));
  it('expired → signed 불가', () => expect(canTransition('expired', 'signed')).toBe(false));
  it('cancelled → sent 불가', () => expect(canTransition('cancelled', 'sent')).toBe(false));
  it('draft → completed 불가', () => expect(canTransition('draft', 'completed')).toBe(false));
});
