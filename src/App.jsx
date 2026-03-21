import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Homepage from './components/Homepage';
import Chat from './components/Chat';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Toaster from './components/Toaster';
import VerifyOTP from './components/auth/VerifyOTP';
import PublicRoute from './components/auth/PublicRoute';
import NotFound from './components/NotFound';
import GithubAuthCallback from './components/auth/GithubAuthCallback';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<PublicRoute><Homepage /></PublicRoute>} />
          <Route path="/sign-in" element={<PublicRoute><SignIn /></PublicRoute>} />
          <Route path="/sign-up" element={<PublicRoute><SignUp /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOTP /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          <Route path="/auth/github/callback" element={<PublicRoute><GithubAuthCallback /></PublicRoute>} />
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:chatId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App