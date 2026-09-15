import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext.jsx';

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
const STATUS_BADGE = {
  Pending:       'badge-pending',
  Confirmed:     'badge-confirmed',
  'In Progress': 'badge bg-purple-100 text-purple-800',
  Completed:     'badge-completed',
  Cancelled:     'badge-cancelled',
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, bg = 'bg-white' }) {
  return (
    <div className={`${bg} card-luxury p-6`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="font-serif text-3xl font-semibold text-charcoal">{value}</p>
      </div>
      <p className="font-sans text-xs uppercase tracking-widest text-gray-400">{label}</p>
      {sub && <p className="font-sans text-xs text-gold-600 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── BOOKING ROW ──────────────────────────────────────────────────────────────
function BookingRow({ booking, onStatusChange, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(booking.bookingStatus);
  const [notes, setNotes] = useState(booking.adminNotes || '');
  const [saving, setSaving] = useState(false);

  const saveStatus = async () => {
    setSaving(true);
    try {
      await api.put(`/bookings/${booking._id}`, { bookingStatus: status, adminNotes: notes });
      onStatusChange(booking._id, status);
      setEditing(false);
    } catch {
      alert('Failed to update booking.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-b border-cream-100 hover:bg-cream-50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="font-serif text-sm font-semibold text-charcoal">{booking.clientName || '—'}</p>
          <p className="font-sans text-xs text-gray-400">{booking.clientEmail}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-sans text-sm text-charcoal">{booking.eventType}</p>
        <p className="font-sans text-xs text-gray-400">{booking.venue}</p>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <p className="font-sans text-sm text-charcoal">{formatDate(booking.eventDate)}</p>
        {booking.eventTime && <p className="font-sans text-xs text-gray-400">{booking.eventTime}</p>}
      </td>
      <td className="px-4 py-3">
        {booking.selectedPackage ? (
          <span className="font-sans text-xs text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full">{booking.selectedPackage}</span>
        ) : '—'}
      </td>
      <td className="px-4 py-3">
        {editing ? (
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="font-sans text-xs border border-cream-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gold-400"
          >
            {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        ) : (
          <span className={STATUS_BADGE[booking.bookingStatus] || 'badge bg-gray-100 text-gray-600'}>
            {booking.bookingStatus}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {booking.budgetMin || booking.budgetMax ? (
          <p className="font-sans text-xs text-charcoal">${booking.budgetMin || 0}–${booking.budgetMax || '?'}</p>
        ) : '—'}
      </td>
      <td className="px-4 py-3">
        <p className="font-sans text-xs text-gray-400">{formatDate(booking.createdAt)}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {editing ? (
            <>
              <button onClick={saveStatus} disabled={saving} className="font-sans text-xs bg-sage-600 text-white px-3 py-1 rounded-sm hover:bg-sage-700">
                {saving ? '…' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)} className="font-sans text-xs text-gray-400 hover:text-gray-600 px-2 py-1">
                ✕
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="font-sans text-xs text-gold-600 hover:text-gold-700 px-2 py-1 border border-gold-200 hover:bg-gold-50 rounded-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(booking._id)}
                className="font-sans text-xs text-red-400 hover:text-red-600 px-2 py-1 border border-red-100 hover:bg-red-50 rounded-sm"
              >
                Del
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

const EVENT_TYPES = ['Birthday Party', 'Wedding Reception', 'Baby Shower', 'Bridal Shower', 'Anniversary', 'Corporate Event', 'Graduation Party', 'Gender Reveal', 'Holiday Party'];

// ─── GALLERY ADMIN PANEL ──────────────────────────────────────────────────────
function GalleryAdmin() {
  const [mode, setMode] = useState('upload');
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [globalEventType, setGlobalEventType] = useState('Wedding Reception');
  const [msg, setMsg] = useState('');

  // URL mode state
  const [imageUrl, setImageUrl] = useState('');
  const [urlEventType, setUrlEventType] = useState('Birthday Party');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlFeatured, setUrlFeatured] = useState(false);
  const [saving, setSaving] = useState(false);

  const processFiles = (rawFiles) => {
    const newFiles = Array.from(rawFiles)
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({
        id: Math.random().toString(36).slice(2),
        file,
        preview: URL.createObjectURL(file),
        eventType: globalEventType,
        title: '',
        featured: false,
        uploading: false,
        done: false,
        error: null
      }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e) => {
    processFiles(e.target.files);
    e.target.value = '';
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const f = prev.find(f => f.id === id);
      if (f) URL.revokeObjectURL(f.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const updateFile = (id, patch) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  };

  const uploadSingle = async (fileEntry) => {
    updateFile(fileEntry.id, { uploading: true, error: null });
    const formData = new FormData();
    formData.append('image', fileEntry.file);
    formData.append('eventType', fileEntry.eventType);
    formData.append('title', fileEntry.title);
    formData.append('featured', String(fileEntry.featured));
    try {
      await api.post('/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateFile(fileEntry.id, { uploading: false, done: true });
    } catch (err) {
      updateFile(fileEntry.id, { uploading: false, error: err.response?.data?.error || 'Upload failed' });
    }
  };

  const uploadAll = async () => {
    const pending = files.filter(f => !f.done && !f.uploading);
    await Promise.all(pending.map(uploadSingle));
    setMsg('Photos uploaded to gallery!');
    setTimeout(() => setMsg(''), 4000);
  };

  const clearDone = () => {
    setFiles(prev => {
      prev.filter(f => f.done).forEach(f => URL.revokeObjectURL(f.preview));
      return prev.filter(f => !f.done);
    });
  };

  const addByUrl = async () => {
    if (!imageUrl.trim()) return;
    setSaving(true);
    try {
      await api.post('/gallery', { imageUrl, eventType: urlEventType, title: urlTitle, featured: urlFeatured });
      setMsg('Image added!');
      setImageUrl(''); setUrlTitle(''); setUrlFeatured(false);
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Failed to add image.');
    } finally {
      setSaving(false);
    }
  };

  const seedGallery = async () => {
    try {
      const res = await api.post('/gallery/seed');
      setMsg(res.data.message);
      setTimeout(() => setMsg(''), 4000);
    } catch {
      setMsg('Seed failed.');
    }
  };

  const doneCount = files.filter(f => f.done).length;
  const pendingCount = files.filter(f => !f.done && !f.uploading).length;

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-1 bg-white border border-cream-200 rounded-sm p-1 w-fit">
        <button
          onClick={() => setMode('upload')}
          className={`font-sans text-sm px-4 py-2 rounded-sm transition-colors ${mode === 'upload' ? 'bg-gold-600 text-white' : 'text-gray-500 hover:text-charcoal'}`}
        >
          Upload My Photos
        </button>
        <button
          onClick={() => setMode('url')}
          className={`font-sans text-sm px-4 py-2 rounded-sm transition-colors ${mode === 'url' ? 'bg-gold-600 text-white' : 'text-gray-500 hover:text-charcoal'}`}
        >
          Add by URL
        </button>
      </div>

      {/* ── UPLOAD MODE ── */}
      {mode === 'upload' && (
        <div className="card-luxury p-6">
          <h3 className="font-serif text-lg text-charcoal mb-1">Upload Your Photos</h3>
          <p className="font-sans text-sm text-gray-400 mb-5">Drop your event photos in — JPG, PNG, or WebP, up to 15 MB each.</p>

          {/* Default event type */}
          <div className="mb-5 max-w-xs">
            <label className="label-luxury">Default Event Type (applies to all added photos)</label>
            <select
              className="input-luxury"
              value={globalEventType}
              onChange={e => setGlobalEventType(e.target.value)}
            >
              {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Drop zone */}
          <label
            className={`block border-2 border-dashed rounded-sm p-10 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-gold-500 bg-gold-50' : 'border-cream-300 hover:border-gold-400 hover:bg-cream-50'
            }`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />
            <div className="text-4xl mb-3">📸</div>
            <p className="font-serif text-lg text-charcoal">Drop your photos here</p>
            <p className="font-sans text-sm text-gray-400 mt-1">or click to browse your files</p>
            <p className="font-sans text-xs text-gray-300 mt-2">You can select multiple photos at once</p>
          </label>

          {/* File queue */}
          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h4 className="font-serif text-base text-charcoal">
                  {files.length} photo{files.length !== 1 ? 's' : ''}
                  {doneCount > 0 && <span className="text-sage-600 text-sm ml-2">({doneCount} uploaded)</span>}
                </h4>
                <div className="flex gap-2">
                  {doneCount > 0 && (
                    <button
                      onClick={clearDone}
                      className="font-sans text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 border border-cream-200 rounded-sm"
                    >
                      Clear Done
                    </button>
                  )}
                  <button
                    onClick={uploadAll}
                    disabled={pendingCount === 0}
                    className="btn-gold py-1.5 text-sm disabled:opacity-40"
                  >
                    Upload All ({pendingCount})
                  </button>
                  <button
                    onClick={() => { files.forEach(f => URL.revokeObjectURL(f.preview)); setFiles([]); }}
                    className="font-sans text-xs text-gray-400 hover:text-red-500 px-3 py-1.5 border border-cream-200 rounded-sm"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {files.map(f => (
                  <div
                    key={f.id}
                    className={`bg-white border rounded-sm overflow-hidden transition-colors ${
                      f.done ? 'border-sage-300' : f.error ? 'border-red-300' : 'border-cream-200'
                    }`}
                  >
                    {/* Preview */}
                    <div className="relative">
                      <img src={f.preview} alt="" className="w-full h-40 object-cover" />
                      {!f.done && !f.uploading && (
                        <button
                          onClick={() => removeFile(f.id)}
                          className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full text-red-400 hover:text-red-600 flex items-center justify-center text-xs font-bold shadow"
                        >
                          ✕
                        </button>
                      )}
                      {f.uploading && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <p className="font-sans text-sm text-gold-600 animate-pulse">Uploading…</p>
                        </div>
                      )}
                      {f.done && (
                        <div className="absolute inset-0 bg-sage-600/20 flex items-center justify-center">
                          <span className="text-3xl drop-shadow">✓</span>
                        </div>
                      )}
                    </div>

                    {/* Controls — only shown when not yet uploaded */}
                    {!f.done && (
                      <div className="p-3 space-y-2">
                        <select
                          value={f.eventType}
                          onChange={e => updateFile(f.id, { eventType: e.target.value })}
                          className="w-full font-sans text-xs border border-cream-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gold-400"
                        >
                          {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                        <input
                          type="text"
                          placeholder="Title (optional)"
                          value={f.title}
                          onChange={e => updateFile(f.id, { title: e.target.value })}
                          className="w-full font-sans text-xs border border-cream-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gold-400"
                        />
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={f.featured}
                            onChange={e => updateFile(f.id, { featured: e.target.checked })}
                            className="accent-gold-600"
                          />
                          <span className="font-sans text-xs text-charcoal">Feature on homepage</span>
                        </label>
                        {f.error && <p className="font-sans text-xs text-red-500">{f.error}</p>}
                        <button
                          onClick={() => uploadSingle(f)}
                          disabled={f.uploading}
                          className="w-full font-sans text-xs bg-gold-600 text-white py-1.5 rounded-sm hover:bg-gold-700 disabled:opacity-50 transition-colors"
                        >
                          Upload This Photo
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {msg && (
            <p className={`font-sans text-sm mt-4 ${msg.toLowerCase().includes('fail') ? 'text-red-500' : 'text-sage-600'}`}>
              {msg}
            </p>
          )}
        </div>
      )}

      {/* ── URL MODE ── */}
      {mode === 'url' && (
        <div className="card-luxury p-6">
          <h3 className="font-serif text-lg text-charcoal mb-5">Add Image by URL</h3>
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="label-luxury">Image URL</label>
              <input type="url" className="input-luxury" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-luxury">Event Type</label>
                <select className="input-luxury" value={urlEventType} onChange={e => setUrlEventType(e.target.value)}>
                  {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label-luxury">Title (optional)</label>
                <input type="text" className="input-luxury" placeholder="Image title" value={urlTitle} onChange={e => setUrlTitle(e.target.value)} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={urlFeatured} onChange={e => setUrlFeatured(e.target.checked)} className="accent-gold-600" />
              <span className="font-sans text-sm text-charcoal">Mark as Featured</span>
            </label>
            <div className="flex gap-3">
              <button onClick={addByUrl} disabled={saving || !imageUrl} className="btn-gold py-2">
                {saving ? 'Adding…' : 'Add to Gallery'}
              </button>
              <button onClick={seedGallery} className="btn-gold-outline py-2 text-sm">
                Seed Sample Images
              </button>
            </div>
            {msg && <p className={`font-sans text-sm ${msg.toLowerCase().includes('fail') ? 'text-red-500' : 'text-sage-600'}`}>{msg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/bookings/admin/stats');
      setStats(res.data);
    } catch {
      setStats(null);
    }
  }, []);

  const fetchBookings = useCallback(async (pageNum = 1, status = '') => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 15 };
      if (status) params.status = status;
      const res = await api.get('/bookings', { params });
      setBookings(res.data.bookings || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchBookings();
  }, [fetchStats, fetchBookings]);

  const handleStatusChange = (id, newStatus) => {
    setBookings(prev => prev.map(b => b._id === id ? { ...b, bookingStatus: newStatus } : b));
    fetchStats();
  };

  const deleteBooking = async (id) => {
    if (!confirm('Permanently delete this booking?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(prev => prev.filter(b => b._id !== id));
      fetchStats();
    } catch {
      alert('Failed to delete booking.');
    }
  };

  const applyFilter = (status) => {
    setStatusFilter(status);
    setPage(1);
    fetchBookings(1, status);
  };

  const seedAdmin = async () => {
    try {
      const res = await api.post('/auth/seed-admin');
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to seed admin.');
    }
  };

  return (
    <main className="pt-20 min-h-screen bg-cream-50">
      {/* Header */}
      <section className="bg-charcoal py-10">
        <div className="section-container flex items-center justify-between">
          <div>
            <span className="font-sans text-gold-400 text-xs tracking-widest uppercase mb-1 block">Admin Panel</span>
            <h1 className="font-serif text-white text-3xl">Purity Events Dashboard</h1>
            <p className="font-sans text-white/50 text-sm mt-1">Columbus, Ohio</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="font-sans text-xs text-white/60 hover:text-white transition-colors">View Site</Link>
            <button onClick={() => logout()} className="font-sans text-xs text-white/60 hover:text-white transition-colors">Sign Out</button>
          </div>
        </div>
      </section>

      <div className="section-container py-8">
        {/* ── Stats Grid ── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Bookings" value={stats.total} icon="📋" />
            <StatCard label="Pending Review" value={stats.pending} icon="⏳" bg="bg-amber-50" />
            <StatCard label="Confirmed" value={stats.confirmed} icon="✅" bg="bg-green-50" />
            <StatCard label="Completed Events" value={stats.completed} icon="🎉" bg="bg-blue-50" />
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 bg-white rounded-sm border border-cream-200 p-1 w-fit overflow-x-auto">
          {['overview', 'bookings', 'gallery', 'quick setup'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-sans text-sm px-4 py-2 rounded-sm capitalize whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-gold-600 text-white' : 'text-gray-500 hover:text-charcoal'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By event type */}
            <div className="card-luxury p-6">
              <h3 className="font-serif text-lg text-charcoal mb-5">Bookings by Event Type</h3>
              <div className="space-y-3">
                {(stats.byEventType || []).slice(0, 8).map(item => (
                  <div key={item._id} className="flex items-center gap-3">
                    <span className="font-sans text-sm text-gray-600 w-36 truncate">{item._id}</span>
                    <div className="flex-1 bg-cream-200 rounded-full h-2">
                      <div
                        className="bg-gold-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((item.count / (stats.total || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="font-sans text-sm font-semibold text-charcoal w-6">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="card-luxury p-6">
              <h3 className="font-serif text-lg text-charcoal mb-5">Summary</h3>
              <div className="space-y-3">
                {[
                  { label: 'Total Bookings', value: stats.total },
                  { label: 'Pending', value: stats.pending },
                  { label: 'Confirmed', value: stats.confirmed },
                  { label: 'In Progress', value: stats.inProgress || 0 },
                  { label: 'Completed', value: stats.completed },
                  { label: 'Cancelled', value: stats.cancelled },
                  { label: 'Recent (30 days)', value: stats.recentBookings },
                  { label: 'Total Revenue', value: stats.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : '$0' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-1 border-b border-cream-100">
                    <span className="font-sans text-sm text-gray-500">{item.label}</span>
                    <span className="font-sans text-sm font-semibold text-charcoal">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── BOOKINGS ── */}
        {activeTab === 'bookings' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => applyFilter('')}
                className={`font-sans text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  statusFilter === '' ? 'bg-gold-600 text-white border-gold-600' : 'border-gray-200 text-gray-500 hover:border-gold-400'
                }`}
              >
                All
              </button>
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => applyFilter(s)}
                  className={`font-sans text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    statusFilter === s ? 'bg-gold-600 text-white border-gold-600' : 'border-gray-200 text-gray-500 hover:border-gold-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-white rounded-sm animate-pulse" />)}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 card-luxury p-10">
                <p className="font-serif text-xl text-gray-400">No bookings found.</p>
              </div>
            ) : (
              <>
                <div className="card-luxury overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead className="bg-cream-50 border-b border-cream-200">
                        <tr>
                          {['Client', 'Event', 'Date', 'Package', 'Status', 'Budget', 'Submitted', 'Actions'].map(col => (
                            <th key={col} className="px-4 py-3 text-left font-sans text-xs uppercase tracking-widest text-gray-400">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map(booking => (
                          <BookingRow
                            key={booking._id}
                            booking={booking}
                            onStatusChange={handleStatusChange}
                            onDelete={deleteBooking}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button disabled={page === 1} onClick={() => { setPage(p => p-1); fetchBookings(page-1, statusFilter); }} className="font-sans text-sm px-4 py-2 border border-cream-300 rounded-sm disabled:opacity-40 hover:border-gold-400">←</button>
                    <span className="font-sans text-sm px-4 py-2 text-gray-500">Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => { setPage(p => p+1); fetchBookings(page+1, statusFilter); }} className="font-sans text-sm px-4 py-2 border border-cream-300 rounded-sm disabled:opacity-40 hover:border-gold-400">→</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── GALLERY ── */}
        {activeTab === 'gallery' && <GalleryAdmin />}

        {/* ── QUICK SETUP ── */}
        {activeTab === 'quick setup' && (
          <div className="max-w-lg space-y-4">
            <h3 className="font-serif text-xl text-charcoal mb-4">Quick Setup</h3>
            <div className="card-luxury p-6 space-y-4">
              <div>
                <h4 className="font-serif text-base text-charcoal mb-2">1. Create Admin Account</h4>
                <p className="font-sans text-sm text-gray-500 mb-3">Run this once to create the admin account using the credentials in your .env file.</p>
                <button onClick={seedAdmin} className="btn-burgundy text-sm py-2 px-6">
                  Seed Admin Account
                </button>
              </div>
              <hr className="border-cream-200" />
              <div>
                <h4 className="font-serif text-base text-charcoal mb-2">2. Seed Sample Gallery</h4>
                <p className="font-sans text-sm text-gray-500 mb-3">Populate the gallery with sample images to showcase your work.</p>
                <Link to="#" onClick={() => setActiveTab('gallery')} className="btn-gold-outline text-sm py-2 px-6">
                  Go to Gallery Manager
                </Link>
              </div>
              <hr className="border-cream-200" />
              <div>
                <h4 className="font-serif text-base text-charcoal mb-2">3. Configure OAuth</h4>
                <p className="font-sans text-sm text-gray-500">Update your .env files with your Google and Facebook OAuth credentials to enable social login.</p>
                <ul className="font-sans text-xs text-gray-400 mt-2 space-y-1 list-disc list-inside">
                  <li>Google: console.cloud.google.com</li>
                  <li>Facebook: developers.facebook.com</li>
                  <li>Add redirect URIs for your domain</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
