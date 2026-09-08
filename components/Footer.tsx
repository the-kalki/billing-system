"use client";

import React from "react";
import { Sparkles, ExternalLink } from "lucide-react";

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
          <a
            href="https://www.shunya-labs.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 hover:text-teal-950 px-2 py-0.5 rounded-md border border-teal-200/80 transition tracking-tight inline-flex items-center gap-1 group shadow-2xs"
            title="Visit Shunya Labs Website"
          >
            <span>Shunya Labs</span>
            <ExternalLink className="w-3 h-3 text-teal-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </footer>
  );
};
