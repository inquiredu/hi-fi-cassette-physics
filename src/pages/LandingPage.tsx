import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] p-8 text-center text-white">
      <h1 className="text-4xl font-bold mb-4">Mixtape</h1>
      <p className="text-neutral-400 max-w-md mb-8">
        Create visually stunning, retro-styled shared playlists. Mod your player, pick your theme, and share the vibes.
      </p>
      <div className="flex gap-4">
        <Link 
          to="/builder" 
          className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
        >
          Create Mixtape
        </Link>
        {/* We link to a demo tape using URL. Or we can just have builder link */}
        <Link 
          to="/mixtape/demo" 
          className="px-6 py-3 border border-neutral-600 text-neutral-300 font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
        >
          View Demo
        </Link>
      </div>
    </div>
  );
}
