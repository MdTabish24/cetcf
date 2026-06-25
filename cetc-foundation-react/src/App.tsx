import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import AdminPage from './pages/AdminPage';
import CertificationsPage from './pages/CertificationsPage';
import CourseDetailPage from './pages/CourseDetailPage';
import ExamPage from './pages/ExamPage';
import HomePage from './pages/HomePage';
import PartnerPage from './pages/PartnerPage';
import VerifyPage from './pages/VerifyPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import VideoPlayerPage from './pages/VideoPlayerPage';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="courses" element={<CertificationsPage />} />
        <Route path="courses/:slug" element={<CourseDetailPage />} />
        <Route path="certifications" element={<Navigate to="/courses" replace />} />
        <Route path="exam" element={<ExamPage />} />
        <Route path="verify" element={<VerifyPage />} />
        <Route path="partner" element={<PartnerPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="video/:tradeId" element={<VideoPlayerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
