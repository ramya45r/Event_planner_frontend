import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Topbar from "./components/Topbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useToasts } from "./components/ToastContainer";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import Notifications from "./pages/Notifications";
import { motion } from "framer-motion";
import Signup from "./pages/Signup";

export default function App() {
  const { push, ToastContainer } = useToasts();

  useEffect(() => {
    push("Welcome to EDENTU Event Planner!");
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Topbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
                  <Route path="/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
                  <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="/signup" element={<Signup />} />

                </Routes>
              </motion.div>
            </main>
          </div>
          <ToastContainer />
        </div>
      </Router>
    </AuthProvider>
  );
}
