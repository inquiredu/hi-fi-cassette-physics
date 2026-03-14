import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { BuilderPage } from './pages/BuilderPage';
import { PlaybackPage } from './pages/PlaybackPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/builder" element={<BuilderPage />} />
      <Route path="/mixtape/:id" element={<PlaybackPage />} />
    </Routes>
  );
}

export default App;
