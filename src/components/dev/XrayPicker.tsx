import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * XrayPicker — 엘리먼트 피커 + 래핑 스캔 자동 엑스레이 오버레이
 * 
 * ?xray=true 가 URL에 있으면 자동 활성화.
 * 
 * 모드:
 *   1) 피커 모드 (기본) — 호버/클릭으로 아무 요소에 코멘트
 *   2) 스캔 모드 — 페이지 내 미래핑 섹션 자동 감지 → 하이라이트 + data-xray-name 부여
 * 
 * 식별 방식:
 *   1) data-xray-name 속성이 있으면 그 값 사용
 *   2) data-comment-boundary 속성이 있으면 그 값 사용 (CommentBoundary)
 *   3) CSS class 기반 의미 추출
 *   4) 태그 + 인덱스 기반 자동 이름
 */

function getXrayName(el: HTMLElement): string {
  // 1. data-xray-name 우선
  if (el.dataset.xrayName) return el.dataset.xrayName;

  // 2. CommentBoundary가 붙인 이름 감지
  const boundary = el.closest('[data-comment-boundary]');
  if (boundary) return (boundary as HTMLElement).dataset.commentBoundary || '';

  // 3. CSS class 기반 의미 추출
  const meaningful = Array.from(el.classList).find(c =>
    /header|hero|card|stat|list|form|grid|button|cta|section|content|footer|nav|sign|badge/i.test(c)
  );
  if (meaningful) return meaningful;

  // 4. 태그 + 인덱스 기반 자동 이름
  const tag = el.tagName.toLowerCase();
  const parent = el.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName);
    const idx = siblings.indexOf(el);
    if (siblings.length > 1) return `${tag}-${idx + 1}`;
  }
  return tag;
}

function getSelectorPath(el: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = el;
  while (current && current !== document.body && parts.length < 4) {
    let part = current.tagName.toLowerCase();
    if (current.id) {
      part += `#${current.id}`;
      parts.unshift(part);
      break;
    }
    if (current.className && typeof current.className === 'string') {
      const cls = current.className.split(' ').filter(c => c && !c.startsWith('_')).slice(0, 2).join('.');
      if (cls) part += `.${cls}`;
    }
    parts.unshift(part);
    current = current.parentElement;
  }
  return parts.join(' > ');
}

// 하이라이트 최소 크기 필터
function isHighlightable(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width < 40 || rect.height < 20) return false;
  const tag = el.tagName.toLowerCase();
  if (['html', 'body', 'script', 'style', 'link', 'meta', 'br', 'hr'].includes(tag)) return false;
  return true;
}

/**
 * 스캔 모드: 페이지 내 미래핑 주요 섹션 자동 감지
 * - CommentBoundary가 없는 의미 있는 섹션을 찾아 data-xray-name 부여
 * - 감지 기준: data-comment-boundary 없음 + 의미 있는 태그/클래스 + 충분한 크기
 */
interface ScanResult {
  el: HTMLElement;
  name: string;
  selector: string;
  rect: DOMRect;
  wrapped: boolean;
}

function scanUnwrappedSections(): ScanResult[] {
  const results: ScanResult[] = [];
  const visited = new Set<HTMLElement>();
  
  // 스캔할 의미 있는 선택자
  const sectionSelectors = [
    '[class*="section"]', '[class*="Section"]',
    '[class*="card"]', '[class*="Card"]',
    '[class*="hero"]', '[class*="Hero"]',
    '[class*="header"]', '[class*="Header"]',
    '[class*="footer"]', '[class*="Footer"]',
    '[class*="form"]', '[class*="Form"]',
    '[class*="list"]', '[class*="List"]',
    '[class*="grid"]', '[class*="Grid"]',
    '[class*="cta"]', '[class*="CTA"]',
    '[class*="nav"]', '[class*="Nav"]',
    'section', 'header', 'footer', 'nav', 'main', 'article',
    'form',
  ];
  
  // 1. 의미 있는 CSS 클래스/태그를 가진 섹션 감지
  for (const sel of sectionSelectors) {
    try {
      document.querySelectorAll(sel).forEach(el => {
        const htmlEl = el as HTMLElement;
        if (visited.has(htmlEl)) return;
        visited.add(htmlEl);
        
        const rect = htmlEl.getBoundingClientRect();
        if (rect.width < 60 || rect.height < 30) return;
        
        // 이미 CommentBoundary 안에 있으면 스킵
        if (htmlEl.closest('[data-comment-boundary]')) return;
        // XrayPicker 오버레이 자체 스킵
        if (htmlEl.closest('[data-xray-scan-overlay]')) return;
        
        const name = getXrayName(htmlEl);
        htmlEl.dataset.xrayName = name;
        
        results.push({
          el: htmlEl,
          name,
          selector: getSelectorPath(htmlEl),
          rect,
          wrapped: false,
        });
      });
    } catch { /* invalid selector */ }
  }
  
  // 2. data-comment-boundary가 있는 영역도 결과에 포함 (wrapped = true)
  document.querySelectorAll('[data-comment-boundary]').forEach(el => {
    const htmlEl = el as HTMLElement;
    if (visited.has(htmlEl)) return;
    visited.add(htmlEl);
    
    const rect = htmlEl.getBoundingClientRect();
    results.push({
      el: htmlEl,
      name: htmlEl.dataset.commentBoundary || '',
      selector: getSelectorPath(htmlEl),
      rect,
      wrapped: true,
    });
  });
  
  // y축 기준 정렬
  results.sort((a, b) => a.rect.top - b.rect.top);
  return results;
}

