"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-3.5 px-4 text-center no-print mt-auto pb-20 md:pb-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>BharatPOS Cloud Edition</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400">v2.4.0</span>
        </div>
        
        {/* Agency Attribution / Developer Signature */}
        <div className="flex items-center gap-1.5 text-slate-600">
          <span>Engineered &amp; Designed with</span>
          <Sparkles className="w-3.5 h-3.5 text-teal-600 fill-teal-600" />
          <span>by</span>
          <span className="font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md border border-slate-200 transition tracking-tight">
            Shunya Labs
          </span>
        </div>
      </div>
    </footer>
  );
};
