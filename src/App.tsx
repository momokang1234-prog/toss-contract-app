import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { overlay } from 'overlay-kit';
import { lazy, Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { tdsEvent, getSchemeUri } from '@apps-in-toss/web-framework';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DevBridge } from './dev/DevBridge';
import { XrayPicker } from './components/dev/XrayPicker';
import { RequireAuth } from './components/auth/RequireAuth';

import LoginPage from './pages/auth/LoginPage';

const DeeplinkHandler = lazy(() => import('./pages/shared/DeeplinkHandler').then(m => ({ default: m.DeeplinkHandler })));
const LanguageOnboarding = lazy(() => import('./pages/shared/LanguageOnboarding').then(m => ({ default: m.LanguageOnboarding })));
const LanguageSettings = lazy(() => import('./pages/shared/LanguageSettings').then(m => ({ default: m.LanguageSettings })));
const NotFoundPage = lazy(() => import('./pages/shared/NotFoundPage'));
const EmployerContractList = lazy(() => import('./pages/employer/ContractListPage'));
const EmployerContractForm = lazy(() => import('./pages/employer/ContractFormPage'));
const EmployerDashboard = lazy(() => import('./pages/employer/DashboardPage'));
const EmployerContractDetail = lazy(() => import('./pages/employer/ContractDetailPage'));
const ContractHistoryPage = lazy(() => import('./pages/employer/ContractHistoryPage'));
const ContractTimelinePage = lazy(() => import('./pages/employer/ContractTimelinePage'));
const BusinessFormPage = lazy(() => import('./pages/employer/BusinessFormPage'));
const BusinessManagePage = lazy(() => import('./pages/employer/BusinessManagePage'));
const WorkerContractList = lazy(() => import('./pages/worker/ContractListPage'));
const WorkerContractDetail = lazy(() => import('./pages/worker/ContractDetailPage'));
const ContractSign = lazy(() => import('./pages/worker/ContractSignPage'));
const WorkerInvitePage = lazy(() => import('./pages/worker/WorkerInvitePage'));

const DevGalleryPage = lazy(() => import('./pages/shared/DevGalleryPage'));
const DevBypass = lazy(() => import('./pages/shared/DevBypass'));
const UXTestPage = lazy(() => import('./pages/dev/UXTestPage'));
const FlowViewerPage = lazy(() => import('./pages/dev/FlowViewerPage'));

const IconsCatalogPage = lazy(() => import('./pages/dev/IconsCatalogPage'));
const ContractCompletionVariantA = lazy(() => import('./pages/dev/employer/ContractCompletionVariants').then(m => ({ default: m.ContractCompletionVariantA })));
const ContractCompletionVariantB = lazy(() => import('./pages/dev/employer/ContractCompletionVariants').then(m => ({ default: m.ContractCompletionVariantB })));
const ContractCompletionVariantC = lazy(() => import('./pages/dev/employer/ContractCompletionVariants').then(m => ({ default: m.ContractCompletionVariantC })));
const ContractCompletionVariantD = lazy(() => import('./pages/dev/employer/ContractCompletionVariants').then(m => ({ default: m.ContractCompletionVariantD })));
const ContractCompletionVariantE = lazy(() => import('./pages/dev/employer/ContractCompletionVariants').then(m => ({ default: m.ContractCompletionVariantE })));

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--toss-bg, #fff)' }}><div className="loading-spinner">로딩 중...</div></div>}>{children}</Suspense>;
}

function OverlayClearer() {
  const location = useLocation();
  useEffect(() => {
    overlay.unmountAll();
  }, [location]);
  return null;
}

function SchemeRouteHandler() {
  const navigate = useNavigate();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    try {
      const schemeUri = getSchemeUri();
      if (schemeUri) {
        // schemeUri 예: intoss://bossimclockedin/contract/123
        let path = schemeUri.replace('intoss://bossimclockedin', '');

        // 쿼리 파라미터 형태인 경우 예: intoss://bossimclockedin?path=/contract/123
        if (path.startsWith('?')) {
          const urlParams = new URLSearchParams(path);
          const pathParam = urlParams.get('path');
          if (pathParam) {
            path = pathParam;
          }
        }

        if (path && path.startsWith('/contract/')) {
          navigate(path, { replace: true });
        }
      }
    } catch (error) {
      console.error('Failed to handle deep link scheme:', error);
    }
  }, [navigate, initialized]);

  return null;
}

