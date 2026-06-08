import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RoleGuard } from './components/auth/RoleGuard';

import LoginPage from './pages/auth/LoginPage';
import RoleSelectPage from './pages/auth/RoleSelectPage';
import { DeeplinkHandler } from './pages/shared/DeeplinkHandler';
import NotFoundPage from './pages/shared/NotFoundPage';
import EmployerContractList from './pages/employer/ContractListPage';
import EmployerContractForm from './pages/employer/ContractFormPage';
import EmployerDashboard from './pages/employer/DashboardPage';
import EmployerContractDetail from './pages/employer/ContractDetailPage';
import BusinessFormPage from './pages/employer/BusinessFormPage';
import WorkerContractList from './pages/worker/ContractListPage';
import WorkerContractDetail from './pages/worker/ContractDetailPage';
import ContractSign from './pages/worker/ContractSignPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/role-select" element={<RoleSelectPage />} />
          <Route path="/contract/:id" element={<DeeplinkHandler />} />

          {/* 사장님 */}
          <Route path="/employer" element={<RoleGuard role="employer" />}>
            <Route path="dashboard" element={<EmployerDashboard />} />
            <Route path="business/new" element={<BusinessFormPage />} />
            <Route path="contracts" element={<EmployerContractList />} />
            <Route path="contracts/new" element={<EmployerContractForm />} />
            <Route path="contracts/:id" element={<EmployerContractDetail />} />
            <Route path="contracts/:id/history" element={<div>계약 이력 (준비 중)</div>} />
          </Route>

          {/* 근로자 */}
          <Route path="/worker" element={<RoleGuard role="worker" />}>
            <Route path="contracts" element={<WorkerContractList />} />
            <Route path="contracts/:id" element={<WorkerContractDetail />} />
            <Route path="contracts/:id/sign" element={<ContractSign />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
