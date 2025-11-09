import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useToasts } from "./components/ToastContainer";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import Notifications from "./pages/Notifications";
import EditEvent from "./pages/EditEvent";
import { motion } from "framer-motion";

// Layout wrapper
const Layout = ({ children }) => {
  const location = useLocation();
  const noLayoutPages = ["/login", "/signup"];
  const hideLayout = noLayoutPages.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!hideLayout && <Topbar />}
      <div className="flex flex-1">
        {!hideLayout && <Sidebar />}
        <main className="flex-1 p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const { push, ToastContainer } = useToasts();

  useEffect(() => {
    push("Welcome to EDENTU Event Planner!");
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <CreateEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <EventDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route path="/events/edit/:id" element={<EditEvent />} />
          </Routes>
          <ToastContainer />
        </Layout>
      </Router>
    </AuthProvider>
  );
}
