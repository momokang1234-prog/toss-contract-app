/**
 * IconsCatalogPage — TDS Asset.Icon 이름 카탈로그 (dev 전용)
 *
 * 배경:
 *   TDS 문서(ax search)에는 전체 아이콘 목록이 없다. 약 7000개의 아이콘은
 *   토스 런타임 CDN에 존재하며, 공식적으로는 App Builder 콘솔이나 Figma 플러그인으로만
 *   전수 열람할 수 있다. 이 페이지는 프로젝트/패키지/문서에서 발견한 이름을 미리보기와 함께
 *   렌더링하는 참조용 catalog이다.
 *
 * 렌더링:
 *   <Asset.Icon name="..."> 는 apps-in-toss 런타임이 주입하는 CDN에서만 실제 이미지가
 *   로드된다. 일반 브라우저(dev.na1284.tossapps.com 이외)에서는 빈 칸으로 보일 수 있다.
 *   반드시 샌드박스 환경에서 확인할 것.
 *
 * 확장:
 *   새 이름을 발견하면 ICON_NAMES 배열에 추가하면 된다.
 */
import { useState } from 'react';
import { Asset, Paragraph, Spacing, TextField } from '@toss/tds-mobile';

// 프로젝트/패키지/문서에서 수집한 알려진 아이콘 이름
const ICON_NAMES: { name: string; source?: string }[] = [
  { name: 'icon-arrow-down-mono', source: 'tds-mobile' },
  { name: 'icon-arrow-up-mono', source: 'tds-mobile' },
  { name: 'icon-arrow-right-mono', source: 'tds-mobile + docs' },
  { name: 'icon-arrow-right-small-mono', source: 'tds-mobile + docs' },
  { name: 'icon-arrow-left-small-mono', source: 'tds-mobile' },
  { name: 'icon-arrow-up-sidebar-mono', source: 'tds-mobile' },
  { name: 'icon-call-mono', source: 'tds-mobile' },
  { name: 'icon-eye-on-mono', source: 'tds-mobile' },
  { name: 'icon-eye-off-mono', source: 'tds-mobile' },
  { name: 'icon-point-circle-mono', source: 'tds-mobile' },
  { name: 'icon-refresh-mono', source: 'tds-mobile' },
  { name: 'icon-search-bold-mono', source: 'tds-mobile + docs' },
  { name: 'icon-setting-mono', source: 'tds-mobile' },
  { name: 'icon-share-mono', source: 'granite.config.ts' },
  { name: 'icon-star-mono', source: 'tds-mobile' },
  { name: 'icon-x-circle-mono', source: 'tds-mobile' },
  { name: 'icon-plus-small-mono', source: 'docs' },
  { name: 'icon-warning-circle', source: 'docs' },
  { name: 'icon-warning-circle-red', source: 'tds-mobile' },
];

export default function IconsCatalogPage() {
  const [query, setQuery] = useState('');

  const filtered = ICON_NAMES.filter((item) =>
    item.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div style={{ padding: 20, background: '#fff', minHeight: '100vh' }}>
      <Paragraph typography="st3" fontWeight="bold">
        TDS Icon Catalog
      </Paragraph>
      <Spacing size={4} />
      <Paragraph typography="t6" color="grey500">
        apps-in-toss 런타임이 주입하는 CDN에서 렌더링. 일반 브라우저에선 빈 칸일 수 있음.
      </Paragraph>
      <Spacing size={16} />

      <TextField
        placeholder="이름으로 검색 (예: arrow, share)"
        variant="line"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Spacing size={16} />

      <Paragraph typography="t6" color="grey700">
        {filtered.length} / {ICON_NAMES.length} 개 — 전체 카탈로그는 App Builder 콘솔/Figma 플러그인에서만 열람 가능
      </Paragraph>
      <Spacing size={12} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}
      >
        {filtered.map((item) => (
          <div
            key={item.name}
            style={{
              border: '1px solid #E5E8EB',
              borderRadius: 12,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              background: '#FAFBFC',
              minHeight: 120,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Asset.Icon name={item.name} />
            </div>
            <Paragraph typography="t7" fontWeight="medium" style={{ textAlign: 'center', wordBreak: 'break-all' }}>
              {item.name}
            </Paragraph>
            {item.source && (
              <Paragraph typography="t7" color="grey400">
                {item.source}
              </Paragraph>
            )}
          </div>
        ))}
      </div>

      <Spacing size={32} />
      <div
        style={{
          padding: 16,
          background: '#FFF7E6',
          borderRadius: 12,
          border: '1px solid #FFD666',
        }}
      >
        <Paragraph typography="t6" fontWeight="bold">
          이름 추가 방법
        </Paragraph>
        <Spacing size={4} />
        <Paragraph typography="t7" color="grey700">
          • App Builder 콘솔 &gt; Asset 패널에서 검색 후 name 복사
          <br />
          • Figma 토스 플러그인에서 아이콘 클릭 시 name 표시
          <br />
          • 알맞은 이름을 이 파일의 ICON_NAMES 배열에 추가
        </Paragraph>
      </div>
    </div>
  );
}