export function XrayPicker() {
  const isXray = new URLSearchParams(window.location.search).get('xray') === 'true';
  const [pickerActive, setPickerActive] = useState(true);
  const [scanMode, setScanMode] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [hoverName, setHoverName] = useState('');
  const [comments, setComments] = useState<Array<{ target: string; selector: string; message: string; page?: string }>>([]);
  const hoveredEl = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 서버에서 기존 코멘트 불러오기
  useEffect(() => {
    if (!isXray) return;
    fetch('/api/ux-test/designs')
      .then(r => r.json())
      .then(list => {
        const target = list.find((d: any) => d.page === window.location.pathname) || list[0];
        if (target) return fetch('/api/ux-test/designs/' + encodeURIComponent(target.filename));
        throw new Error('No files');
      })
      .then(r => r.json())
      .then(data => {
        if (data.comments) {
          setComments(data.comments.map((c: any) => ({
            target: c.targetComponent || c.target || '',
            selector: c.selector || '',
            message: c.message || '',
            page: c.page || '',
          })));
        }
      })
      .catch(() => {});
  }, [isXray]);

  // 스캔 모드 토글
  const handleScan = useCallback(() => {
    if (scanMode) {
      // 스캔 모드 끄기 → data-xray-name 정리
      scanResults.forEach(r => {
        if (!r.wrapped && r.el.dataset.xrayName) {
          delete r.el.dataset.xrayName;
        }
      });
      setScanMode(false);
      setScanResults([]);
      return;
    }
    const results = scanUnwrappedSections();
    setScanResults(results);
    setScanMode(true);
    setPickerActive(false); // 스캔 모드 시 피커 끄기
  }, [scanMode, scanResults]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!pickerActive) return;
    if (overlayRef.current?.contains(e.target as Node)) return;

    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    if (!el || !isHighlightable(el)) {
      setHoverRect(null);
      hoveredEl.current = null;
      return;
    }
    hoveredEl.current = el;
    setHoverRect(el.getBoundingClientRect());
    setHoverName(getXrayName(el));
  }, [pickerActive]);

  const handleClick = useCallback(async (e: MouseEvent) => {
    if (!pickerActive) return;
    if (overlayRef.current?.contains(e.target as Node)) return;

    e.preventDefault();
    e.stopPropagation();

    const el = hoveredEl.current;
    if (!el) return;

    const name = getXrayName(el);
    const selector = getSelectorPath(el);
    const msg = prompt(
      `📍 [${name}] 영역에 코멘트를 남겨주세요:\n\n` +
      `(저장 후 에이전트에게 '코멘트 반영해줘'라고 말하면 코드가 직접 수정됩니다)\n\n` +
      `경로: ${selector}`
    );
    if (!msg) return;

    setComments(prev => [...prev, { target: name, selector, message: msg, page: window.location.pathname }]);

    try {
      const listRes = await fetch('/api/ux-test/designs');
      const list = await listRes.json();
      if (!list || list.length === 0) throw new Error('디자인 파일이 없습니다.');
      const target = list.find((d: any) => d.page === window.location.pathname) || list[0];
      const filename = target.filename;
      const res = await fetch('/api/ux-test/designs/' + encodeURIComponent(filename));
      const data = await res.json();
      if (!data.comments) data.comments = [];
      data.comments.push({
        targetComponent: name,
        selector,
        message: msg,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
      });

      const apiKey = localStorage.getItem('UX_TEST_LLM_API_KEY') || undefined;
      await fetch('/api/ux-test/designs/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, data, apiKey }),
      });
    } catch (err: any) {
      alert('코멘트 저장 실패: ' + err.message);
    }
  }, [pickerActive]);

  useEffect(() => {
    if (!isXray) return;
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
    };
  }, [isXray, handleMouseMove, handleClick]);

  if (!isXray) return null;

  const wrappedCount = scanResults.filter(r => r.wrapped).length;
  const unwrappedCount = scanResults.filter(r => !r.wrapped).length;
  const pageComments = comments.filter(c => !c.page || c.page === window.location.pathname);

  return (
    <div data-xray-scan-overlay>
      {/* 피커 하이라이트 오버레이 */}
      {hoverRect && pickerActive && !scanMode && (
        <div
          style={{
            position: 'fixed',
            left: hoverRect.left - 2,
            top: hoverRect.top - 2,
            width: hoverRect.width + 4,
            height: hoverRect.height + 4,
            border: '2px dashed #3182f6',
            background: 'rgba(49, 130, 246, 0.06)',
            pointerEvents: 'none',
            zIndex: 99998,
            borderRadius: 4,
            transition: 'all 0.1s ease',
          }}
        >
          <div style={{
            position: 'absolute', top: -20, left: 0,
            background: '#3182f6', color: '#fff', fontSize: 10, fontWeight: 600,
            padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          }}>
            {hoverName} 💬
          </div>
        </div>
      )}

      {/* 스캔 모드: 감지된 섹션 오버레이 */}
      {scanMode && scanResults.map((r, i) => (
        <div
          key={`scan-${i}`}
          style={{
            position: 'fixed',
            left: r.rect.left - 2,
            top: r.rect.top - 2,
            width: r.rect.width + 4,
            height: r.rect.height + 4,
            border: r.wrapped ? '2px solid #34c759' : '2px dashed #ff9500',
            background: r.wrapped ? 'rgba(52, 199, 89, 0.06)' : 'rgba(255, 149, 0, 0.06)',
            pointerEvents: 'none',
            zIndex: 99997,
            borderRadius: 4,
          }}
        >
          <div style={{
            position: 'absolute', top: -18, left: 0,
            background: r.wrapped ? '#34c759' : '#ff9500',
            color: '#fff', fontSize: 9, fontWeight: 600,
            padding: '1px 6px', borderRadius: 3, whiteSpace: 'nowrap',
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}>
            {r.wrapped ? '✅' : '⚠️'} {r.name}
          </div>
        </div>
      ))}

      {/* 기존 코멘트 표시 */}
      {pageComments.map((c, i) => (
        <div
          key={`comment-${i}`}
          style={{
            position: 'fixed',
            top: 8 + i * 28,
            right: 8,
            background: '#ff3b30',
            color: '#fff',
            fontSize: 10,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 6,
            zIndex: 99999,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            maxWidth: 280,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          [{c.target}] {c.message}
        </div>
      ))}

      {/* FAB 버튼 그룹 */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'flex-end',
        }}
      >
        {/* 스캔 모드 버튼 */}
        <button
          onClick={handleScan}
          style={{
            background: scanMode ? '#ff9500' : '#1c1c1e',
            color: '#fff',
            border: 'none',
            borderRadius: 24,
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background 0.2s',
          }}
        >
          {scanMode ? `🔎 스캔 ON (${unwrappedCount} 미래핑)` : '🔎 스캔'}
        </button>

        {/* 스캔 모드 요약 */}
        {scanMode && (
          <div style={{
            background: 'rgba(0,0,0,0.85)',
            color: '#fff', fontSize: 10, padding: '6px 10px',
            borderRadius: 8, whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            ✅ 래핑: {wrappedCount}개 &nbsp; ⚠️ 미래핑: {unwrappedCount}개
          </div>
        )}

        {/* 피커 토글 버튼 */}
        <button
          onClick={() => { setPickerActive(p => !p); if (scanMode) handleScan(); }}
          style={{
            background: pickerActive && !scanMode ? '#7c3aed' : '#6b7280',
            color: '#fff',
            border: 'none',
            borderRadius: 24,
            padding: '8px 16px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'background 0.2s',
          }}
        >
          {pickerActive && !scanMode ? '🔍 피커 ON' : '🔍 피커 OFF'}
        </button>

        {/* 모드 설명 */}
        <div style={{
          background: 'rgba(0,0,0,0.75)',
          color: '#fff', fontSize: 10, padding: '4px 8px',
          borderRadius: 6, whiteSpace: 'nowrap',
        }}>
          {scanMode ? '미래핑 섹션이 주황색으로 표시됨' : pickerActive ? '요소를 클릭해서 코멘트' : '피커 비활성'}
        </div>
      </div>
    </div>
  );
}
