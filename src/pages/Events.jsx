import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE } from "../utils/constants";
import { toast } from "react-toastify";
import { FiEdit, FiTrash2 } from "react-icons/fi";

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

        if (user.role === "Organizer") {
          fetched = fetched.filter((e) => e.organizer === user._id);
        } else if (user.role === "Participant") {
          const userId = String(user.id);
          fetched = fetched.filter((e) =>
            e.participants?.some((p) => String(p?._id) === userId)
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

  const handleAccept = async (eventId) => {
    try {
      await axios.post(
        `${API_BASE}/api/events/${eventId}/rsvp`,
        { status: "accepted", userId: user?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("You’ve joined the event!");
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId
            ? { ...ev, participants: [...ev.participants, { _id: user.id, status: "accepted" }] }
            : ev
        )
      );
    } catch (err) {
      toast.error("Error accepting invitation");
    }
  };

  const handleDecline = async (eventId) => {
    try {
      await axios.post(
        `${API_BASE}/api/events/${eventId}/rsvp`,
        { status: "declined", userId: user?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.info("You’ve declined the invitation");
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId
            ? { ...ev, participants: ev.participants.filter((p) => String(p._id) !== String(user.id)) }
            : ev
        )
      );
    } catch (err) {
      toast.error("Error declining invitation");
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`${API_BASE}/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Event deleted successfully");
      setEvents((prev) => prev.filter((ev) => ev._id !== eventId));
    } catch (err) {
      toast.error("Failed to delete event");
    }
  };

  const handleEdit = (eventId) => {
    window.location.href = `/events/edit/${eventId}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Events</h2>
        <div className="flex gap-2 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
          {(user.role === "Admin" || user.role === "Organizer") && (
            <Link
              to="/create"
              className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
            >
              + Create Event
            </Link>
          )}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center text-gray-500">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center text-gray-400">No events found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev._id}
              className="bg-white rounded-2xl shadow-lg p-5 relative hover:shadow-2xl transition duration-300 flex flex-col"
            >
              {/* Title + edit/delete */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-800">{ev.title}</h3>
                {(user.role === "Admin" || user.role === "Organizer") && (
                  <div className="flex gap-3 text-gray-600">
                    <FiEdit
                      className="cursor-pointer hover:text-blue-600"
                      size={20}
                      onClick={() => handleEdit(ev._id)}
                    />
                    <FiTrash2
                      className="cursor-pointer hover:text-red-600"
                      size={20}
                      onClick={() => handleDelete(ev._id)}
                    />
                  </div>
                )}
              </div>

              {/* Date & description */}
              <p className="text-sm text-gray-500 mb-2 font-medium">
                {new Date(ev.startTime).toLocaleString()}
              </p>
              <p className="text-gray-700 text-sm mb-4">{ev.description?.slice(0, 120)}...</p>

              {/* Attachments */}
              
              {ev.attachments && ev.attachments.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                  {ev.attachments.map((img, idx) => (
                    <img
                      key={idx}
                      src={img?.url}
                      alt={`Attachment ${idx + 1}`}
                      className={`rounded-lg shadow-sm object-cover w-full h-36 ${
                        idx === 0 ? "md:col-span-2" : "col-span-1"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Participant Actions */}
              {user.role === "Participant" && (() => {
                const participant = ev.participants?.find(
                  (p) => String(p.user || p._id) === String(user.id)
                );
                if (!participant || participant.status !== "accepted") {
                  return (
                    <div className="flex gap-2 mb-3 text-sm">
                      <button
                        onClick={() => handleAccept(ev._id)}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(ev._id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200"
                      >
                        Decline
                      </button>
                    </div>
                  );
                } else if (participant.status === "accepted") {
                  return (
                    <div className="flex gap-2 mb-3 text-sm">
                      <Link
                        to={`/events/${ev._id}`}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full hover:bg-indigo-200"
                      >
                        Chat
                      </Link>
                      <button
                        onClick={() => handleDecline(ev._id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full hover:bg-red-200"
                      >
                        Leave
                      </button>
                    </div>
                  );
                }
              })()}

              {/* Admin/Organizer link */}
              {(user.role === "Admin" || user.role === "Organizer") && (
                <Link
                  to={`/events/${ev._id}`}
                  className="text-indigo-600 font-medium hover:underline mb-2 inline-block"
                >
                  View Details
                </Link>
              )}

              <span className="block text-xs text-gray-400 mt-auto">
                {ev.participants?.length || 0} participants
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
        >
          Prev
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Events;
