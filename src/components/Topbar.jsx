import React from "react";
import { Link } from "react-router-dom";
import { FiBell, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white shadow-md border-b">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition">
        EDENTU
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-3 rounded-full hover:bg-indigo-50 transition"
        >
          <FiBell size={20} className="text-gray-600" />
          {/* Optional notification badge */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
        </Link>

        {/* User Info */}
        {user ? (
          <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-full shadow-sm">
            <span className="text-gray-700 font-medium">{user.name || user.email}</span>
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-red-100 text-red-600 transition"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition shadow-md"
          >
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Topbar;
