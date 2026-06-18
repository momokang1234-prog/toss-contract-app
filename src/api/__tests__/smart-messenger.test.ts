import { describe, it, expect, vi, beforeEach } from 'vitest';

// @apps-in-toss/web-framework 동적 import를 가짜로 대체 (실제 패키지는 브라우저/RN 전용)
vi.mock('@apps-in-toss/web-framework', () => ({
  getTossShareLink: vi.fn(),
  share: vi.fn(),
}));

// supabase 클라이언트 생성(realtime WebSocket)이 Node 테스트 환경에서 실패하므로 대체
vi.mock('../supabase', () => ({ supabase: {}, IS_MOCK: true }));

import { shareContract } from '../smart-messenger';
import { getTossShareLink, share } from '@apps-in-toss/web-framework';

const mockGetTossShareLink = vi.mocked(getTossShareLink);
const mockShare = vi.mocked(share);
const mockWriteText = vi.fn();

beforeEach(() => {
  // navigator.clipboard 폴백 경로 검증용 스텁
  vi.stubGlobal('navigator', { clipboard: { writeText: mockWriteText } });
  vi.clearAllMocks();
  // clipboard 기본 동작: 성공 (각 테스트에서 필요 시 오버라이드)
  mockWriteText.mockResolvedValue(undefined);
});

describe('shareContract — 토스 공유 시트(옵션 A)', () => {
  it('공유 성공 시 shared=true 를 반환한다', async () => {
    mockGetTossShareLink.mockResolvedValue('https://share.toss.im/abc');
    mockShare.mockResolvedValue(undefined);

    const result = await shareContract('contract-123');

    expect(result.shared).toBe(true);
    expect(mockShare).toHaveBeenCalledTimes(1);
  });

  it('근로자가 미니앱을 여는 intoss:// 딥링크를 생성해 공유한다', async () => {
    mockGetTossShareLink.mockResolvedValue('https://share.toss.im/abc');
    mockShare.mockResolvedValue(undefined);

    await shareContract('contract-123');

    expect(mockGetTossShareLink).toHaveBeenCalledWith(
      'intoss://bossimclockedin/contract/contract-123',
      expect.any(String),
    );
    // 공유 메시지에 getTossShareLink 가 감싼 링크가 포함돼야 한다
    expect(mockShare).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('https://share.toss.im/abc'),
      }),
    );
  });

  it('서로 다른 계약 ID로 서로 다른 딥링크를 생성한다', async () => {
    mockGetTossShareLink.mockResolvedValue('https://share.toss.im/abc');

    await shareContract('AAA');
    await shareContract('BBB');

    expect(mockGetTossShareLink).toHaveBeenNthCalledWith(
      1, 'intoss://bossimclockedin/contract/AAA', expect.any(String),
    );
    expect(mockGetTossShareLink).toHaveBeenNthCalledWith(
      2, 'intoss://bossimclockedin/contract/BBB', expect.any(String),
    );
  });

  it('share 호출이 실패하면 clipboard 로 폴백한다 (브라우저 환경)', async () => {
    mockGetTossShareLink.mockResolvedValue('https://share.toss.im/abc');
    mockShare.mockRejectedValue(new Error('share unavailable'));

    const result = await shareContract('contract-123');

    expect(result.shared).toBe(false);
    expect(result.copied).toBe(true);
    // clipboard 에는 원본 intoss:// 스킴이 복사된다
    expect(mockWriteText).toHaveBeenCalledWith('intoss://bossimclockedin/contract/contract-123');
  });

  it('web-framework 호출(getTossShareLink)이 실패해도 clipboard 로 폴백한다', async () => {
    mockGetTossShareLink.mockRejectedValue(new Error('not in toss app'));

    const result = await shareContract('contract-123');

    expect(result.shared).toBe(false);
    expect(result.copied).toBe(true);
  });

  it('share 와 clipboard 모두 사용 불가능하면 { shared:false, copied:false } 를 반환한다', async () => {
    mockGetTossShareLink.mockResolvedValue('https://share.toss.im/abc');
    mockShare.mockRejectedValue(new Error('no share'));
    mockWriteText.mockRejectedValue(new Error('no clipboard'));

    const result = await shareContract('contract-123');

    expect(result).toEqual({ shared: false, copied: false });
  });
});
