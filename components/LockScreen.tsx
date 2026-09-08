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

  const targetPin = settings.securityPin || "1234";

  // Handle number click
  const handleDigit = (digit: string) => {
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
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin("");
    setError(false);
  };

  const verifyPin = (candidate: string) => {
    if (candidate === targetPin) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pos_session_unlocked", "true");
      }
      onUnlock();
    } else {
      setError(true);
      setShake(true);
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

        {error && (
          <p className="text-xs text-red-400 font-semibold mb-4 animate-pulse">
            Incorrect PIN. Please try again.
          </p>
        )}

        {/* Numeric Onscreen Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-xl font-bold text-white border border-slate-700/60 transition shadow-sm"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-700/30 transition active:scale-95 uppercase tracking-wider"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit("0")}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-xl font-bold text-white border border-slate-700/60 transition shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/30 transition active:scale-95 flex items-center justify-center"
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
