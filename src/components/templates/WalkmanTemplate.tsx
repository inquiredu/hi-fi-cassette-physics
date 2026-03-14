import type { ReactNode } from 'react';

interface WalkmanTemplateProps {
  children: ReactNode;
}

export function WalkmanTemplate({ children }: WalkmanTemplateProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-zinc-800 p-4 pb-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] border-t-2 border-l-2 border-zinc-600/50 relative overflow-hidden">
      
      {/* Faux Walkman styling */}
      <div className="absolute top-2 right-4 w-12 h-2 bg-orange-500 rounded-full opacity-80" />
      
      <div className="flex w-full items-center justify-between mb-4 px-2">
        <h3 className="text-zinc-400 font-bold tracking-widest text-xs uppercase">Stereo Cassette Player</h3>
        <div className="text-[10px] text-zinc-500 font-mono">WM-XX</div>
      </div>
      
      {/* Cassette deck area */}
      <div className="bg-black/80 p-2 md:p-4 rounded-xl shadow-[inset_0_4px_12px_rgba(0,0,0,1)] border border-zinc-900">
        {children}
      </div>

    </div>
  );
}