/** 루트 진입 게이트: 언어 온보딩 미완료 시 /language, 그 외 /login */
function RootRedirect() {
  try {
    const onboarded = window.localStorage.getItem('lang_onboarded') === '1';
    return <Navigate to={onboarded ? '/login' : '/language'} replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
}

export default function App() {
  useEffect(() => {
    // tdsEvent는 토스 앱 WebView 환경에서만 동작 — 브라우저 dev 모드에선 무시
    try {
      const cleanup = tdsEvent.addEventListener('navigationAccessoryEvent', {
        onEvent: ({ id }) => {
          if (id === 'share-contract') {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({ title: '근로계약서', url });
            } else {
              navigator.clipboard.writeText(url).catch(() => {});
            }
          }
        },
      });
      return cleanup;
    } catch { /* 브라우저 환경 — 무시 */ }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <DevBridge>
          <BrowserRouter>
            <OverlayClearer />
            <SchemeRouteHandler />
            <XrayPicker />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/contract/:id" element={<Lazy><DeeplinkHandler /></Lazy>} />
              <Route path="/language" element={<Lazy><LanguageOnboarding /></Lazy>} />
              <Route path="/settings/language" element={<Lazy><LanguageSettings /></Lazy>} />

              {import.meta.env.DEV && (
                <>
                  <Route path="/dev/gallery" element={<Lazy><DevGalleryPage /></Lazy>} />
                  <Route path="/dev/bypass" element={<Lazy><DevBypass /></Lazy>} />
                  <Route path="/dev/ux-test" element={<Lazy><UXTestPage /></Lazy>} />
                  <Route path="/dev/flow-viewer" element={<Lazy><FlowViewerPage /></Lazy>} />
                  <Route path="/dev/icons" element={<Lazy><IconsCatalogPage /></Lazy>} />
                  <Route path="/dev/employer/contract-completion/variant-a" element={<Lazy><ContractCompletionVariantA /></Lazy>} />
                  <Route path="/dev/employer/contract-completion/variant-b" element={<Lazy><ContractCompletionVariantB /></Lazy>} />
                  <Route path="/dev/employer/contract-completion/variant-c" element={<Lazy><ContractCompletionVariantC /></Lazy>} />
                  <Route path="/dev/employer/contract-completion/variant-d" element={<Lazy><ContractCompletionVariantD /></Lazy>} />
                  <Route path="/dev/employer/contract-completion/variant-e" element={<Lazy><ContractCompletionVariantE /></Lazy>} />
                </>
              )}

              <Route path="/employer/dashboard" element={<RequireAuth role="employer"><Lazy><EmployerDashboard /></Lazy></RequireAuth>} />
              <Route path="/employer/business/new" element={<RequireAuth role="employer"><Lazy><BusinessFormPage /></Lazy></RequireAuth>} />
              <Route path="/employer/business/manage" element={<RequireAuth role="employer"><Lazy><BusinessManagePage /></Lazy></RequireAuth>} />
              <Route path="/employer/contracts" element={<RequireAuth role="employer"><Lazy><EmployerContractList /></Lazy></RequireAuth>} />
              <Route path="/employer/contracts/new" element={<RequireAuth role="employer"><Lazy><EmployerContractForm /></Lazy></RequireAuth>} />
              <Route path="/employer/contracts/:id/edit" element={<RequireAuth role="employer"><Lazy><EmployerContractForm /></Lazy></RequireAuth>} />
              <Route path="/employer/contracts/:id/history" element={<RequireAuth role="employer"><Lazy><ContractTimelinePage /></Lazy></RequireAuth>} />
              <Route path="/employer/contracts/:id" element={<RequireAuth role="employer"><Lazy><EmployerContractDetail /></Lazy></RequireAuth>} />
              <Route path="/employer/contracts/history" element={<RequireAuth role="employer"><Lazy><ContractHistoryPage /></Lazy></RequireAuth>} />

              <Route path="/worker/contracts" element={<RequireAuth role="worker"><Lazy><WorkerContractList /></Lazy></RequireAuth>} />
              <Route path="/worker/contracts/:id" element={<RequireAuth role="worker"><Lazy><WorkerContractDetail /></Lazy></RequireAuth>} />
              <Route path="/worker/contracts/:id/sign" element={<RequireAuth role="worker"><Lazy><ContractSign /></Lazy></RequireAuth>} />
              <Route path="/worker/invite/:id" element={<RequireAuth role="worker"><Lazy><WorkerInvitePage /></Lazy></RequireAuth>} />

              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<Lazy><NotFoundPage /></Lazy>} />
            </Routes>
          </BrowserRouter>
        </DevBridge>
      </AuthProvider>
    </ErrorBoundary>
  );
}
