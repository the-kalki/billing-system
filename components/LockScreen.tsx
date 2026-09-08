"use client";

import React, { useState, useEffect } from "react";
import { Lock, Unlock, Delete, ShieldAlert, Store, Eye, EyeOff } from "lucide-react";
import { BusinessSettings } from "@/types/billing";

interface LockScreenProps {
  settings: BusinessSettings;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ settings, onUnlock }) => {
  const [pin, setPin] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  const targetPin = settings.securityPin || "1234";

  // Check persistent lockout on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLockout = localStorage.getItem("pos_lockout_until");
      if (storedLockout) {
        const remaining = Math.ceil((parseInt(storedLockout, 10) - Date.now()) / 1000);
        if (remaining > 0) {
          setLockoutSeconds(remaining);
        } else {
          localStorage.removeItem("pos_lockout_until");
        }
      }
    }
  }, []);

  // Countdown timer when locked out
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("pos_lockout_until");
          }
          setFailedAttempts(0);
          setError(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const isLockedOut = lockoutSeconds > 0;

  // Handle number click
  const handleDigit = (digit: string) => {
    if (isLockedOut) return;
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    if (isLockedOut) return;
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    if (isLockedOut) return;
    setPin("");
    setError(false);
  };

  const verifyPin = (candidate: string) => {
    if (candidate === targetPin) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pos_session_unlocked", "true");
        localStorage.removeItem("pos_lockout_until");
      }
      setFailedAttempts(0);
      onUnlock();
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      setError(true);
      setShake(true);

      if (newAttempts >= 5) {
        const lockoutDurationMs = 60000;
        const until = Date.now() + lockoutDurationMs;
        if (typeof window !== "undefined") {
          localStorage.setItem("pos_lockout_until", until.toString());
        }
        setLockoutSeconds(60);
      }

      setTimeout(() => {
        setPin("");
        setShake(false);
      }, 500);
    }
  };

  // Keyboard listener for physical numpad / digits
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pin, targetPin]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center transition-all ${
          shake ? "animate-bounce ring-2 ring-red-500" : ""
        }`}
      >
        {/* Lock Icon Header */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 shadow-inner">
          <Lock className="w-8 h-8 text-teal-400" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">
          {settings.storeName}
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Terminal Locked • Enter 4-Digit Store PIN
        </p>

        {/* 4-PIN Indicators with Eye Toggle */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="flex items-center gap-2.5">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              const char = pin[idx];
              return (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-lg transition-all duration-150 ${
                    error
                      ? "bg-red-500/20 text-red-400 border border-red-500 shadow-lg shadow-red-500/40 scale-105"
                      : isFilled
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500 shadow-md shadow-teal-500/30"
                      : "bg-slate-800/80 border border-slate-700 text-slate-500"
                  }`}
                >
                  {isFilled ? (showPin ? char : "•") : ""}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="p-2 text-slate-400 hover:text-slate-200 transition rounded-lg hover:bg-slate-800 ml-1"
            title={showPin ? "Hide PIN" : "Show PIN"}
          >
            {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {isLockedOut ? (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center justify-center gap-2 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Security Lockout: <strong>{lockoutSeconds}s</strong> remaining</span>
          </div>
        ) : error ? (
          <p className="text-xs text-red-400 font-semibold mb-4 animate-pulse">
            Incorrect PIN ({failedAttempts}/5 attempts). Please try again.
          </p>
        ) : null}

        {/* Numeric Onscreen Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              disabled={isLockedOut}
              onClick={() => handleDigit(num)}
              className={`h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-xl font-bold text-white border border-slate-700/60 transition shadow-sm ${
                isLockedOut ? "opacity-30 cursor-not-allowed" : ""
              }`}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={isLockedOut}
            onClick={handleClear}
            className={`h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-700/30 transition active:scale-95 uppercase tracking-wider ${
              isLockedOut ? "opacity-30 cursor-not-allowed" : ""
            }`}
          >
            Clear
          </button>
          <button
            type="button"
            disabled={isLockedOut}
            onClick={() => handleDigit("0")}
            className={`h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-xl font-bold text-white border border-slate-700/60 transition shadow-sm ${
              isLockedOut ? "opacity-30 cursor-not-allowed" : ""
            }`}
          >
            0
          </button>
          <button
            type="button"
            disabled={isLockedOut}
            onClick={handleBackspace}
            className={`h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/30 transition active:scale-95 flex items-center justify-center ${
              isLockedOut ? "opacity-30 cursor-not-allowed" : ""
            }`}
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-6">
          Default PIN is <span className="font-mono text-slate-400 font-bold">1234</span> (Changeable in Settings)
        </p>
      </div>
    </div>
  );
};
