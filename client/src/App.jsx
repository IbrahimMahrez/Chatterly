import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { FeedbackProvider } from './context/FeedbackContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import SavedPosts from './pages/SavedPosts';
import SavedMessages from './pages/SavedMessages';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Welcome from './pages/Welcome';
import LoadingScreen from './components/LoadingScreen';
import Reminders from './pages/Reminders';
import Pulse from './pages/Pulse';
import Circles from './pages/Circles';
import Notifications from './pages/Notifications';
import About from './pages/About';

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  useLanguage();

  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/feed" replace />;

  return children;
}

function AdminRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  useLanguage();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <FeedbackProvider>
          <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/about" element={<About />} />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />

          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />

          <Route
            path="/posts/:id"
            element={
              <ProtectedRoute>
                <PostDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat/:roomId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-messages"
            element={<ProtectedRoute><SavedMessages /></ProtectedRoute>}
          />
          <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
          <Route path="/pulse" element={<ProtectedRoute><Pulse /></ProtectedRoute>} />
          <Route path="/circles" element={<ProtectedRoute><Circles /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
          </BrowserRouter>
        </FeedbackProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
