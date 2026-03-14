import { motion } from 'framer-motion';
import type { MixtapeTheme, MixtapeLinerNotes, Track } from '../types';

interface JCardProps {
  theme: MixtapeTheme;
  linerNotes: MixtapeLinerNotes;
  tracks: Track[];
  onOpen?: () => void;
  isOpen?: boolean;
}

export function JCard({ theme, linerNotes, tracks, onOpen, isOpen = false }: JCardProps) {
  const sideATracks = tracks.filter(t => t.side === 'A');
  const sideBTracks = tracks.filter(t => t.side === 'B');

  // Map our jCardThemes to Tailwind classes (fonts, backgrounds)
  const getThemeClasses = () => {
    switch (theme.jCardTheme) {
      case 'handwritten':
        return 'font-handwritten bg-[#fdfbf7] text-[#1a1a1a] shadow-inner';
      case 'collage':
        return 'font-sans bg-zinc-900 border border-zinc-700 text-white';
      case 'ransom':
        return 'font-mono bg-yellow-50 text-black';
      case 'minimal':
      default:
        return 'font-sans bg-white text-black border border-neutral-200';
    }
  };

  const getAccentStyle = () => ({
    backgroundColor: theme.accentColor,
    color: '#fff' // Simplistic contrast approach for prototype
  });

  return (
    <div className="relative perspective-[2000px] w-full max-w-2xl mx-auto h-[400px] flex items-center justify-center">
      {/* 
        The physical J-Card unfolded wrapper.
        We simulate three panels: Back Flap (left), Spine (middle), Front Cover (right).
        When the user clicks, it can trigger an 'open' animation or hide.
      */}
      <motion.div 
        className={`flex w-[600px] h-[350px] shadow-2xl rounded-sm overflow-hidden cursor-pointer hover:shadow-purple-900/20 transition-shadow ${getThemeClasses()}`}
        onClick={onOpen}
        initial={{ rotateY: 0, scale: 0.95 }}
        animate={{ 
          rotateY: isOpen ? -90 : 0, 
          scale: isOpen ? 0.8 : 1,
          opacity: isOpen ? 0 : 1
        }}
        transition={{ duration: 0.8, type: 'spring', bounce: 0.2 }}
        whileHover={{ scale: isOpen ? 0.8 : 0.98 }}
      >
        {/* PANEL 1: Inner Flap (Usually holds tracklist) */}
        <div className="w-[200px] border-r-2 border-black/10 p-6 flex flex-col justify-between bg-black/5">
          <div>
            <h3 className="text-xl font-bold mb-4 uppercase tracking-wider" style={{ color: theme.accentColor }}>Side A</h3>
            <ol className="list-decimal list-inside text-sm space-y-1 opacity-80">
              {sideATracks.map(t => (
                <li key={t.id} className="truncate">{t.title}</li>
              ))}
            </ol>
          </div>
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4 uppercase tracking-wider" style={{ color: theme.accentColor }}>Side B</h3>
            <ol className="list-decimal list-inside text-sm space-y-1 opacity-80">
              {sideBTracks.map(t => (
                <li key={t.id} className="truncate">{t.title}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* PANEL 2: Spine */}
        <div 
          className="w-[60px] flex items-center justify-center border-r-2 border-black/10 writing-vertical shadow-[inset_-4px_0_8px_rgba(0,0,0,0.05)]"
          style={getAccentStyle()}
        >
          <div className="-rotate-90 whitespace-nowrap text-xl font-black uppercase tracking-widest px-4">
            {linerNotes.title || 'Untitled Mix'}
          </div>
        </div>

        {/* PANEL 3: Front Cover */}
        <div className="flex-1 p-8 flex flex-col relative overflow-hidden">
          {/* Decorative graphic based on theme */}
          {theme.jCardTheme === 'collage' && (
             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-black mix-blend-overlay"></div>
          )}

          <div className="h-full flex flex-col justify-between relative z-10">
            <div>
              <h1 className="text-5xl font-black uppercase leading-none mb-2 tracking-tighter mix-blend-difference" style={{ color: theme.accentColor }}>
                {linerNotes.title || 'Untitled Mix'}
              </h1>
              <h2 className="text-xl opacity-70 font-bold mix-blend-difference">
                {linerNotes.artist}
              </h2>
            </div>
            
            {linerNotes.message && (
              <div className="mt-8 p-4 bg-black/5 backdrop-blur-sm rounded-lg border border-black/10 transform -rotate-1">
                <p className="text-base leading-relaxed opacity-90 italic">
                  "{linerNotes.message}"
                </p>
              </div>
            )}
            
            <div className="text-xs font-bold uppercase tracking-widest opacity-50 flex justify-between">
              <span>Stereo</span>
              <span>Dolby NR</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
