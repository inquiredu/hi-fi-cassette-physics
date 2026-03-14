import type { ReactNode } from 'react';

interface BoomboxTemplateProps {
  children: ReactNode;
}

export function BoomboxTemplate({ children }: BoomboxTemplateProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 bg-neutral-900 p-8 md:p-12 rounded-[2rem] shadow-2xl border-t-4 border-l-4 border-neutral-700/50">
      
      {/* Left Speaker */}
      <div className="hidden md:flex flex-col gap-4 items-center justify-center w-32 h-64 bg-neutral-800 rounded-xl p-4 shadow-inner border border-neutral-950">
        <div className="w-16 h-16 rounded-full bg-neutral-900 border-2 border-neutral-700 shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]" />
        <div className="w-20 h-20 rounded-full bg-neutral-900 border-2 border-neutral-700 shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]" />
      </div>

      {/* Center Deck area */}
      <div className="flex flex-col items-center">
        {/* Cassette fits here */}
        <div className="bg-black p-4 md:p-6 rounded-2xl shadow-[inset_0_8px_16px_rgba(0,0,0,0.9)] border-2 border-neutral-800">
          {children}
        </div>
      </div>

      {/* Right Speaker */}
      <div className="hidden md:flex flex-col gap-4 items-center justify-center w-32 h-64 bg-neutral-800 rounded-xl p-4 shadow-inner border border-neutral-950">
        <div className="w-16 h-16 rounded-full bg-neutral-900 border-2 border-neutral-700 shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]" />
        <div className="w-20 h-20 rounded-full bg-neutral-900 border-2 border-neutral-700 shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]" />
      </div>
      
    </div>
  );
}
