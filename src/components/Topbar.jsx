import React from "react";
import { Link } from "react-router-dom";
import { FiBell, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Topbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
      <Link to="/" className="text-xl font-semibold">EDENTU</Link>
      <div className="flex items-center gap-3">
        <Link to="/notifications" className="p-2 hover:bg-gray-100 rounded">
          <FiBell size={18} />
        </Link>
        {user ? (
          <>
            <span>{user.name || user.email}</span>
            <button onClick={logout} className="p-2 hover:bg-gray-100 rounded">
              <FiLogOut />
            </button>
          </>
        ) : (
          <Link to="/login" className="px-3 py-1 bg-gray-800 text-white rounded">Login</Link>
        )}
      </div>
    </div>
  );
};
export default Topbar;
