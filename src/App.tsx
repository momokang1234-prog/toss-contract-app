import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { tdsEvent } from '@apps-in-toss/web-framework';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';

const DeeplinkHandler = lazy(() => import('./pages/shared/DeeplinkHandler').then(m => ({ default: m.DeeplinkHandler })));
const NotFoundPage = lazy(() => import('./pages/shared/NotFoundPage'));
const EmployerContractList = lazy(() => import('./pages/employer/ContractListPage'));
const EmployerContractForm = lazy(() => import('./pages/employer/ContractFormPage'));
const EmployerDashboard = lazy(() => import('./pages/employer/DashboardPage'));
const EmployerContractDetail = lazy(() => import('./pages/employer/ContractDetailPage'));
const ContractHistoryPage = lazy(() => import('./pages/employer/ContractHistoryPage'));
const BusinessFormPage = lazy(() => import('./pages/employer/BusinessFormPage'));
const WorkerContractList = lazy(() => import('./pages/worker/ContractListPage'));
const WorkerContractDetail = lazy(() => import('./pages/worker/ContractDetailPage'));
const ContractSign = lazy(() => import('./pages/worker/ContractSignPage'));

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
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
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/contract/:id" element={<Lazy><DeeplinkHandler /></Lazy>} />

          <Route path="/employer/dashboard" element={<Lazy><EmployerDashboard /></Lazy>} />
          <Route path="/employer/business/new" element={<Lazy><BusinessFormPage /></Lazy>} />
          <Route path="/employer/contracts" element={<Lazy><EmployerContractList /></Lazy>} />
          <Route path="/employer/contracts/new" element={<Lazy><EmployerContractForm /></Lazy>} />
          <Route path="/employer/contracts/:id" element={<Lazy><EmployerContractDetail /></Lazy>} />
          <Route path="/employer/contracts/:id/history" element={<Lazy><ContractHistoryPage /></Lazy>} />

          <Route path="/worker/contracts" element={<Lazy><WorkerContractList /></Lazy>} />
          <Route path="/worker/contracts/:id" element={<Lazy><WorkerContractDetail /></Lazy>} />
          <Route path="/worker/contracts/:id/sign" element={<Lazy><ContractSign /></Lazy>} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Lazy><NotFoundPage /></Lazy>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
