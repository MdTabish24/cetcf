import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import AdminPage from './pages/AdminPage';
import CertificationsPage from './pages/CertificationsPage';
import ExamPage from './pages/ExamPage';
import HomePage from './pages/HomePage';
import PartnerPage from './pages/PartnerPage';
import VerifyPage from './pages/VerifyPage';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="certifications" element={<CertificationsPage />} />
        <Route path="exam" element={<ExamPage />} />
        <Route path="verify" element={<VerifyPage />} />
        <Route path="partner" element={<PartnerPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
