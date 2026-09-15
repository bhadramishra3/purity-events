import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext.jsx';

const STYLE_OPTIONS = ['Elegant', 'Rustic', 'Modern', 'Bohemian', 'Vintage', 'Tropical', 'Minimalist', 'Glamorous'];

const PALETTE_PRESETS = [
  { name: 'Gold & Burgundy', colors: [{ hex: '#d4940f', name: 'Gold' }, { hex: '#722F37', name: 'Burgundy' }, { hex: '#fdf9ed', name: 'Cream' }] },
  { name: 'Blush & Sage', colors: [{ hex: '#f9a8c9', name: 'Blush' }, { hex: '#516d47', name: 'Sage' }, { hex: '#ffffff', name: 'White' }] },
  { name: 'Navy & Gold', colors: [{ hex: '#1e3a5f', name: 'Navy' }, { hex: '#d4940f', name: 'Gold' }, { hex: '#f0e4bb', name: 'Champagne' }] },
  { name: 'Rose Gold', colors: [{ hex: '#b76e79', name: 'Rose Gold' }, { hex: '#c0c0c0', name: 'Silver' }, { hex: '#fff5f5', name: 'Blush White' }] },
  { name: 'All White', colors: [{ hex: '#ffffff', name: 'White' }, { hex: '#f5f5dc', name: 'Ivory' }, { hex: '#c0c0c0', name: 'Silver' }] },
  { name: 'Tropical', colors: [{ hex: '#ff7f7f', name: 'Coral' }, { hex: '#40e0d0', name: 'Turquoise' }, { hex: '#228b22', name: 'Forest' }] },
];

