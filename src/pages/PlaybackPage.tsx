import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CassetteDeck } from '../components/CassetteDeck';
import { LinerNotes } from '../components/LinerNotes';
import { PlayerFrame } from '../components/templates/PlayerFrame';
import { JCard } from '../components/JCard';
import { useAudio } from '../hooks/useAudio';
import { mockMixtape } from '../data/mockMixtape';
import { decodeMixtape } from '../utils/serialization';
import type { TransportMode, Mixtape } from '../types';

export function PlaybackPage() {
  const { id } = useParams();
  const [linerNotesOpen, setLinerNotesOpen] = useState(false);
  const [caseOpened, setCaseOpened] = useState(false);

  // Try to decode mixtape from URL ID. If it fails or is 'demo', use mockMixtape.
  let activeMixtape: Mixtape = mockMixtape;
  if (id && id !== 'demo') {
    const decoded = decodeMixtape(id);
    if (decoded && decoded.tracks) {
      activeMixtape = decoded as Mixtape;
    }
  }

  const {
    state,
    currentTrack,
    toggle,
    prev,
    next,
    seekToPercent,
    goToTrack,
    flipTape,
  } = useAudio(activeMixtape.tracks);

  const transportMode: TransportMode = state.isPlaying ? 'playing' : 'paused';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] p-4 md:p-8 overflow-hidden">
      <AnimatePresence mode="wait">
        {!caseOpened ? (
          <motion.div
            key="jcard"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center gap-12"
          >
            <div className="transform scale-125 md:scale-150 mb-12">
              <JCard 
                theme={activeMixtape.theme} 
                linerNotes={activeMixtape.linerNotes} 
                tracks={activeMixtape.tracks} 
                isOpen={false} 
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCaseOpened(true)}
              className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all z-10"
            >
              Open Case
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="player"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="w-full flex items-center justify-center"
          >
            <PlayerFrame template={activeMixtape.theme.playerTemplate}>
              <CassetteDeck
                title={activeMixtape.linerNotes.title}
                progress={state.progress}
                transportMode={transportMode}
                shellColor={activeMixtape.theme.tapeColor}
                labelColor={activeMixtape.theme.labelColor}
                onInfoClick={() => setLinerNotesOpen(true)}
                isPlaying={state.isPlaying}
                currentTrack={currentTrack}
                trackIndex={state.currentTrackIndex}
                totalTracks={activeMixtape.tracks.length}
                currentTime={state.currentTime}
                duration={state.duration}
                onPlayPause={toggle}
                onPrev={prev}
                onNext={next}
                onSeek={seekToPercent}
                needsFlip={state.needsFlip}
                onFlipTape={flipTape}
              />
            </PlayerFrame>

            <LinerNotes
              isOpen={linerNotesOpen}
              onClose={() => setLinerNotesOpen(false)}
              mixtape={activeMixtape}
              currentTrackIndex={state.currentTrackIndex}
              onTrackSelect={(index) => {
                goToTrack(index);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
