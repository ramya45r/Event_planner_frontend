import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion } from "framer-motion";
import Analytics from "../components/Analytics";
import { API_BASE } from "../utils/constants";

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("calendar"); // 'calendar' or 'list'

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/events/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data.events || res.data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  const eventsOnDate = (date) => {
    const dISO = new Date(date).toDateString();
    return events.filter((ev) => new Date(ev.startTime).toDateString() === dISO);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row items-center justify-between mb-8"
      >
        <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight mb-4 md:mb-0">
          Dashboard
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === "calendar"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white border hover:bg-indigo-50"
            }`}
          >
            Calendar View
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === "list"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white border hover:bg-indigo-50"
            }`}
          >
            List View
          </button>
          <Link
            to="/create"
            className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white shadow-md hover:bg-green-700 transition"
          >
            + Create Event
          </Link>
        </div>
      </motion.div>

      {/* Main Layout */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Calendar / List View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="md:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        >
          {view === "calendar" ? (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="self-start">
<Calendar
  onChange={setSelectedDate}
  value={selectedDate}
  className="rounded-xl border border-gray-200 shadow-sm p-2 hover:shadow-md transition"
  tileClassName={({ date, view }) => {
    if (view === "month") {
      const hasEvent = events.some(
        (ev) => new Date(ev.startTime).toDateString() === date.toDateString()
      );
      return hasEvent ? "event-date" : null;
    }
  }}
  tileContent={({ date, view }) =>
    view === "month" &&
    events.some((ev) => new Date(ev.startTime).toDateString() === date.toDateString()) ? (
      <div className="flex justify-center mt-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-green-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ) : null
  }
/>


              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-700 mb-3">
                  Events on{" "}
                  <span className="text-indigo-600 font-bold">
                    {selectedDate.toDateString()}
                  </span>
                </h3>

                <div className="space-y-3">
                  {eventsOnDate(selectedDate).length === 0 ? (
                    <div className="text-gray-500 text-sm italic">
                      No events scheduled for this date.
                    </div>
                  ) : (
                    eventsOnDate(selectedDate).map((ev) => (
                      <motion.div
                        key={ev._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition bg-gradient-to-r from-indigo-50 to-white"
                      >
                        <div className="font-medium text-indigo-700">{ev.title}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(ev.startTime).toLocaleString()}
                        </div>
                        <Link
                          to={`/events/${ev._id}`}
                          className="text-indigo-600 text-sm mt-2 inline-block hover:underline"
                        >
                          View Details →
                        </Link>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-lg text-gray-700 mb-3">
                Upcoming Events
              </h3>

              <div className="space-y-3">
                {events.length === 0 ? (
                  <div className="text-gray-500 italic">No upcoming events.</div>
                ) : (
                  events.map((ev) => (
                    <motion.div
                      key={ev._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition bg-gradient-to-r from-indigo-50 to-white flex justify-between items-center"
                    >
                      <div>
                        <div className="font-semibold text-indigo-700">{ev.title}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(ev.startTime).toLocaleString()}
                        </div>
                      </div>
                      <Link
                        to={`/events/${ev._id}`}
                        className="text-indigo-600 font-medium hover:underline"
                      >
                        Open →
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
        >
          <h3 className="font-semibold text-lg text-gray-700 mb-4">Analytics</h3>
          <Analytics events={events} />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
