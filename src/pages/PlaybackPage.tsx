import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CassetteDeck } from '../components/CassetteDeck';
import { LinerNotes } from '../components/LinerNotes';
import { PlayerFrame } from '../components/templates/PlayerFrame';
import { useAudio } from '../hooks/useAudio';
import { mockMixtape } from '../data/mockMixtape';
import { decodeMixtape } from '../utils/serialization';
import type { TransportMode, Mixtape } from '../types';

export function PlaybackPage() {
  const { id } = useParams();
  const [linerNotesOpen, setLinerNotesOpen] = useState(false);

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
  } = useAudio(activeMixtape.tracks);

  const transportMode: TransportMode = state.isPlaying ? 'playing' : 'paused';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] p-4 md:p-8">
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
    </div>
  );
}
