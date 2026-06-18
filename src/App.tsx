import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { overlay } from 'overlay-kit';
import { lazy, Suspense, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { tdsEvent, getSchemeUri } from '@apps-in-toss/web-framework';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DevBridge } from './dev/DevBridge';
import { XrayPicker } from './components/dev/XrayPicker';

import LoginPage from './pages/auth/LoginPage';

const DeeplinkHandler = lazy(() => import('./pages/shared/DeeplinkHandler').then(m => ({ default: m.DeeplinkHandler })));
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

const DevGalleryPage = lazy(() => import('./pages/shared/DevGalleryPage'));
const DevBypass = lazy(() => import('./pages/shared/DevBypass'));
const UXTestPage = lazy(() => import('./pages/dev/UXTestPage'));
const LoginVariantA = lazy(() => import('./pages/dev/LoginVariantA'));
const LoginVariantB = lazy(() => import('./pages/dev/LoginVariantB'));
const LoginVariantC = lazy(() => import('./pages/dev/LoginVariantC'));
const LoginVariantD = lazy(() => import('./pages/dev/LoginVariantD'));
const LoginVariantE = lazy(() => import('./pages/dev/LoginVariantE'));

const WorkerVariantA = lazy(() => import('./pages/dev/WorkerVariantA'));
const WorkerVariantB = lazy(() => import('./pages/dev/WorkerVariantB'));
const WorkerVariantC = lazy(() => import('./pages/dev/WorkerVariantC'));
const WorkerVariantD = lazy(() => import('./pages/dev/WorkerVariantD'));
const WorkerVariantE = lazy(() => import('./pages/dev/WorkerVariantE'));

const FormProposal1 = lazy(() => import('./pages/dev/FormProposal1'));
const FormProposal2 = lazy(() => import('./pages/dev/FormProposal2'));
const FormProposal3 = lazy(() => import('./pages/dev/FormProposal3'));
const FormVariantA = lazy(() => import('./pages/dev/FormVariantA'));
const FormVariantB = lazy(() => import('./pages/dev/FormVariantB'));
const FormVariantC = lazy(() => import('./pages/dev/FormVariantC'));
const FormVariantD = lazy(() => import('./pages/dev/FormVariantD'));
const FormVariantE = lazy(() => import('./pages/dev/FormVariantE'));

const BusinessVariantA = lazy(() => import('./pages/dev/BusinessVariantA'));
const BusinessVariantB = lazy(() => import('./pages/dev/BusinessVariantB'));
const BusinessVariantC = lazy(() => import('./pages/dev/BusinessVariantC'));
const BusinessVariantD = lazy(() => import('./pages/dev/BusinessVariantD'));
const BusinessVariantE = lazy(() => import('./pages/dev/BusinessVariantE'));

const ContractListVariantA = lazy(() => import('./pages/dev/ContractListVariantA'));
const ContractListVariantB = lazy(() => import('./pages/dev/ContractListVariantB'));
const ContractListVariantC = lazy(() => import('./pages/dev/ContractListVariantC'));
const ContractListVariantD = lazy(() => import('./pages/dev/ContractListVariantD'));
const ContractListVariantE = lazy(() => import('./pages/dev/ContractListVariantE'));

