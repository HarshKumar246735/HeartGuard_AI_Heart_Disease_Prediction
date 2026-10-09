import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import { PageLoader } from './components/States';
import { useAuth } from './context/AuthContext';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NewAssessment = lazy(() => import('./pages/NewAssessment'));
const AssessmentResult = lazy(() => import('./pages/AssessmentResult'));
const History = lazy(() => import('./pages/History'));
const AssessmentDetails = lazy(() => import('./pages/AssessmentDetails'));
const Reports = lazy(() => import('./pages/Reports'));
const HealthInsights = lazy(() => import('./pages/HealthInsights'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAssessments = lazy(() => import('./pages/admin/AdminAssessments'));
const Legal = lazy(() => import('./pages/Legal'));
const NotFound = lazy(() => import('./pages/NotFound'));

/** Signed-in users are sent to their dashboard instead of seeing login/register again. */
function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : children;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assessment/new" element={<NewAssessment />} />
            <Route path="/assessment/:id/result" element={<AssessmentResult />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/:id" element={<AssessmentDetails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/health-insights" element={<HealthInsights />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route element={<AppLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/assessments" element={<AdminAssessments />} />
          </Route>
        </Route>

        <Route path="/privacy" element={<Legal page="privacy" />} />
        <Route path="/terms" element={<Legal page="terms" />} />
        <Route path="/contact" element={<Legal page="contact" />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
