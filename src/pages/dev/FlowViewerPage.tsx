import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Global, css } from '@emotion/react';

const styles = css`
* { box-sizing: border-box; }
.flow-root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f2f4f6; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
.flow-header { padding: 12px 20px; background: #191f28; color: #fff; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; height: 50px; }
.flow-title { font-size: 16px; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 8px; }
.flow-tabs { display: flex; gap: 8px; }
.flow-tab { padding: 6px 12px; border-radius: 6px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; background: transparent; color: #8b95a1; border-bottom: 2px solid transparent; border-radius: 0; }
.flow-tab.active { color: #3182f6; border-color: #3182f6; }
.flow-tab:not(.active):hover { color: #fff; }

.flow-body { display: flex; flex: 1; overflow: hidden; }
.flow-sidebar { width: 280px; background: #fff; border-right: 1px solid #e5e8eb; display: flex; flex-direction: column; overflow-y: auto; }
.flow-sidebar-header { padding: 16px; border-bottom: 1px solid #e5e8eb; }
.flow-sidebar-title { font-size: 14px; font-weight: 700; color: #191f28; margin-bottom: 12px; }

.flow-controls { display: flex; flex-direction: column; gap: 8px; }
.checkbox-label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #4e5968; cursor: pointer; }

.tree-list { list-style: none; padding: 0; margin: 0; }
.tree-item { padding: 8px 16px; cursor: pointer; display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid #f2f4f6; transition: background 0.15s; }
.tree-item:hover { background: #f9fafb; }
.tree-item.active { background: #e8f3ff; border-left: 3px solid #3182f6; padding-left: 13px; }
.tree-item-title { font-size: 13px; font-weight: 600; color: #191f28; }
.tree-item-desc { font-size: 11px; color: #8b95a1; }
.tree-item-trigger { font-size: 10px; font-weight: 600; color: #d32f2f; background: #ffebee; padding: 2px 6px; border-radius: 4px; align-self: flex-start; margin-top: 2px; }
.tree-sub-item { padding-left: 28px; }

.flow-preview { flex: 1; display: flex; flex-direction: column; background: #f2f4f6; overflow: hidden; }
.preview-toolbar { padding: 8px 16px; background: #fff; border-bottom: 1px solid #e5e8eb; display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #8b95a1; flex-shrink: 0; }
.preview-url { font-family: 'SF Mono', Menlo, monospace; background: #f2f4f6; padding: 4px 8px; border-radius: 4px; color: #4e5968; }
.preview-canvas { flex: 1; display: flex; justify-content: center; align-items: center; padding: 20px; overflow: auto; }
.preview-frame-wrapper { background: #fff; border-radius: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); border: 8px solid #191f28; overflow: hidden; position: relative; flex-shrink: 0; transition: width 0.3s, height 0.3s; }
.preview-frame { width: 100%; height: 100%; border: none; background: #fff; }
`;

const DEVICES = [
  { id: 'iphone14', name: 'iPhone 14/15 Pro', width: 393, height: 852 },
  { id: 'iphone13mini', name: 'iPhone 13/12 mini', width: 375, height: 812 },
  { id: 'iphoneSE', name: 'iPhone SE', width: 375, height: 667 },
  { id: 'galaxys23', name: 'Galaxy S23/S24', width: 360, height: 780 },
];

interface FlowNode {
  id: string;
  title: string;
  desc: string;
  route: string;
  role: string;
  isSub?: boolean;
  triggerCondition?: (state: any) => boolean;
  triggerLabel?: string;
}

const CONTRACT_FLOW: FlowNode[] = [
  { id: 'c1', title: '1. 시작 (사업장 선택)', desc: '근로계약서를 작성할 사업장 선택', route: '/employer/business/manage', role: 'employer' },
  { id: 'c2', title: '2. 기본 정보 입력', desc: '직무 및 이름 입력', route: '/employer/contracts/new?contract-form-wizard=basicInfo', role: 'employer' },
  { id: 'c3', title: '3. 근로 형태 및 급여', desc: '시급/월급 선택 및 조건', route: '/employer/contracts/new?contract-form-wizard=workConditions', role: 'employer' },
  { id: 'c4', title: '4. 근무 요일 및 시간', desc: '매주 출근 요일과 스케줄', route: '/employer/contracts/new?contract-form-wizard=workSchedule', role: 'employer' },
  { id: 'c5', title: '5. 임금 및 보험', desc: '주휴수당 및 4대보험', route: '/employer/contracts/new?contract-form-wizard=wageInsurance', role: 'employer' },
  { id: 'c6', title: '6. 기타 조건', desc: '수습기간, 휴게시간 등 설정', route: '/employer/contracts/new?contract-form-wizard=otherConditions', role: 'employer', triggerCondition: s => s.hoursOver4, triggerLabel: '4시간 이상 (휴게 의무)' },
  { id: 'c7', title: '7. 최종 체크리스트', desc: '법적 의무사항 최종 점검', route: '/employer/contracts/new?contract-form-wizard=finalChecklist', role: 'employer' },
  { id: 'c8', title: '8. 계약서 미리보기', desc: '근로계약서 렌더링 확인', route: '/employer/contracts/new?contract-form-wizard=preview', role: 'employer' },
  { id: 'c9', title: '9. 서명 및 발송', desc: '사장님 서명 후 카톡 전송', route: '/employer/contracts/new?contract-form-wizard=employerSignature', role: 'employer' },
];

