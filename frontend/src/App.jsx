import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotificationListener from "./components/NotificationListener";

import LoginPage         from "./pages/LoginPage";
import RegisterPage      from "./pages/RegisterPage";
import DashboardPage     from "./pages/DashboardPage";
import AnalyticsPage     from "./pages/AnalyticsPage";
import PriorityQueuePage from "./pages/PriorityQueuePage";

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <NotificationListener />
      {children}
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#181c27",
              color: "#f1f5f9",
              border: "1px solid #252a3a",
              fontFamily: "'DM Sans', sans-serif",
            },
          }}
        />
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={
            <ProtectedLayout><DashboardPage /></ProtectedLayout>
          } />
          <Route path="/analytics" element={
            <ProtectedLayout><AnalyticsPage /></ProtectedLayout>
          } />
          <Route path="/priority-queue" element={
            <ProtectedLayout><PriorityQueuePage /></ProtectedLayout>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}