const IconsCatalogPage = lazy(() => import('./pages/dev/IconsCatalogPage'));
const FormStepLabelVariantA = lazy(() => import('./pages/dev/FormStepLabelVariantA'));
const FormStepLabelVariantB = lazy(() => import('./pages/dev/FormStepLabelVariantB'));
const FormStepLabelVariantC = lazy(() => import('./pages/dev/FormStepLabelVariantC'));

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

              {import.meta.env.DEV && (
                <>
                  <Route path="/dev/gallery" element={<Lazy><DevGalleryPage /></Lazy>} />
                  <Route path="/dev/bypass" element={<Lazy><DevBypass /></Lazy>} />
                  <Route path="/dev/ux-test" element={<Lazy><UXTestPage /></Lazy>} />
                  <Route path="/dev/login/variant-a" element={<Lazy><LoginVariantA /></Lazy>} />
                  <Route path="/dev/login/variant-b" element={<Lazy><LoginVariantB /></Lazy>} />
                  <Route path="/dev/login/variant-c" element={<Lazy><LoginVariantC /></Lazy>} />
                  <Route path="/dev/login/variant-d" element={<Lazy><LoginVariantD /></Lazy>} />
                  <Route path="/dev/login/variant-e" element={<Lazy><LoginVariantE /></Lazy>} />
                  <Route path="/dev/worker/contracts/variant-a" element={<Lazy><WorkerVariantA /></Lazy>} />
                  <Route path="/dev/worker/contracts/variant-b" element={<Lazy><WorkerVariantB /></Lazy>} />
                  <Route path="/dev/worker/contracts/variant-c" element={<Lazy><WorkerVariantC /></Lazy>} />
                  <Route path="/dev/worker/contracts/variant-d" element={<Lazy><WorkerVariantD /></Lazy>} />
                  <Route path="/dev/worker/contracts/variant-e" element={<Lazy><WorkerVariantE /></Lazy>} />

                  <Route path="/dev/employer/contracts/new/proposal-1" element={<Lazy><FormProposal1 /></Lazy>} />
                  <Route path="/dev/employer/contracts/new/proposal-2" element={<Lazy><FormProposal2 /></Lazy>} />
                  <Route path="/dev/employer/contracts/new/proposal-3" element={<Lazy><FormProposal3 /></Lazy>} />
                  <Route path="/dev/employer/contracts/new/variant-a" element={<Lazy><FormVariantA /></Lazy>} />
                  <Route path="/dev/employer/contracts/new/variant-b" element={<Lazy><FormVariantB /></Lazy>} />
                  <Route path="/dev/employer/contracts/new/variant-c" element={<Lazy><FormVariantC /></Lazy>} />
                  <Route path="/dev/employer/contracts/new/variant-d" element={<Lazy><FormVariantD /></Lazy>} />
                  <Route path="/dev/employer/contracts/new/variant-e" element={<Lazy><FormVariantE /></Lazy>} />
                  <Route path="/dev/employer/business/new/variant-a" element={<Lazy><BusinessVariantA /></Lazy>} />
                  <Route path="/dev/employer/business/new/variant-b" element={<Lazy><BusinessVariantB /></Lazy>} />
                  <Route path="/dev/employer/business/new/variant-c" element={<Lazy><BusinessVariantC /></Lazy>} />
                  <Route path="/dev/employer/business/new/variant-d" element={<Lazy><BusinessVariantD /></Lazy>} />
                  <Route path="/dev/employer/business/new/variant-e" element={<Lazy><BusinessVariantE /></Lazy>} />
                  <Route path="/dev/employer/contracts/variant-a" element={<Lazy><ContractListVariantA /></Lazy>} />
                  <Route path="/dev/employer/contracts/variant-b" element={<Lazy><ContractListVariantB /></Lazy>} />
                  <Route path="/dev/employer/contracts/variant-c" element={<Lazy><ContractListVariantC /></Lazy>} />
                  <Route path="/dev/employer/contracts/variant-d" element={<Lazy><ContractListVariantD /></Lazy>} />
                  <Route path="/dev/employer/contracts/variant-e" element={<Lazy><ContractListVariantE /></Lazy>} />
                  <Route path="/dev/employer/contracts/new/step-label/variant-a" element={<Lazy><FormStepLabelVariantA /></Lazy>} />
                  <Route path="/dev/employer/contracts/new/step-label/variant-b" element={<Lazy><FormStepLabelVariantB /></Lazy>} />
                  <Route path="/dev/employer/contracts/new/step-label/variant-c" element={<Lazy><FormStepLabelVariantC /></Lazy>} />
                  <Route path="/dev/icons" element={<Lazy><IconsCatalogPage /></Lazy>} />
                </>
              )}

              <Route path="/employer/dashboard" element={<Lazy><EmployerDashboard /></Lazy>} />
              <Route path="/employer/business/new" element={<Lazy><BusinessFormPage /></Lazy>} />
              <Route path="/employer/business/manage" element={<Lazy><BusinessManagePage /></Lazy>} />
              <Route path="/employer/contracts" element={<Lazy><EmployerContractList /></Lazy>} />
              <Route path="/employer/contracts/new" element={<Lazy><EmployerContractForm /></Lazy>} />
              <Route path="/employer/contracts/:id/edit" element={<Lazy><EmployerContractForm /></Lazy>} />
              <Route path="/employer/contracts/:id/history" element={<Lazy><ContractTimelinePage /></Lazy>} />
              <Route path="/employer/contracts/:id" element={<Lazy><EmployerContractDetail /></Lazy>} />
              <Route path="/employer/contracts/history" element={<Lazy><ContractHistoryPage /></Lazy>} />

              <Route path="/worker/contracts" element={<Lazy><WorkerContractList /></Lazy>} />
              <Route path="/worker/contracts/:id" element={<Lazy><WorkerContractDetail /></Lazy>} />
              <Route path="/worker/contracts/:id/sign" element={<Lazy><ContractSign /></Lazy>} />

              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Lazy><NotFoundPage /></Lazy>} />
            </Routes>
          </BrowserRouter>
        </DevBridge>
      </AuthProvider>
    </ErrorBoundary>
  );
}
