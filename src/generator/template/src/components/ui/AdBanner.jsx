import React from 'react';

export default function AdBanner() {
  return (
    <div className="w-full bg-slate-900 text-slate-300 text-sm py-2 text-center border-b border-slate-800">
      <p>
        Sponsored by <span className="font-bold text-white">UtilityHub Pro</span> —
        Unlock unlimited conversions and ad-free utilities for $4.99/mo.
        <a href="#" className="ml-2 text-blue-400 hover:text-blue-300 underline">Learn More</a>
      </p>
    </div>
  );
}
