import { useState, useEffect, useRef, useContext, createContext, type ReactNode } from 'react';

// ── Context: 계층 경로 자동 추적 ──────────────────────────────────
const BoundaryContext = createContext<string[]>([]);

/**
 * CommentBoundary — 엑스레이 코멘트 경계 컴포넌트
 * 
 * ?xray=true 활성화 시:
 *   - 파란 점선 테두리 + 이름 라벨 표시
 *   - 클릭 → 코멘트 다이얼로그 → 서버 저장
 *   - 계층 경로 자동 생성 (부모 경로 > 현재 이름)
 *   - 코멘트 개수 배지, 해결 상태 표시
 * 
 * CommentBoundary 없는 요소도 XrayPicker로 코멘트 가능.
 */
export function CommentBoundary({ name, children }: { name: string, children: ReactNode }) {
  const isXray = new URLSearchParams(window.location.search).get('xray') === 'true';
  const [comment, setComment] = useState('');
  const [serverComments, setServerComments] = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);
  const path = useContext(BoundaryContext);
  const fullPath = [...path, name];
  const pathLabel = fullPath.join(' > ');
  const countRef = useRef(0);

  useEffect(() => {
    fetch('/api/ux-test/designs')
      .then(res => res.json())
      .then(list => {
        const target = list.find((d: any) => d.page === window.location.pathname) || list[0];
        if(target) return fetch('/api/ux-test/designs/' + encodeURIComponent(target.filename));
        throw new Error('No files');
      })
      .then(res => res.json())
      .then(data => {
        if (data.comments) {
          // 정확한 이름 매칭 + 경로 매칭
          const matched = data.comments.filter((c: any) =>
            c.targetComponent === name || c.targetComponent === pathLabel
          );
          setServerComments(matched);
          countRef.current = matched.length;
        }
      })
      .catch(console.error);
  }, [name, pathLabel]);

  const displayComment = comment || (serverComments.length > 0 ? serverComments[serverComments.length - 1].message : '');
  const commentCount = serverComments.length;
  const hasUnresolved = serverComments.some((c: any) => !c.resolved);

  const handleComment = async () => {
    const msg = prompt(
      `[${pathLabel}] 영역에 코멘트를 남겨주세요:\n` +
      `(저장 후 에이전트에게 '코멘트 반영해줘'라고 말하면 코드가 직접 수정됩니다)\n` +
      `경로: ${pathLabel}`
    );
    if (!msg) return;
    
    setComment(msg);
    
    try {
      const listRes = await fetch('/api/ux-test/designs');
      const list = await listRes.json();
      if (!list || list.length === 0) throw new Error("디자인 파일이 없습니다.");
      const target = list.find((d: any) => d.page === window.location.pathname) || list[0];
      const filename = target.filename;

      const res = await fetch('/api/ux-test/designs/' + encodeURIComponent(filename));

      const data = await res.json();
      
      if (!data.comments) data.comments = [];
      data.comments.push({
        targetComponent: name,
        targetPath: pathLabel,
        message: msg,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        resolved: false,
      });
      
      const apiKey = localStorage.getItem('UX_TEST_LLM_API_KEY') || undefined;
      
      const saveRes = await fetch('/api/ux-test/designs/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, data, apiKey })
      });
      
      if (!saveRes.ok) throw new Error("저장 API 호출 실패");
    } catch (err: any) {
      alert('코멘트 저장 실패: ' + err.message);
    }
  };

  if (!isXray && !displayComment) return <>{children}</>;

  // xray 모드가 아니지만 코멘트가 있으면 최소 표시
  if (!isXray && displayComment) {
    return (
      <BoundaryContext.Provider value={fullPath}>
        <div data-comment-boundary={name} data-comment-path={pathLabel} style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: -8, right: 8, background: '#ff3b30', color: '#fff', fontSize: 9, padding: '1px 6px', borderRadius: 3, zIndex: 10, whiteSpace: 'nowrap' }}>
            {displayComment}
          </div>
          {children}
        </div>
      </BoundaryContext.Provider>
    );
  }

  // xray 활성 모드 — 풀 디테일 표시
  return (
    <BoundaryContext.Provider value={fullPath}>
      <div data-comment-boundary={name} data-comment-path={pathLabel} style={{ position: 'relative', border: '2px dashed #3182f6', margin: '4px', padding: '4px', backgroundColor: 'rgba(49, 130, 246, 0.05)' }}>
        {/* 이름 라벨 + 코멘트 카운트 배지 */}
        <div style={{ position: 'absolute', top: -14, left: 8, display: 'flex', alignItems: 'center', gap: 4, zIndex: 10 }}>
          <div
            onClick={handleComment}
            style={{
              background: '#3182f6', color: '#fff',
              fontSize: 10, padding: '2px 8px', borderRadius: 4, cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {name} 💬
          </div>
          {/* 코멘트 개수 배지 */}
          {commentCount > 0 && (
            <div style={{
              background: hasUnresolved ? '#ff3b30' : '#34c759',
              color: '#fff', fontSize: 9, fontWeight: 700,
              minWidth: 16, height: 16, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 4px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }}>
              {commentCount}
            </div>
          )}
        </div>

        {/* 최신 코멘트 말풍선 */}
        {displayComment && (
          <div
            onClick={() => setExpanded(e => !e)}
            style={{
              position: 'absolute', top: -14, right: 8,
              background: hasUnresolved ? '#ff3b30' : '#34c759',
              color: '#fff', fontSize: 9, padding: '2px 8px', borderRadius: 4,
              zIndex: 10, whiteSpace: expanded ? 'normal' : 'nowrap',
              maxWidth: expanded ? 300 : 200,
              overflow: expanded ? 'visible' : 'hidden',
              textOverflow: 'ellipsis',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'max-width 0.2s',
            }}
          >
            {displayComment}
          </div>
        )}

        {/* 전체 코멘트 목록 (확장 시) */}
        {expanded && serverComments.length > 0 && (
          <div style={{
            position: 'absolute', top: 0, right: 0, zIndex: 11,
            background: '#fff', border: '1px solid #e5e8eb', borderRadius: 8,
            padding: 8, minWidth: 250, maxWidth: 320,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: 11,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 4, color: '#191f28' }}>💬 코멘트 ({serverComments.length})</div>
            {serverComments.map((c: any, i: number) => (
              <div key={i} style={{ padding: '4px 0', borderBottom: i < serverComments.length - 1 ? '1px solid #e5e8eb' : 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: c.resolved ? '#34c759' : '#ff3b30', flexShrink: 0 }} />
                <span style={{ flex: 1, color: '#333' }}>{c.message}</span>
                <span style={{ color: '#999', fontSize: 9, flexShrink: 0 }}>
                  {c.timestamp ? new Date(c.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : ''}
                </span>
              </div>
            ))}
          </div>
        )}

        {children}
      </div>
    </BoundaryContext.Provider>
  );
}
