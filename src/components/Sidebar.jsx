import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiCalendar, FiMessageCircle, FiPlusSquare } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Roles allowed to create events
  const canCreateEvent = user?.role === "Admin" || user?.role === "Organizer";

  // Sidebar links
  const links = [
    { name: "Dashboard", to: "/dashboard", icon: <FiCalendar /> },
    { name: "Events", to: "/events", icon: <FiMessageCircle /> },
  ];

  if (canCreateEvent) links.push({ name: "Create Event", to: "/create", icon: <FiPlusSquare /> });

  return (
    <aside className="w-64 bg-white border-r shadow-md min-h-screen hidden lg:flex flex-col p-6">
    

      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.name}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition
                ${isActive ? "bg-indigo-100 text-indigo-700 font-semibold" : "text-gray-700 hover:bg-gray-100"}`}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Optional: User Info at the bottom */}
      <div className="mt-auto pt-6 border-t">
        <p className="text-sm text-gray-500">Logged in as:</p>
        <p className="font-medium text-gray-800">{user?.name || user?.email}</p>
        <p className="text-xs text-gray-400">{user?.role}</p>
      </div>
    </aside>
  );
};

export default Sidebar;