const SIGN_FLOW: FlowNode[] = [
  { id: 's1', title: '1. 링크 접속 및 로그인', desc: '알바생 카카오톡 링크 접속', route: '/login?preview=true', role: 'worker' },
  { id: 's2', title: '2. 계약서 내용 검토', desc: '근로계약서 내용 확인', route: '/worker/contracts/mock-1', role: 'worker' },
  { id: 's3', title: '3. 전자서명 진행', desc: '터치패드로 서명 입력', route: '/worker/contracts/mock-1/sign', role: 'worker' },
  { id: 's4', title: '4. 계약 완료', desc: '계약 체결 및 목록 이동', route: '/worker/contracts', role: 'worker' },
];

export default function FlowViewerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFlowId = searchParams.get('flow') || 'contract';
  const currentFlow = currentFlowId === 'contract' ? CONTRACT_FLOW : SIGN_FLOW;
  
  // State toggles for testing triggers
  const [device, setDevice] = useState(DEVICES[0]);
  const [isHourly, setIsHourly] = useState(true);
  const [hoursOver4, setHoursOver4] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [version, setVersion] = useState(() => Date.now());

  const stateContext = { isHourly, hoursOver4, isMinor };
  const visibleNodes = currentFlow.filter(n => !n.triggerCondition || n.triggerCondition(stateContext));

  const [activeNodeId, setActiveNodeId] = useState(visibleNodes[0]?.id);
  const activeNode = visibleNodes.find(n => n.id === activeNodeId) || visibleNodes[0];

  const iframeSrc = activeNode 
    ? `${window.location.origin}/dev/bypass?role=${activeNode.role}&path=${encodeURIComponent(activeNode.route)}&v=${version}` 
    : '';

  return (
    <>
      <Global styles={styles} />
      <div className="flow-root">
        <header className="flow-header">
          <h1 className="flow-title">🧩 UX Flow Viewer</h1>
          <div className="flow-tabs">
            <button 
              className={`flow-tab ${currentFlowId === 'contract' ? 'active' : ''}`}
              onClick={() => { setSearchParams({ flow: 'contract' }); setActiveNodeId(CONTRACT_FLOW[0].id); }}
            >
              📝 계약서 작성 플로우
            </button>
            <button 
              className={`flow-tab ${currentFlowId === 'sign' ? 'active' : ''}`}
              onClick={() => { setSearchParams({ flow: 'sign' }); setActiveNodeId(SIGN_FLOW[0].id); }}
            >
              ✍️ 전자서명 플로우
            </button>
          </div>
        </header>

        <div className="flow-body">
          <div className="flow-sidebar">
            <div className="flow-sidebar-header">
              <div className="flow-sidebar-title">⚙️ 분기 시뮬레이션</div>
              <div className="flow-controls">
                {currentFlowId === 'contract' ? (
                  <>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={isHourly} onChange={e => setIsHourly(e.target.checked)} />
                      시급제 (해제 시 월급제)
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={hoursOver4} onChange={e => setHoursOver4(e.target.checked)} />
                      4시간 이상 근무 (휴게 의무)
                    </label>
                  </>
                ) : (
                  <label className="checkbox-label">
                    <input type="checkbox" checked={isMinor} onChange={e => setIsMinor(e.target.checked)} />
                    미성년자 (부모님 동의 필요)
                  </label>
                )}
              </div>
            </div>

            <ul className="tree-list">
              {currentFlow.map(node => {
                // If node has trigger but condition is unmet, dim it
                const isUnmet = node.triggerCondition && !node.triggerCondition(stateContext);
                const isActive = activeNodeId === node.id;
                
                return (
                  <li 
                    key={node.id} 
                    className={`tree-item ${isActive ? 'active' : ''} ${node.isSub ? 'tree-sub-item' : ''}`}
                    style={{ opacity: isUnmet ? 0.3 : 1 }}
                    onClick={() => !isUnmet && setActiveNodeId(node.id)}
                  >
                    <div className="tree-item-title">{node.title}</div>
                    <div className="tree-item-desc">{node.desc}</div>
                    {node.triggerLabel && !isUnmet && (
                      <div className="tree-item-trigger">🚨 {node.triggerLabel}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flow-preview">
            <div className="preview-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span>{activeNode?.role === 'employer' ? '🏪 사장님 뷰' : '✍️ 알바생 뷰'}</span>
                <span className="preview-url">{activeNode?.route}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select 
                  value={device.id} 
                  onChange={e => setDevice(DEVICES.find(d => d.id === e.target.value) || DEVICES[0])}
                  style={{ padding: '4px', borderRadius: 4, border: '1px solid #e5e8eb', fontSize: 12, background: '#fff', cursor: 'pointer' }}
                >
                  {DEVICES.map(d => <option key={d.id} value={d.id}>{d.name} ({d.width}x{d.height})</option>)}
                </select>
                <button 
                  onClick={() => setVersion(Date.now())}
                  style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #e5e8eb', background: '#fff', cursor: 'pointer', fontSize: 12 }}
                >
                  🔄 새로고침
                </button>
              </div>
            </div>
            <div className="preview-canvas">
              <div className="preview-frame-wrapper" style={{ width: device.width, height: device.height }}>
                {activeNode && (
                  <iframe 
                    className="preview-frame"
                    src={iframeSrc}
                    title={activeNode.title}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
