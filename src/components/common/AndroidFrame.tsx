import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidFrameProps {
  isMobileDeviceView: boolean;
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ isMobileDeviceView, children }) => {
  if (!isMobileDeviceView) {
    return (
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden shadow-sm">
        {children}
      </main>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-y-auto">
      {/* Phone Hardware Mockup */}
      <div className="relative w-full max-w-[420px] h-[860px] max-h-[92vh] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 flex flex-col overflow-hidden">
        {/* Android Punch-hole Camera */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 pointer-events-none ring-1 ring-slate-800" />

        {/* Screen Bezel Area */}
        <div className="flex-1 flex flex-col w-full h-full bg-slate-50 dark:bg-slate-900 rounded-[34px] overflow-hidden relative">
          {/* Android Status Bar */}
          <div className="h-7 bg-slate-900 text-slate-300 text-[11px] px-5 flex items-center justify-between font-mono shrink-0 select-none z-40">
            <span>10:14</span>
            <div className="flex items-center gap-1.5 opacity-90">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <BatteryMedium className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* App Screen Content */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {children}
          </div>

          {/* Android Bottom Gesture Bar */}
          <div className="h-4 bg-slate-900 flex items-center justify-center shrink-0 z-40">
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
