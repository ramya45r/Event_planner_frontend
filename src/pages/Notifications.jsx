import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "../utils/constants";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const token = localStorage.getItem("token");

  const fetchNotifications = async (pageNum = 1) => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/notifications?page=${pageNum}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notifications");
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(
        `${API_BASE}/api/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark as read");
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow rounded-2xl">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center">No notifications found</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`p-3 border rounded-lg flex justify-between items-center ${
                n.read ? "bg-gray-100" : "bg-blue-50"
              }`}
            >
              <div>
                <p className="font-medium text-gray-800">
                  {n.title || "Notification"}
                </p>
                <p className="text-sm text-gray-600">{n.message}</p>
                <p className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.read && (
                <button
                  onClick={() => markAsRead(n._id)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-2 py-1 text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Notification;
