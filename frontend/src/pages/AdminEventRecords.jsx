import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext.jsx';

const EVENT_TYPES = [
  'Wedding Reception', 'Birthday Party', 'Baby Shower', 'Bridal Shower',
  'Anniversary', 'Corporate Event', 'Graduation Party', 'Gender Reveal',
  'Holiday Party', 'Engagement', 'Mehendi / Sangeet', 'Other',
];

const DECOR_TYPES = [
  'Full Floral', 'Balloon Décor', 'Backdrop & Arch', 'Table Settings',
  'Draping & Fabric', 'Mixed / Full Setup', 'Centerpieces Only', 'Custom',
];

const EMPTY_FORM = {
  eventName: '', clientName: '', eventDate: '', eventType: '',
  decorType: '', venue: '', guestCount: '', durationHours: '',
  amountCharged: '', expenses: '', notes: '',
};

function money(n) {
  const num = Number(n) || 0;
  return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── SUMMARY CARDS ────────────────────────────────────────────────────────────
function SummaryBar({ records }) {
  const totalRevenue  = records.reduce((s, r) => s + (Number(r.amountCharged) || 0), 0);
  const totalExpenses = records.reduce((s, r) => s + (Number(r.expenses) || 0), 0);
  const netProfit     = totalRevenue - totalExpenses;
  const ratio         = totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0.0';
  const avgCharge     = records.length > 0 ? totalRevenue / records.length : 0;

  const cards = [
    { label: 'Total Events',   value: records.length,    sub: 'completed', icon: '🎉', color: 'bg-gold-50 border-gold-200' },
    { label: 'Total Revenue',  value: money(totalRevenue), sub: 'charged',  icon: '💰', color: 'bg-green-50 border-green-200' },
    { label: 'Total Expenses', value: money(totalExpenses), sub: 'costs',   icon: '📦', color: 'bg-amber-50 border-amber-200' },
    { label: 'Net Profit',     value: money(netProfit),   sub: netProfit >= 0 ? 'positive' : 'negative', icon: '📈', color: netProfit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200' },
    { label: 'Expense Ratio',  value: `${ratio}%`,        sub: 'of revenue', icon: '⚖️', color: 'bg-purple-50 border-purple-200' },
    { label: 'Avg per Event',  value: money(avgCharge),   sub: 'per event',  icon: '📊', color: 'bg-blue-50 border-blue-200' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
      {cards.map(c => (
        <div key={c.label} className={`${c.color} border rounded-lg p-4`}>
          <div className="text-2xl mb-1">{c.icon}</div>
          <div className="font-serif text-lg font-semibold text-charcoal leading-tight">{c.value}</div>
          <div className="font-sans text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">{c.label}</div>
          <div className="font-sans text-xs text-gray-500">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ─── ADD / EDIT MODAL ─────────────────────────────────────────────────────────
function RecordModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.eventName.trim()) { setError('Event name is required.'); return; }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <h2 className="font-serif text-xl text-charcoal">{initial ? 'Edit Event Record' : 'Add Event Record'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block font-sans text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Event Name *</label>
              <input value={form.eventName} onChange={e => set('eventName', e.target.value)}
                className="input-luxury w-full" placeholder="e.g. Johnson Wedding Reception" required />
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Client Name</label>
              <input value={form.clientName} onChange={e => set('clientName', e.target.value)}
                className="input-luxury w-full" placeholder="Full name" />
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Event Date</label>
              <input type="date" value={form.eventDate ? form.eventDate.slice(0,10) : ''} onChange={e => set('eventDate', e.target.value)}
                className="input-luxury w-full" />
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Event Type</label>
              <select value={form.eventType} onChange={e => set('eventType', e.target.value)} className="input-luxury w-full">
                <option value="">Select type…</option>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Decor Type</label>
              <select value={form.decorType} onChange={e => set('decorType', e.target.value)} className="input-luxury w-full">
                <option value="">Select decor…</option>
                {DECOR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Venue</label>
              <input value={form.venue} onChange={e => set('venue', e.target.value)}
                className="input-luxury w-full" placeholder="Venue name / address" />
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Guest Count</label>
              <input type="number" min="0" value={form.guestCount} onChange={e => set('guestCount', e.target.value)}
                className="input-luxury w-full" placeholder="0" />
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Duration (hours)</label>
              <input type="number" min="0" step="0.5" value={form.durationHours} onChange={e => set('durationHours', e.target.value)}
                className="input-luxury w-full" placeholder="e.g. 6" />
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Amount Charged ($)</label>
              <input type="number" min="0" step="1" value={form.amountCharged} onChange={e => set('amountCharged', e.target.value)}
                className="input-luxury w-full" placeholder="0" />
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Expenses / Costs ($)</label>
              <input type="number" min="0" step="1" value={form.expenses} onChange={e => set('expenses', e.target.value)}
                className="input-luxury w-full" placeholder="0" />
            </div>
            <div className="col-span-2">
              <label className="block font-sans text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Notes</label>
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                className="input-luxury w-full resize-none" rows={3} placeholder="Anything to remember about this event…" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-gold flex-1">
              {saving ? 'Saving…' : (initial ? 'Save Changes' : 'Add Event')}
            </button>
            <button type="button" onClick={onClose} className="btn-gold-outline px-6">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AdminEventRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [search, setSearch] = useState('');
  const [dragOver, setDragOver] = useState(null);
  const dragItem = useRef(null);

  const load = async () => {
    try {
      const res = await api.get('/event-records');
      setRecords(res.data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (form) => {
    const res = await api.post('/event-records', form);
    setRecords(prev => [...prev, res.data]);
  };

  const handleEdit = async (form) => {
    const res = await api.put(`/event-records/${editRecord._id}`, form);
    setRecords(prev => prev.map(r => r._id === editRecord._id ? res.data : r));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event record?')) return;
    await api.delete(`/event-records/${id}`);
    setRecords(prev => prev.filter(r => r._id !== id));
  };

  // ── Drag-to-reorder ──
  const handleDragStart = (e, index) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    const from = dragItem.current;
    if (from === null || from === dropIndex) { setDragOver(null); return; }

    const reordered = [...records];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(dropIndex, 0, moved);
    const withOrder = reordered.map((r, i) => ({ ...r, sortOrder: i }));
    setRecords(withOrder);
    setDragOver(null);
    dragItem.current = null;

    await api.patch('/event-records/reorder', withOrder.map(r => ({ id: r._id, sortOrder: r.sortOrder })));
  };

  const handleDragEnd = () => { setDragOver(null); dragItem.current = null; };

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return !q ||
      r.eventName?.toLowerCase().includes(q) ||
      r.clientName?.toLowerCase().includes(q) ||
      r.eventType?.toLowerCase().includes(q) ||
      r.venue?.toLowerCase().includes(q);
  });

  return (
    <main className="pt-20 min-h-screen bg-cream-50">
      {/* Header */}
      <section className="bg-charcoal py-12">
        <div className="section-container">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-sans text-gold-400 text-xs tracking-[0.2em] uppercase mb-2 block">Admin</span>
              <h1 className="font-serif text-white text-4xl mb-1">Event Records</h1>
              <p className="font-sans text-white/60 text-sm">Track every event, revenue, expenses, and performance.</p>
            </div>
            <Link to="/admin" className="font-sans text-xs text-white/60 hover:text-white transition-colors">← Back to Dashboard</Link>
          </div>
        </div>
      </section>

      <div className="section-container section-padding">
        {/* Summary */}
        {!loading && <SummaryBar records={records} />}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by event, client, venue…"
            className="input-luxury flex-1"
          />
          <button onClick={() => { setEditRecord(null); setShowModal(true); }} className="btn-gold whitespace-nowrap">
            + Add Event
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-cream-200 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎉</div>
            <p className="font-serif text-gray-400 text-xl mb-2">{search ? 'No results found.' : 'No events recorded yet.'}</p>
            {!search && <button onClick={() => { setEditRecord(null); setShowModal(true); }} className="btn-gold mt-4">Add Your First Event</button>}
          </div>
        ) : (
          <div className="space-y-2">
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[24px_1fr_140px_110px_100px_100px_80px_100px] gap-3 px-4 py-2">
              {['', 'Event / Client', 'Date', 'Type', 'Charged', 'Expenses', 'Profit', ''].map((h, i) => (
                <span key={i} className="font-sans text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</span>
              ))}
            </div>

            {filtered.map((record, index) => {
              const profit = (Number(record.amountCharged) || 0) - (Number(record.expenses) || 0);
              const isDragOver = dragOver === index;
              return (
                <div
                  key={record._id}
                  draggable
                  onDragStart={e => handleDragStart(e, index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDrop={e => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`bg-white rounded-lg border transition-all duration-150 ${
                    isDragOver ? 'border-gold-400 shadow-lg scale-[1.01]' : 'border-cream-200 hover:border-gold-300 hover:shadow-sm'
                  }`}
                >
                  {/* Mobile layout */}
                  <div className="md:hidden p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-serif text-charcoal font-semibold">{record.eventName}</p>
                        <p className="font-sans text-sm text-gray-500">{record.clientName}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => { setEditRecord(record); setShowModal(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 text-gray-400 hover:text-gold-600 text-sm">✏️</button>
                        <button onClick={() => handleDelete(record._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-50 text-gray-400 hover:text-rose-500 text-sm">🗑️</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div><span className="text-gray-400 text-xs">Charged</span><br /><span className="font-semibold text-green-700">{money(record.amountCharged)}</span></div>
                      <div><span className="text-gray-400 text-xs">Expenses</span><br /><span className="font-semibold text-amber-700">{money(record.expenses)}</span></div>
                      <div><span className="text-gray-400 text-xs">Profit</span><br /><span className={`font-semibold ${profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{money(profit)}</span></div>
                    </div>
                    {record.notes && <p className="font-sans text-xs text-gray-400 mt-2 italic">"{record.notes}"</p>}
                  </div>

                  {/* Desktop layout */}
                  <div className="hidden md:grid grid-cols-[24px_1fr_140px_110px_100px_100px_80px_100px] gap-3 px-4 py-3 items-center">
                    {/* Drag handle */}
                    <span className="text-gray-300 cursor-grab active:cursor-grabbing select-none text-lg">⠿</span>

                    {/* Name / client */}
                    <div className="min-w-0">
                      <p className="font-serif text-charcoal font-semibold truncate">{record.eventName}</p>
                      <p className="font-sans text-xs text-gray-400 truncate">
                        {record.clientName}{record.clientName && record.venue ? ' · ' : ''}{record.venue}
                      </p>
                    </div>

                    {/* Date + duration */}
                    <div>
                      <p className="font-sans text-sm text-charcoal">{fmt(record.eventDate)}</p>
                      {record.durationHours > 0 && <p className="font-sans text-xs text-gray-400">{record.durationHours}h · {record.guestCount || 0} guests</p>}
                    </div>

                    {/* Type */}
                    <div>
                      {record.eventType && (
                        <span className="font-sans text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {record.eventType.split(' ')[0]}
                        </span>
                      )}
                      {record.decorType && <p className="font-sans text-[10px] text-gray-400 mt-0.5 truncate">{record.decorType}</p>}
                    </div>

                    {/* Charged */}
                    <span className="font-sans text-sm font-semibold text-green-700">{money(record.amountCharged)}</span>

                    {/* Expenses */}
                    <span className="font-sans text-sm font-semibold text-amber-700">{money(record.expenses)}</span>

                    {/* Profit */}
                    <span className={`font-sans text-sm font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {money(profit)}
                    </span>

                    {/* Actions */}
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => { setEditRecord(record); setShowModal(true); }}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-100 text-gray-300 hover:text-gold-600 transition-colors">✏️</button>
                      <button onClick={() => handleDelete(record._id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-50 text-gray-300 hover:text-rose-500 transition-colors">🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="font-sans text-gray-400 text-xs text-center mt-6">
          Drag rows to reorder · {filtered.length} event{filtered.length !== 1 ? 's' : ''}
          {search ? ` matching "${search}"` : ''}
        </p>
      </div>

      {/* Modal */}
      {showModal && (
        <RecordModal
          initial={editRecord}
          onSave={editRecord ? handleEdit : handleAdd}
          onClose={() => { setShowModal(false); setEditRecord(null); }}
        />
      )}
    </main>
  );
}
