import React from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiMessageCircle, FiPlusSquare } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth(); // get user info from AuthContext

  // Roles allowed to create events
  const canCreateEvent = user?.role === "Admin" || user?.role === "Organizer";

  return (
    <aside className="w-64 p-4 border-r hidden lg:block">
      <nav className="flex flex-col gap-2">
        <Link
          to="/dashboard"
          className="p-2 hover:bg-gray-100 rounded flex items-center gap-2"
        >
          <FiCalendar /> Dashboard
        </Link>

        <Link
          to="/events"
          className="p-2 hover:bg-gray-100 rounded flex items-center gap-2"
        >
          <FiMessageCircle /> Events
        </Link>

        {/* Show Create Event only if user is Admin or Organizer */}
        {canCreateEvent && (
          <Link
            to="/create"
            className="p-2 hover:bg-gray-100 rounded flex items-center gap-2"
          >
            <FiPlusSquare /> Create Event
          </Link>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
