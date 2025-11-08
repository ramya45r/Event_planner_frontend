import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../utils/constants";

const Events = () => {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("upcoming");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/events`, {
          params: { page, filter },
          headers: { Authorization: `Bearer ${token}` },
        });

        let fetched = res.data.events || res.data || [];

        // Role-based filtering
        if (user.role === "Organizer") {
          fetched = fetched.filter((e) => e.organizer === user._id);
        } else if (user.role === "Participant") {
          fetched = fetched.filter((e) =>
            e.participants?.some((p) => p._id === user._id)
          );
        }
        setEvents(fetched);
      } catch (err) {
        console.error("Error loading events:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, filter, token, user]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Events</h2>
        <div className="flex gap-2 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>

          {/* Only Admin or Organizer can create events */}
          {(user.role === "Admin" || user.role === "Organizer") && (
            <Link
              to="/create"
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Create
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : events.length === 0 ? (
        <div className="text-gray-500">No events found.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {events.map((ev) => (
            <div key={ev._id} className="p-4 bg-white rounded shadow">
              <div className="font-semibold">{ev.title}</div>
              <div className="text-sm text-gray-500">
                {new Date(ev.startTime).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {ev.description?.slice(0, 80)}...
              </p>
              <div className="mt-3 flex justify-between items-center">
                <Link to={`/events/${ev._id}`} className="text-indigo-600">
                  View
                </Link>
                <span className="text-xs text-gray-500">
                  {(ev.participants || []).length} participants
                </span>
              </div>

              {/* Organizer and Admin actions */}
              {(user.role === "Admin" ||
                (user.role === "Organizer" && ev.organizer === user._id)) && (
                <div className="mt-2 flex gap-2 text-sm">
                  <Link
                    to={`/events/edit/${ev._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => alert("Invite participants feature soon")}
                    className="text-green-600 hover:underline"
                  >
                    Invite
                  </button>
                </div>
              )}

              {/* Participant-specific actions */}
              {user.role === "Participant" &&
                ev.participants?.some((p) => p._id === user._id) && (
                  <div className="mt-2 text-sm">
                    <button className="text-indigo-600 hover:underline">
                      Chat
                    </button>
                    <button className="text-red-600 hover:underline ml-2">
                      Leave
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Events;
