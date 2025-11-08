import React, { useState } from "react";
import { motion } from "framer-motion";

export const useToasts = () => {
  const [toasts, setToasts] = useState([]);

  const push = (title) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  };

  const ToastContainer = () => (
    <div className="fixed right-4 top-16 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="bg-white p-3 rounded shadow"
        >
          {t.title}
        </motion.div>
      ))}
    </div>
  );

  return { push, ToastContainer };
};