// Sample inspiration images (fallback)
const INSPIRATION_IMAGES = [
  { id: 'i1', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400', category: 'Wedding' },
  { id: 'i2', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400', category: 'Birthday' },
  { id: 'i3', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400', category: 'Baby Shower' },
  { id: 'i4', url: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400', category: 'Romantic' },
  { id: 'i5', url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=400', category: 'Elegant' },
  { id: 'i6', url: 'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?w=400', category: 'Floral' },
  { id: 'i7', url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400', category: 'Candlelit' },
  { id: 'i8', url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400', category: 'Garden' },
  { id: 'i9', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400', category: 'Tea Party' },
  { id: 'i10', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400', category: 'Champagne' },
  { id: 'i11', url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400', category: 'Holiday' },
  { id: 'i12', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', category: 'Pink Theme' },
];

export default function VisionBoard() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Board state
  const [title, setTitle] = useState('My Vision Board');
  const [selectedImages, setSelectedImages] = useState([]);
  const [colors, setColors] = useState([]);
  const [style, setStyle] = useState('');
  const [notes, setNotes] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await api.get('/clients/vision-boards');
      setBoards(res.data.visionBoards || []);
    } catch {
      setBoards([]);
    }
  };

  const loadBoard = (board) => {
    setActiveBoard(board._id);
    setTitle(board.title || 'My Vision Board');
    setSelectedImages(board.inspirationImages || []);
    setColors(board.colors || []);
    setStyle(board.style || '');
    setNotes(board.notes || '');
    setCreating(true);
  };

  const newBoard = () => {
    setActiveBoard(null);
    setTitle('My Vision Board');
    setSelectedImages([]);
    setColors([]);
    setStyle('');
    setNotes('');
    setCreating(true);
  };

  const saveBoard = async () => {
    setSaving(true);
    setSaveMsg('');
    const payload = {
      title,
      inspirationImages: selectedImages,
      colors,
      style,
      notes,
    };
    try {
      if (activeBoard) {
        await api.put(`/clients/vision-board/${activeBoard}`, payload);
      } else {
        const res = await api.post('/clients/vision-board', payload);
        setActiveBoard(res.data.visionBoard._id);
      }
      setSaveMsg('Saved!');
      fetchBoards();
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteBoard = async (id) => {
    if (!confirm('Delete this vision board?')) return;
    try {
      await api.delete(`/clients/vision-board/${id}`);
      fetchBoards();
      if (activeBoard === id) { setCreating(false); setActiveBoard(null); }
    } catch {
      alert('Failed to delete board.');
    }
  };

  const toggleImage = (img) => {
    const exists = selectedImages.find(i => i.url === img.url);
    if (exists) {
      setSelectedImages(prev => prev.filter(i => i.url !== img.url));
    } else {
      setSelectedImages(prev => [...prev, { url: img.url, caption: img.category, source: 'gallery' }]);
    }
  };

  const addCustomImage = () => {
    if (!customImageUrl.trim()) return;
    if (selectedImages.find(i => i.url === customImageUrl)) return;
    setSelectedImages(prev => [...prev, { url: customImageUrl, caption: 'Custom', source: 'upload' }]);
    setCustomImageUrl('');
  };

  const applyPalette = (preset) => {
    setColors(preset.colors);
  };

  const addColor = () => {
    setColors(prev => [...prev, { hex: '#d4940f', name: 'New Color' }]);
  };

  const updateColor = (index, field, value) => {
    setColors(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const removeColor = (index) => {
    setColors(prev => prev.filter((_, i) => i !== index));
  };

  const filteredImages = searchQuery
    ? INSPIRATION_IMAGES.filter(img => img.category.toLowerCase().includes(searchQuery.toLowerCase()))
    : INSPIRATION_IMAGES;

  // ── BOARDS LIST VIEW ────────────────────────────────────────────────────────
  if (!creating) {
    return (
      <main className="pt-20 min-h-screen bg-cream-50">
        <section className="bg-charcoal py-16">
          <div className="section-container text-center">
            <span className="font-sans text-gold-400 text-sm tracking-[0.2em] uppercase mb-3 block">Client Portal</span>
            <h1 className="font-serif text-white text-5xl mb-3">Vision Boards</h1>
            <p className="font-sans text-white/60 text-sm">Build your inspiration board and share your vision with us</p>
          </div>
        </section>

        <section className="section-padding">
          <div className="section-container max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl text-charcoal">Your Boards ({boards.length})</h2>
              <button onClick={newBoard} className="btn-gold">
                + New Vision Board
              </button>
            </div>

            {boards.length === 0 ? (
              <div className="text-center py-20 card-luxury p-12">
                <div className="text-5xl mb-4">🎨</div>
                <h3 className="font-serif text-2xl text-charcoal mb-2">No vision boards yet</h3>
                <p className="font-sans text-gray-400 mb-8">Create your first vision board to start planning your dream event!</p>
                <button onClick={newBoard} className="btn-gold">
                  Create Your First Board
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {boards.map(board => (
                  <div key={board._id} className="card-luxury overflow-hidden group">
                    {/* Preview images */}
                    <div className="grid grid-cols-3 h-32 overflow-hidden">
                      {(board.inspirationImages || []).slice(0, 3).map((img, i) => (
                        <img key={i} src={img.url} alt="" className="w-full h-full object-cover" />
                      ))}
                      {(board.inspirationImages || []).length === 0 && (
                        <div className="col-span-3 bg-cream-100 flex items-center justify-center">
                          <span className="text-gray-300 text-4xl">🎨</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg text-charcoal mb-1">{board.title}</h3>
                      <div className="flex items-center gap-3 mb-4">
                        {(board.colors || []).slice(0, 5).map((c, i) => (
                          <div key={i} className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ background: c.hex }} title={c.name} />
                        ))}
                        {board.style && (
                          <span className="font-sans text-xs text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full">{board.style}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => loadBoard(board)} className="flex-1 btn-gold text-sm py-2">
                          Edit Board
                        </button>
                        <button
                          onClick={() => deleteBoard(board._id)}
                          className="px-3 py-2 border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-sm transition-colors text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    );
  }

  // ── BOARD EDITOR ────────────────────────────────────────────────────────────
  return (
    <main className="pt-20 min-h-screen bg-cream-50">
      {/* Toolbar */}
      <div className="sticky top-16 md:top-20 z-30 bg-white border-b border-cream-200 shadow-sm">
        <div className="section-container py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setCreating(false)} className="text-gray-400 hover:text-charcoal text-sm font-sans">
              ← Back
            </button>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="font-serif text-lg text-charcoal border-0 focus:outline-none focus:ring-0 bg-transparent min-w-0"
              placeholder="Board Title"
            />
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && <span className={`font-sans text-xs ${saveMsg.includes('failed') ? 'text-red-500' : 'text-sage-600'}`}>{saveMsg}</span>}
            <button onClick={saveBoard} disabled={saving} className="btn-gold py-2 px-6 text-sm">
              {saving ? 'Saving…' : activeBoard ? 'Save Changes' : 'Save Board'}
            </button>
          </div>
        </div>
      </div>

      <div className="section-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── LEFT: Inspiration Picker ── */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-luxury p-5">
              <h3 className="font-serif text-base text-charcoal mb-4">Browse Inspiration</h3>
              <input
                type="text"
                className="input-luxury text-sm mb-3"
                placeholder="Search by style (e.g. floral, elegant)…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {filteredImages.map(img => {
                  const selected = selectedImages.some(i => i.url === img.url);
                  return (
                    <button
                      key={img.id}
                      onClick={() => toggleImage(img)}
                      className={`relative aspect-square rounded-sm overflow-hidden border-2 transition-all ${
                        selected ? 'border-gold-500 scale-95' : 'border-transparent hover:border-gold-300'
                      }`}
                    >
                      <img src={img.url} alt={img.category} className="w-full h-full object-cover" loading="lazy" />
                      {selected && (
                        <div className="absolute inset-0 bg-gold-600/30 flex items-center justify-center">
                          <span className="text-white font-bold text-xl">✓</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center font-sans">
                        {img.category}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom image URL */}
              <div className="mt-4">
                <label className="label-luxury text-xs">Add Image by URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    className="input-luxury text-xs flex-1"
                    placeholder="https://..."
                    value={customImageUrl}
                    onChange={e => setCustomImageUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomImage()}
                  />
                  <button onClick={addCustomImage} className="btn-gold py-2 px-3 text-xs">Add</button>
                </div>
              </div>
            </div>

            {/* Style */}
            <div className="card-luxury p-5">
              <h3 className="font-serif text-base text-charcoal mb-4">Event Style</h3>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setStyle(s === style ? '' : s)}
                    className={`py-2 text-xs font-sans font-medium rounded-sm border-2 transition-all ${
                      style === s ? 'border-gold-600 bg-gold-50 text-gold-700' : 'border-cream-300 text-gray-500 hover:border-gold-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── CENTER: Board Canvas ── */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-luxury p-5">
              <h3 className="font-serif text-base text-charcoal mb-4">
                Your Board ({selectedImages.length} images)
              </h3>
              {selectedImages.length === 0 ? (
                <div className="min-h-[300px] border-2 border-dashed border-cream-300 rounded-sm flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="font-sans text-sm">Select images from the left to add them to your board</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {selectedImages.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-sm overflow-hidden">
                      <img src={img.url} alt={img.caption} className="w-full h-full object-cover" loading="lazy" />
                      <button
                        onClick={() => setSelectedImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                      >
                        ×
                      </button>
                      {img.caption && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-1.5 py-0.5 font-sans text-center">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="card-luxury p-5">
              <h3 className="font-serif text-base text-charcoal mb-3">Vision Notes</h3>
              <textarea
                className="input-luxury text-sm min-h-[120px] resize-y"
                placeholder="Describe your vision, favorite elements, must-haves, things to avoid…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* ── RIGHT: Color Palette ── */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-luxury p-5">
              <h3 className="font-serif text-base text-charcoal mb-4">Color Palette</h3>

              {/* Preset palettes */}
              <div className="space-y-2 mb-5">
                {PALETTE_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => applyPalette(preset)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-sm border border-cream-200 hover:border-gold-400 transition-colors group"
                  >
                    <div className="flex gap-1">
                      {preset.colors.map(c => (
                        <div key={c.hex} className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ background: c.hex }} />
                      ))}
                    </div>
                    <span className="font-sans text-xs text-gray-600 group-hover:text-gold-600">{preset.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom palette */}
              <div className="border-t border-cream-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-sans text-xs text-gray-500 uppercase tracking-wide">Custom Colors</span>
                  <button onClick={addColor} className="text-gold-600 text-xs font-semibold hover:text-gold-700">+ Add</button>
                </div>
                <div className="space-y-2">
                  {colors.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={c.hex}
                        onChange={e => updateColor(i, 'hex', e.target.value)}
                        className="w-8 h-8 rounded border border-cream-300 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={c.name}
                        onChange={e => updateColor(i, 'name', e.target.value)}
                        className="flex-1 input-luxury text-xs py-1.5"
                        placeholder="Color name"
                      />
                      <button onClick={() => removeColor(i)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
                    </div>
                  ))}
                  {colors.length === 0 && (
                    <p className="font-sans text-xs text-gray-400">Select a preset above or add custom colors</p>
                  )}
                </div>
              </div>
            </div>

            {/* Share CTA */}
            <div className="card-luxury p-5 text-center bg-gold-50 border-gold-200">
              <div className="text-3xl mb-2">💌</div>
              <h4 className="font-serif text-sm text-charcoal mb-2">Ready to Share?</h4>
              <p className="font-sans text-xs text-gray-500 mb-4">Save your board and attach it to your booking request so our team can bring your vision to life.</p>
              <Link to="/booking" className="btn-gold text-xs py-2 px-5">
                Book Your Event
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
