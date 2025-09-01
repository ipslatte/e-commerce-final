"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endDate: Date;
  onExpire?: () => void;
}

export default function CountdownTimer({
  endDate,
  onExpire,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        onExpire?.();
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (Object.values(newTimeLeft).every((v) => v === 0)) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <span className="text-red-600">Ends in:</span>
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <>
            <span className="font-bold">{timeLeft.days}</span>
            <span className="text-gray-600">d</span>
          </>
        )}
        <span className="font-bold">
          {timeLeft.hours.toString().padStart(2, "0")}
        </span>
        <span className="text-gray-600">h</span>
        <span className="font-bold">
          {timeLeft.minutes.toString().padStart(2, "0")}
        </span>
        <span className="text-gray-600">m</span>
        <span className="font-bold">
          {timeLeft.seconds.toString().padStart(2, "0")}
        </span>
        <span className="text-gray-600">s</span>
      </div>
    </div>
  );
}
