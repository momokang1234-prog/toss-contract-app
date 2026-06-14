import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { overlay } from 'overlay-kit';
import { lazy, Suspense, useEffect } from 'react';
import type { ReactNode } from 'react';
import { tdsEvent } from '@apps-in-toss/web-framework';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

import LoginPage from './pages/auth/LoginPage';

const DeeplinkHandler = lazy(() => import('./pages/shared/DeeplinkHandler').then(m => ({ default: m.DeeplinkHandler })));
const NotFoundPage = lazy(() => import('./pages/shared/NotFoundPage'));
const EmployerContractList = lazy(() => import('./pages/employer/ContractListPage'));
const EmployerContractForm = lazy(() => import('./pages/employer/ContractFormPage'));
const EmployerDashboard = lazy(() => import('./pages/employer/DashboardPage'));
const EmployerContractDetail = lazy(() => import('./pages/employer/ContractDetailPage'));
const ContractHistoryPage = lazy(() => import('./pages/employer/ContractHistoryPage'));
const BusinessFormPage = lazy(() => import('./pages/employer/BusinessFormPage'));
const BusinessManagePage = lazy(() => import('./pages/employer/BusinessManagePage'));
const WorkerContractList = lazy(() => import('./pages/worker/ContractListPage'));
const WorkerContractDetail = lazy(() => import('./pages/worker/ContractDetailPage'));
const ContractSign = lazy(() => import('./pages/worker/ContractSignPage'));

const DevGalleryPage = lazy(() => import('./pages/shared/DevGalleryPage'));
const DevBypass = lazy(() => import('./pages/shared/DevBypass'));

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
        <BrowserRouter>
          <OverlayClearer />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/contract/:id" element={<Lazy><DeeplinkHandler /></Lazy>} />

            <Route path="/dev/gallery" element={<Lazy><DevGalleryPage /></Lazy>} />
            <Route path="/dev/bypass" element={<Lazy><DevBypass /></Lazy>} />

            <Route path="/employer/dashboard" element={<Lazy><EmployerDashboard /></Lazy>} />
            <Route path="/employer/business/new" element={<Lazy><BusinessFormPage /></Lazy>} />
            <Route path="/employer/business/manage" element={<Lazy><BusinessManagePage /></Lazy>} />
            <Route path="/employer/contracts" element={<Lazy><EmployerContractList /></Lazy>} />
            <Route path="/employer/contracts/new" element={<Lazy><EmployerContractForm /></Lazy>} />
            <Route path="/employer/contracts/:id/edit" element={<Lazy><EmployerContractForm /></Lazy>} />
            <Route path="/employer/contracts/:id" element={<Lazy><EmployerContractDetail /></Lazy>} />
            <Route path="/employer/contracts/history" element={<Lazy><ContractHistoryPage /></Lazy>} />

            <Route path="/worker/contracts" element={<Lazy><WorkerContractList /></Lazy>} />
            <Route path="/worker/contracts/:id" element={<Lazy><WorkerContractDetail /></Lazy>} />
            <Route path="/worker/contracts/:id/sign" element={<Lazy><ContractSign /></Lazy>} />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Lazy><NotFoundPage /></Lazy>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
