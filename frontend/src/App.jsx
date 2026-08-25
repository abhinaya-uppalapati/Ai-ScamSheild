import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UrlScanner from "./pages/UrlScanner";
import EmailAnalyzer from "./pages/EmailAnalyzer";
import ConversationAnalyzer from "./pages/ConversationAnalyzer";
import Investigate from "./pages/Investigate";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Assistant from "./pages/Assistant";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan/url"
          element={
            <ProtectedRoute>
              <UrlScanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan/email"
          element={
            <ProtectedRoute>
              <EmailAnalyzer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scan/conversation"
          element={
            <ProtectedRoute>
              <ConversationAnalyzer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investigate"
          element={
            <ProtectedRoute>
              <Investigate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <Assistant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}