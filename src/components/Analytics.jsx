import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const Analytics = ({ events }) => {
  // Example: generate counts by category or by day-of-week
  const data = useMemo(() => {
    const map = {};
    (events || []).forEach((ev) => {
      const day = new Date(ev.startTime).toLocaleDateString();
      map[day] = (map[day] || 0) + 1;
    });
    return Object.keys(map).slice(0, 7).map((k) => ({ date: k, count: map[k] }));
  }, [events]);

  if (!data.length) return <div className="text-sm text-gray-500">Not enough data</div>;

  return (
    <div style={{ width: "100%", height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" name="Events" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Analytics;
