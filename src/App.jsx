import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import { SignIn, SignUp, useUser } from '@clerk/clerk-react'
import { Navigate } from "react-router-dom";

import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import UserProfile from './components/auth/UserProfile';
import ChangePassword from './components/auth/ChangePassword';

// Your existing components
import Homepage from './components/Homepage';
import Chat from './components/Chat';
import ProtectedRoute from './components/auth/ProtectedRoute';
// Protected Route Component
// function ProtectedRoute({ children }) {
//   const { isSignedIn, isLoaded } = useUser()

//   if (!isLoaded) {
//     return <div className="flex items-center justify-center min-h-screen">Loading...</div>
//   }

//   if (!isSignedIn) {
//     return <SignIn redirectUrl="/dashboard" />
//   }

//   return children
// }

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route 
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
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
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </Router>
  )
}

export default App