"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  endDate: string;
  onExpire?: () => void;
}

export default function CountdownTimer({
  endDate,
  onExpire,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const total = new Date(endDate).getTime() - Date.now();
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const seconds = Math.floor((total / 1000) % 60);
    return { total, days, hours, minutes, seconds };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = getTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  if (timeLeft.total <= 0) {
    return <span className="text-red-500">Sale ended</span>;
  }

  return (
    <div className="flex items-center gap-2">
      {timeLeft.days > 0 && <TimeUnit value={timeLeft.days} label="days" />}
      <TimeUnit value={timeLeft.hours} label="hrs" />
      <TimeUnit value={timeLeft.minutes} label="min" />
      <TimeUnit value={timeLeft.seconds} label="sec" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.3, repeat: value === 0 ? 0 : undefined }}
      className="flex flex-col items-center bg-white/10 rounded-lg px-2 py-1"
    >
      <span className="text-xl md:text-2xl font-bold text-yellow-300 tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] md:text-xs text-white/80 font-medium uppercase tracking-wider">
        {label}
      </span>
    </motion.div>
  );
}
