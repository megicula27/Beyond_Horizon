import { useState, useEffect, useRef } from "react";

interface ClockData {
  time: string; // "HH:MM" format
  timezone: string; // e.g., "UTC+2"
  nextHandover: string; // e.g., "08:00"
}

// Standard maritime watch schedule (4-hour watches)
const WATCH_HOURS = [0, 4, 8, 12, 16, 20];

function getNextHandover(): string {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  for (const hour of WATCH_HOURS) {
    if (hour > currentHour || (hour === currentHour && currentMin === 0)) {
      return `${hour.toString().padStart(2, "0")}:00`;
    }
  }

  // Wrap to next day's first watch
  return "00:00";
}

function getTimezoneString(): string {
  const offset = -new Date().getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const sign = offset >= 0 ? "+" : "-";
  return `UTC${sign}${hours}`;
}

function formatTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

export function useClock(): ClockData {
  const [clock, setClock] = useState<ClockData>({
    time: formatTime(),
    timezone: getTimezoneString(),
    nextHandover: getNextHandover(),
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setClock({
        time: formatTime(),
        timezone: getTimezoneString(),
        nextHandover: getNextHandover(),
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return clock;
}
