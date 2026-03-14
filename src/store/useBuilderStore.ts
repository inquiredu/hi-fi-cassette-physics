import { create } from 'zustand';
import type { Mixtape, Track, MixtapeTheme } from '../types';
import { mockMixtape } from '../data/mockMixtape';

interface BuilderState {
  draft: Mixtape;
  updateTheme: (updates: Partial<MixtapeTheme>) => void;
  updateLinerNotes: (updates: Partial<Mixtape['linerNotes']>) => void;
  addTrack: (track: Track) => void;
  removeTrack: (index: number) => void;
  updateTrack: (index: number, updates: Partial<Track>) => void;
  // Initialize with a clone of the mock or a blank slate
  reset: () => void;
}

// Start with the mock mixtape as the default draft for easy testing
const initialDraft: Mixtape = JSON.parse(JSON.stringify(mockMixtape));
initialDraft.theme.playerTemplate = 'boombox';

export const useBuilderStore = create<BuilderState>((set) => ({
  draft: initialDraft,

  updateTheme: (updates) => 
    set((state) => ({
      draft: {
        ...state.draft,
        theme: { ...state.draft.theme, ...updates }
      }
    })),

  updateLinerNotes: (updates) =>
    set((state) => ({
      draft: {
        ...state.draft,
        linerNotes: { ...state.draft.linerNotes, ...updates }
      }
    })),

  addTrack: (track) =>
    set((state) => ({
      draft: {
        ...state.draft,
        tracks: [...state.draft.tracks, track]
      }
    })),

  removeTrack: (index) =>
    set((state) => {
      const newTracks = [...state.draft.tracks];
      newTracks.splice(index, 1);
      return {
        draft: {
          ...state.draft,
          tracks: newTracks
        }
      };
    }),

  updateTrack: (index, updates) =>
    set((state) => {
      const newTracks = [...state.draft.tracks];
      newTracks[index] = { ...newTracks[index], ...updates };
      return {
        draft: {
          ...state.draft,
          tracks: newTracks
        }
      };
    }),

  reset: () => set({ draft: JSON.parse(JSON.stringify(initialDraft)) })
}));
