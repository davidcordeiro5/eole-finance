import { useState, useEffect } from "react";

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const useCountdown = (timestamp: number): string => {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = timestamp - Math.floor(Date.now() / 1000);

      if (diff <= 0) {
        setCountdown("Expired");
      } else {
        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = Math.floor(diff % 60);

        const countdownStr = `${days}d - ${hours}h - ${minutes}m - ${seconds}s`;
        setCountdown(
          countdownStr !== "NaNd NaNh NaNm NaNs" ? countdownStr : ""
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return countdown;
};

export default useCountdown;
