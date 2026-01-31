import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sticker, Type, Move, RotateCw, Trash2, Save, X, GripHorizontal, Layout, Music, List, Plus, Check, Loader2, ExternalLink } from 'lucide-react';
import { JCardConfig, JCardLayer, JCardTexture, Track } from '../types';

interface JCardEditorProps {
  initialConfig: JCardConfig;
  onSave: (config: JCardConfig) => void;
  onCancel: () => void;
}

type EditorMode = 'design' | 'tracklist';

export const JCardEditor: React.FC<JCardEditorProps> = ({ initialConfig, onSave, onCancel }) => {
  const [config, setConfig] = useState<JCardConfig>(initialConfig);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [mode, setMode] = useState<EditorMode>('design');

  // Dragging state
  const canvasRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // --- ACTIONS ---

  const addText = () => {
    const newLayer: JCardLayer = {
      id: crypto.randomUUID(),
      type: 'text',
      content: 'MIXTAPE',
      x: 100,
      y: 100,
      rotation: -5 + Math.random() * 10,
      scale: 1,
      zIndex: config.layers.length + 1,
      font: 'marker',
      color: '#000000'
    };
    setConfig(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
    setActiveLayerId(newLayer.id);
  };

  const addSticker = (stickerId: string) => {
    const newLayer: JCardLayer = {
      id: crypto.randomUUID(),
      type: 'sticker',
      content: stickerId,
      x: 150,
      y: 150,
      rotation: -15 + Math.random() * 30,
      scale: 1,
      zIndex: config.layers.length + 1
    };
    setConfig(prev => ({ ...prev, layers: [...prev.layers, newLayer] }));
    setActiveLayerId(newLayer.id);
  };

  const updateLayer = (id: string, updates: Partial<JCardLayer>) => {
    setConfig(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } : l)
    }));
  };

  const removeLayer = (id: string) => {
    setConfig(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== id)
    }));
    setActiveLayerId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setActiveLayerId(null);
    }
  };

  // --- TRACKLIST ACTIONS ---
  const addTrack = (side: 'sideA' | 'sideB') => {
    const newTrack: Track = { id: crypto.randomUUID(), title: '', duration: '0:00' };
    setConfig(prev => ({
      ...prev,
      tracklist: {
        ...prev.tracklist,
        [side]: [...prev.tracklist[side], newTrack]
      }
    }));
  };

  const updateTrack = (side: 'sideA' | 'sideB', id: string, updates: Partial<Track>) => {
    setConfig(prev => ({
      ...prev,
      tracklist: {
        ...prev.tracklist,
        [side]: prev.tracklist[side].map(t => t.id === id ? { ...t, ...updates } : t)
      }
    }));
  };

  const removeTrack = (side: 'sideA' | 'sideB', id: string) => {
    setConfig(prev => ({
      ...prev,
      tracklist: {
        ...prev.tracklist,
        [side]: prev.tracklist[side].filter(t => t.id !== id)
      }
    }));
  };

  const parseAndImportTracks = (text: string) => {
    const lines = text.split('\n').filter(l => l.trim());
    const tracks: Track[] = [];

    lines.forEach(line => {
      // Try to find duration at the end (e.g. "Song Title 3:45")
      const match = line.match(/^(.+?)\s+(\d{1,2}:\d{2})$/);
      if (match) {
        tracks.push({
          id: crypto.randomUUID(),
          title: match[1].trim(),
          duration: match[2]
        });
      } else {
        // Fallback if no duration found
        tracks.push({
          id: crypto.randomUUID(),
          title: line.trim(),
          duration: '3:00' // Default
        });
      }
    });

    // Split evenly
    const mid = Math.ceil(tracks.length / 2);
    const sideA = tracks.slice(0, mid);
    const sideB = tracks.slice(mid);

    setConfig(prev => ({
      ...prev,
      tracklist: { sideA, sideB }
    }));
  };

  // --- DRAG LOGIC ---
  const handleMouseDown = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    setActiveLayerId(layerId);
    isDragging.current = true;

    const layer = config.layers.find(l => l.id === layerId);
    if (!layer) return;

    // Calculate offset from the top-left of the element
    dragOffset.current = {
      x: e.clientX - layer.x,
      y: e.clientY - layer.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !activeLayerId || !canvasRef.current) return;

    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;

    updateLayer(activeLayerId, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // --- DRAG LOGIC (TOUCH) ---
  const handleTouchStart = (e: React.TouchEvent, layerId: string) => {
    e.stopPropagation();
    setActiveLayerId(layerId);
    isDragging.current = true;

    const layer = config.layers.find(l => l.id === layerId);
    if (!layer) return;

    const touch = e.touches[0];
    dragOffset.current = {
      x: touch.clientX - layer.x,
      y: touch.clientY - layer.y
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !activeLayerId || !canvasRef.current) return;

    // Prevent scrolling while dragging
    e.preventDefault();

    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.current.x;
    const newY = touch.clientY - dragOffset.current.y;

    updateLayer(activeLayerId, { x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // Global mouse/touch up to catch drops outside the element
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // --- RENDERING HELPERS ---

  const getTextureStyle = (tex: JCardTexture): React.CSSProperties => {
    switch (tex) {
      case 'crumpled-paper':
        return { backgroundColor: '#fdfbf7', backgroundImage: 'radial-gradient(#e5e5e5 1px, transparent 1px)', backgroundSize: '10px 10px' };
      case 'cardboard':
        return { backgroundColor: '#d4a373' };
      case 'grid-paper':
        return {
          backgroundColor: '#fff',
          backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        };
      default: return { backgroundColor: '#ffffff' };
    }
  };

  const renderStickerContent = (content: string) => {
    switch (content) {
      case 'star': return <div className="text-yellow-400 text-6xl drop-shadow-md">★</div>;
      case 'heart': return <div className="text-pink-500 text-6xl drop-shadow-md">♥</div>;
      case 'skull': return <div className="text-gray-800 text-6xl drop-shadow-md">☠</div>;
      case 'tape-logo': return <div className="bg-black text-white font-bold px-2 py-1 text-xs tracking-tighter uppercase border-2 border-white shadow-sm">TDK</div>;
      case 'warning': return <div className="bg-yellow-400 text-black font-bold px-4 py-1 text-[10px] tracking-widest border-2 border-black uppercase shadow-sm">PARENTAL ADVISORY</div>;
      case 'band-aid': return <div className="w-16 h-6 bg-orange-200 border border-orange-300 rounded-full shadow-sm flex items-center justify-center"><div className="w-4 h-4 bg-orange-100 rounded-sm"></div></div>;
      default: return <div>?</div>;
    }
  };

  const getTracklistFontClass = () => {
    switch (config.tracklistFont) {
      case 'marker': return 'font-marker';
      case 'sans': return 'font-sans';
      case 'pen': default: return 'font-pen';
    }
  };

  const tracklistStyle = {
    color: config.tracklistColor || '#000000',
  };

  // --- CONTROLS UI ---

  const activeLayer = config.layers.find(l => l.id === activeLayerId);

  return (
    <div className="fixed inset-0 bg-[#111] z-50 flex flex-col md:flex-row text-white overflow-hidden font-sans">

      {/* 1. LEFT: THE CANVAS AREA */}
      <div
        className="flex-1 relative bg-[#1a1a1a] flex items-center justify-center p-8 overflow-hidden bg-noise"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        <div className="absolute top-4 left-4 z-10 flex gap-4">
          <button onClick={onCancel} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 font-medium transition-colors text-sm">
            <X size={16} /> Cancel
          </button>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <button onClick={() => onSave(config)} className="flex items-center gap-2 px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 transition-all transform active:scale-95">
            <Check size={18} /> Done
          </button>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex bg-gray-800 p-1 rounded-full shadow-lg">
          <button
            onClick={() => setMode('design')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${mode === 'design' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Art & Design
          </button>
          <button
            onClick={() => setMode('tracklist')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${mode === 'tracklist' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
          >
            Tracklist
          </button>
        </div>

        {/* THE J-CARD VISUALIZATION */}
        {mode === 'design' ? (
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="relative shadow-2xl overflow-hidden transition-colors duration-300"
            style={{
              width: '320px',
              height: '500px',
              ...getTextureStyle(config.textureId)
            }}
          >
            {/* Fold Line Visualization (The Spine) */}
            <div className="absolute left-0 bottom-0 w-full h-[50px] border-t-2 border-dashed border-black/10 pointer-events-none z-0 flex items-center justify-center bg-black/5">
              <span className="text-black/20 text-[10px] uppercase font-mono tracking-[1em]">Spine</span>
            </div>

            {/* Render Layers */}
            {config.layers.map((layer) => (
              <div
                key={layer.id}
                className={`absolute cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-blue-400/30 rounded p-1 group select-none ${activeLayerId === layer.id ? 'ring-2 ring-blue-500 z-50' : ''}`}
                style={{
                  left: 0,
                  top: 0,
                  transform: `translate3d(${layer.x}px, ${layer.y}px, 0) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                  zIndex: layer.zIndex
                }}
                onMouseDown={(e) => handleMouseDown(e, layer.id)}
                onTouchStart={(e) => handleTouchStart(e, layer.id)}
              >
                {layer.type === 'sticker' ? (
                  renderStickerContent(layer.content)
                ) : (
                  <div
                    className={`${layer.font === 'pen' ? 'font-pen text-5xl leading-none' : 'font-marker text-3xl'}`}
                    style={{ color: layer.color }}
                  >
                    {activeLayerId === layer.id ? (
                      // Interactive Edit Mode
                      <input
                        autoFocus
                        value={layer.content}
                        onChange={(e) => updateLayer(layer.id, { content: e.target.value })}
                        className="bg-transparent outline-none w-full min-w-[100px] text-center"
                        style={{ color: layer.color }}
                      />
                    ) : (
                      // Display Mode
                      <span>{layer.content}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* TRACKLIST EDITOR VIEW */
          <div className={`w-[400px] h-[500px] bg-white text-black p-8 shadow-2xl overflow-y-auto ${getTracklistFontClass()} text-2xl`} style={{ ...getTextureStyle(config.textureId), ...tracklistStyle }}>
            <div className="mb-6">
              <h2 className="font-marker text-2xl border-b-2 border-black/10 pb-2 mb-4">Side A</h2>
              <div className="space-y-2">
                {config.tracklist.sideA.map((track) => (
                  <div key={track.id} className="flex gap-2 group">
                    <span className="text-black/30 w-6 text-sm pt-1">A{config.tracklist.sideA.indexOf(track) + 1}</span>
                    <div className="flex-1 flex gap-2">
                      <input
                        value={track.title}
                        onChange={(e) => updateTrack('sideA', track.id, { title: e.target.value })}
                        placeholder="Track Title..."
                        className="bg-transparent border-b border-dashed border-transparent hover:border-black/20 focus:border-black outline-none flex-1 min-w-0"
                      />
                      <input
                        value={track.duration}
                        onChange={(e) => updateTrack('sideA', track.id, { duration: e.target.value })}
                        placeholder="0:00"
                        className="bg-transparent border-b border-dashed border-transparent hover:border-black/20 focus:border-black outline-none w-16 text-right"
                      />
                    </div>
                    <button onClick={() => removeTrack('sideA', track.id)} className="opacity-0 group-hover:opacity-100 text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addTrack('sideA')}
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-700 text-lg mt-2 opacity-50 hover:opacity-100"
                >
                  <Plus size={16} /> Add Track
                </button>
              </div>
            </div>

            <div>
              <h2 className="font-marker text-2xl border-b-2 border-black/10 pb-2 mb-4">Side B</h2>
              <div className="space-y-2">
                {config.tracklist.sideB.map((track) => (
                  <div key={track.id} className="flex gap-2 group">
                    <span className="text-black/30 w-6 text-sm pt-1">B{config.tracklist.sideB.indexOf(track) + 1}</span>
                    <div className="flex-1 flex gap-2">
                      <input
                        value={track.title}
                        onChange={(e) => updateTrack('sideB', track.id, { title: e.target.value })}
                        placeholder="Track Title..."
                        className="bg-transparent border-b border-dashed border-transparent hover:border-black/20 focus:border-black outline-none flex-1 min-w-0"
                      />
                      <input
                        value={track.duration}
                        onChange={(e) => updateTrack('sideB', track.id, { duration: e.target.value })}
                        placeholder="0:00"
                        className="bg-transparent border-b border-dashed border-transparent hover:border-black/20 focus:border-black outline-none w-16 text-right"
                      />
                    </div>
                    <button onClick={() => removeTrack('sideB', track.id)} className="opacity-0 group-hover:opacity-100 text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addTrack('sideB')}
                  className="flex items-center gap-2 text-blue-500 hover:text-blue-700 text-lg mt-2 opacity-50 hover:opacity-100"
                >
                  <Plus size={16} /> Add Track
                </button>
              </div>
            </div>
          </div>
                )}
              </div>
        
              {/* 2. RIGHT: THE TOOLKIT */}
                    <div className="w-full md:w-80 bg-gray-900 border-l border-gray-800 p-6 flex flex-col gap-8 shadow-2xl z-20 overflow-y-auto">
              
                      {mode === 'design' ? (
                        <>
                          <div>
                            <h3 className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                              <Layout size={14} /> Paper Stock
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                              {(['clean-white', 'grid-paper', 'crumpled-paper', 'cardboard'] as JCardTexture[]).map(t => (
                                <button
                                  key={t}
                                  onClick={() => setConfig(p => ({ ...p, textureId: t }))}
                                  className={`h-12 rounded-lg border-2 transition-all ${config.textureId === t ? 'border-orange-500 scale-105' : 'border-transparent hover:border-gray-600'}`}
                                  style={getTextureStyle(t)}
                                  aria-label={t}
                                />
                              ))}
                            </div>
                          </div>
              
                          <div>
                            <h3 className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                              <Sticker size={14} /> Stickers
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                              {['star', 'heart', 'skull', 'tape-logo', 'warning', 'band-aid'].map(s => (
                                <button
                                  key={s}
                                  onClick={() => addSticker(s)}
                                  className="h-12 w-12 flex items-center justify-center bg-gray-800 rounded hover:bg-gray-700 active:scale-95 transition-all text-xl"
                                >
                                  {s === 'star' && '★'}
                                  {s === 'heart' && '♥'}
                                  {s === 'skull' && '☠'}
                                  {s === 'tape-logo' && 'TDK'}
                                  {s === 'warning' && '!'}
                                  {s === 'band-aid' && '🩹'}
                                </button>
                              ))}
                            </div>
                          </div>
              
                          <div>
                            <h3 className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                              <Type size={14} /> Handwriting
                            </h3>
                            <button
                              onClick={addText}
                              className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                            >
                              <Type size={16} /> Add Text Layer
                            </button>
                          </div>
              
                          {/* ACTIVE LAYER PROPERTIES */}
                          {activeLayer && (
                            <div className="mt-auto p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 animate-in slide-in-from-bottom-4">
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-xs text-gray-400 font-mono">EDITING LAYER</span>
                                <button onClick={() => removeLayer(activeLayer.id)} className="text-red-400 hover:text-red-300 p-1">
                                  <Trash2 size={16} />
                                </button>
                              </div>
              
                              <div className="space-y-4">
                                {/* Rotation Control */}
                                <div className="flex items-center justify-between">
                                  <RotateCw size={14} className="text-gray-500" />
                                  <input
                                    type="range" min="-180" max="180"
                                    value={activeLayer.rotation}
                                    onChange={(e) => updateLayer(activeLayer.id, { rotation: parseInt(e.target.value) })}
                                    className="w-full ml-4 accent-orange-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                  />
                                </div>
              
                                {/* Scale Control */}
                                <div className="flex items-center justify-between">
                                  <div className="text-gray-500 text-xs">Size</div>
                                  <input
                                    type="range" min="0.5" max="3" step="0.1"
                                    value={activeLayer.scale}
                                    onChange={(e) => updateLayer(activeLayer.id, { scale: parseFloat(e.target.value) })}
                                    className="w-full ml-4 accent-orange-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                  />
                                </div>
              
                                {/* Text Specifics */}
                                {activeLayer.type === 'text' && (
                                  <div className="flex gap-2 pt-2 border-t border-gray-700">
                                    <button
                                      onClick={() => updateLayer(activeLayer.id, { font: 'marker' })}
                                      className={`flex-1 py-1 text-xs rounded font-marker ${activeLayer.font === 'marker' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                                    >
                                      Sharpie
                                    </button>
                                    <button
                                      onClick={() => updateLayer(activeLayer.id, { font: 'pen' })}
                                      className={`flex-1 py-1 text-xs rounded font-pen text-lg ${activeLayer.font === 'pen' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                                    >
                                      Ballpoint
                                    </button>
                                  </div>
                                )}
              
                                {/* Color Specifics */}
                                {activeLayer.type === 'text' && (
                                  <div className="flex gap-2">
                                    {['#000000', '#dc2626', '#2563eb', '#16a34a'].map(c => (
                                      <button
                                        key={c}
                                        onClick={() => updateLayer(activeLayer.id, { color: c })}
                                        className={`w-6 h-6 rounded-full border-2 ${activeLayer.color === c ? 'border-white' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                      />
                                    ))}
                                  </div>
                                )}
              
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        /* TRACKLIST HELPERS */
                        <div className="text-sm text-gray-400 leading-relaxed space-y-6">
              
                          {/* BULK IMPORT */}
                          <div>
                            <h3 className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                              <List size={14} /> Bulk Import
                            </h3>
                            <textarea
                              placeholder={`Paste tracklist here...\nSong One 3:45\nSong Two 2:30`}
                              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 transition-colors mb-2"
                              onBlur={(e) => {
                                if (e.target.value.trim()) {
                                  if (window.confirm('Replace current tracklist with imported tracks?')) {
                                    parseAndImportTracks(e.target.value);
                                    e.target.value = '';
                                  }
                                }
                              }}
                            />
                            <p className="text-[10px] text-gray-500">
                              Paste "Title Duration" (e.g. "Wonderwall 4:18"). Tracks will be split evenly between sides.
                            </p>
                          </div>
              
                          {/* STYLING */}
                          <div>
                            <h3 className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
                              <Type size={14} /> Typography
                            </h3>
              
                            {/* Font Selector */}
                            <div className="flex gap-2 mb-4">
                              <button
                                onClick={() => setConfig(p => ({ ...p, tracklistFont: 'marker' }))}
                                className={`flex-1 py-2 text-xs rounded font-marker ${config.tracklistFont === 'marker' ? 'bg-orange-500 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                              >
                                Sharpie
                              </button>
                              <button
                                onClick={() => setConfig(p => ({ ...p, tracklistFont: 'pen' }))}
                                className={`flex-1 py-2 text-xs rounded font-pen text-lg ${!config.tracklistFont || config.tracklistFont === 'pen' ? 'bg-orange-500 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                              >
                                Pen
                              </button>
                              <button
                                onClick={() => setConfig(p => ({ ...p, tracklistFont: 'sans' }))}
                                className={`flex-1 py-2 text-xs rounded font-sans ${config.tracklistFont === 'sans' ? 'bg-orange-500 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
                              >
                                Type
                              </button>
                            </div>
              
                            {/* Color Selector */}
                            <div className="flex gap-2">
                              {['#000000', '#dc2626', '#2563eb', '#16a34a'].map(c => (
                                <button
                                  key={c}
                                  onClick={() => setConfig(p => ({ ...p, tracklistColor: c }))}
                                  className={`w-8 h-8 rounded-full border-2 ${config.tracklistColor === c || (!config.tracklistColor && c === '#000000') ? 'border-white' : 'border-transparent'}`}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>
              
                        </div>
                      )}
              
                    </div>
              
                  </div>
                );
              };      