"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

const INACTIVITY_MS = 600 * 1000; // 10 menit
const MOUSE_THROTTLE_MS = 2000; // reset timer max setiap 2 detik untuk mousemove

type LogoutAction = () => Promise<void>;

interface InactivityLogoutProps {
  children: React.ReactNode;
  logoutAction: LogoutAction;
}

export default function InactivityLogout({ children, logoutAction }: InactivityLogoutProps) {
  const pathname = usePathname();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMouseRef = useRef<number>(0);

  const doLogout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    logoutAction();
  }, [logoutAction]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(doLogout, INACTIVITY_MS);
  }, [doLogout]);

  useEffect(() => {
    // Jangan aktif di halaman login
    if (pathname === "/internal/auth/sign-in") {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    resetTimer();

    const handleActivity = () => resetTimer();

    const handleMouseMove = () => {
      const now = Date.now();
      if (now - lastMouseRef.current >= MOUSE_THROTTLE_MS) {
        lastMouseRef.current = now;
        resetTimer();
      }
    };

    window.addEventListener("click", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleActivity, { passive: true });

    return () => {
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleActivity);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, resetTimer]);

  return <>{children}</>;
}
