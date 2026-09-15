import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext.jsx';

const STATUS_BADGE = {
  Pending:     'badge-pending',
  Confirmed:   'badge-confirmed',
  'In Progress': 'badge bg-purple-100 text-purple-800',
  Completed:   'badge-completed',
  Cancelled:   'badge-cancelled',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function StatCard({ label, value, icon, color = 'gold' }) {
  const colors = {
    gold:     'bg-gold-50 border-gold-200 text-gold-600',
    rose:     'bg-rose-50 border-rose-200 text-rose-600',
    sage:     'bg-sage-50 border-sage-200 text-sage-600',
    burgundy: 'bg-burgundy-50 border-burgundy-200 text-burgundy-700',
  };
  return (
    <div className={`card-luxury p-6 border ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-sans text-xs uppercase tracking-widest text-gray-400 mb-1">{label}</p>
          <p className="font-serif text-3xl font-semibold">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function BookingCard({ booking, onCancel }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-luxury overflow-hidden">
      <div
        className="p-5 flex items-start justify-between cursor-pointer hover:bg-cream-50 transition-colors"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h3 className="font-serif text-base text-charcoal font-semibold">{booking.eventType}</h3>
            <span className={STATUS_BADGE[booking.bookingStatus] || 'badge bg-gray-100 text-gray-600'}>
              {booking.bookingStatus}
            </span>
          </div>
          <p className="font-sans text-sm text-gray-500">{formatDate(booking.eventDate)}</p>
          <p className="font-sans text-xs text-gray-400 truncate">{booking.venue}</p>
        </div>
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {booking.selectedPackage && (
            <span className="hidden sm:block font-sans text-xs text-gold-600 bg-gold-50 px-2 py-1 rounded-full">
              {booking.selectedPackage}
            </span>
          )}
          <span className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-cream-200 p-5 bg-cream-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 mb-4">
            <Detail label="Event Type" value={booking.eventType} />
            <Detail label="Date" value={formatDate(booking.eventDate)} />
            <Detail label="Time" value={booking.eventTime || '—'} />
            <Detail label="Venue" value={booking.venue} />
            <Detail label="Guest Count" value={booking.guestCount || '—'} />
            <Detail label="Color Theme" value={booking.colorTheme || '—'} />
            <Detail label="Package" value={booking.selectedPackage || '—'} />
            <Detail label="Tables" value={booking.tableCount || '—'} />
            <Detail label="Centerpieces" value={booking.tableCenterpieces || '—'} />
            <Detail label="Budget Min" value={booking.budgetMin ? `$${booking.budgetMin}` : '—'} />
            <Detail label="Budget Max" value={booking.budgetMax ? `$${booking.budgetMax}` : '—'} />
            <Detail label="Payment" value={booking.paymentStatus || '—'} />
          </div>

          {(booking.selectedFeatures || []).length > 0 && (
            <div className="mb-3">
              <p className="font-sans text-xs text-gray-400 uppercase tracking-wide mb-1">Add-Ons</p>
              <div className="flex flex-wrap gap-1.5">
                {booking.selectedFeatures.map(f => (
                  <span key={f.id || f.name} className="font-sans text-xs bg-white border border-cream-300 px-2 py-0.5 rounded-full text-gray-600">
                    {f.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {booking.specialRequests && (
            <div className="mb-4">
              <p className="font-sans text-xs text-gray-400 uppercase tracking-wide mb-1">Special Requests</p>
              <p className="font-sans text-sm text-gray-600">{booking.specialRequests}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {booking.bookingStatus === 'Pending' && (
              <button
                onClick={() => onCancel(booking._id)}
                className="font-sans text-xs px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-sm transition-colors"
              >
                Cancel Booking
              </button>
            )}
            <Link
              to="/booking"
              className="font-sans text-xs px-4 py-2 border border-gold-300 text-gold-600 hover:bg-gold-50 rounded-sm transition-colors"
            >
              Book Again
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="font-sans text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="font-sans text-sm text-charcoal font-medium">{value}</p>
    </div>
  );
}

export default function ClientDashboard() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings || []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      fetchBookings();
    } catch {
      alert('Failed to cancel booking.');
    }
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await api.put('/clients/profile', profileForm);
      updateUser({ name: res.data.user.name, phone: res.data.user.phone });
      setEditingProfile(false);
    } catch {
      alert('Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.bookingStatus === 'Pending').length,
    confirmed: bookings.filter(b => b.bookingStatus === 'Confirmed').length,
    completed: bookings.filter(b => b.bookingStatus === 'Completed').length,
  };

  return (
    <main className="pt-20 min-h-screen bg-cream-50">
      {/* Header */}
      <section className="bg-charcoal py-12">
        <div className="section-container flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover border-2 border-gold-400" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gold-600 flex items-center justify-center border-2 border-gold-400">
                <span className="text-white font-serif text-xl font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
            )}
            <div>
              <h1 className="font-serif text-white text-2xl md:text-3xl">Welcome, {user?.name?.split(' ')[0]}</h1>
              <p className="font-sans text-white/60 text-sm">{user?.email}</p>
            </div>
          </div>
          <Link to="/booking" className="btn-gold hidden sm:flex">
            + New Booking
          </Link>
        </div>
      </section>

      <div className="section-container py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Bookings" value={stats.total} icon="📋" color="gold" />
          <StatCard label="Pending" value={stats.pending} icon="⏳" color="rose" />
          <StatCard label="Confirmed" value={stats.confirmed} icon="✅" color="sage" />
          <StatCard label="Completed" value={stats.completed} icon="🎉" color="burgundy" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-sm border border-cream-200 p-1 w-fit">
          {['bookings', 'vision boards', 'profile'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-sans text-sm px-4 py-2 rounded-sm capitalize transition-colors ${
                activeTab === tab ? 'bg-gold-600 text-white' : 'text-gray-500 hover:text-charcoal'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── BOOKINGS TAB ── */}
        {activeTab === 'bookings' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-charcoal">Your Bookings</h2>
              <Link to="/booking" className="btn-gold py-2 text-sm sm:hidden">+ New</Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-sm animate-pulse" />)}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 card-luxury p-10">
                <div className="text-5xl mb-4">📅</div>
                <h3 className="font-serif text-xl text-charcoal mb-2">No bookings yet</h3>
                <p className="font-sans text-gray-400 mb-6">Ready to plan your dream event?</p>
                <Link to="/booking" className="btn-gold">Book Your Event</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(booking => (
                  <BookingCard key={booking._id} booking={booking} onCancel={cancelBooking} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── VISION BOARDS TAB ── */}
        {activeTab === 'vision boards' && (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">🎨</div>
            <h3 className="font-serif text-xl text-charcoal mb-2">Vision Boards</h3>
            <p className="font-sans text-gray-400 mb-6">Create inspiration boards to share your event vision with our team.</p>
            <Link to="/vision-board" className="btn-gold">Open Vision Board Creator</Link>
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div className="max-w-lg">
            <h2 className="font-serif text-xl text-charcoal mb-6">My Profile</h2>
            <div className="card-luxury p-6 space-y-4">
              {editingProfile ? (
                <>
                  <div>
                    <label className="label-luxury">Full Name</label>
                    <input
                      type="text"
                      className="input-luxury"
                      value={profileForm.name}
                      onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label-luxury">Phone Number</label>
                    <input
                      type="tel"
                      className="input-luxury"
                      value={profileForm.phone}
                      placeholder="(614) 555-1234"
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={saveProfile} disabled={profileSaving} className="btn-gold py-2">
                      {profileSaving ? 'Saving…' : 'Save Profile'}
                    </button>
                    <button onClick={() => setEditingProfile(false)} className="font-sans text-sm text-gray-500 hover:text-charcoal px-4">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <ProfileRow label="Name" value={user?.name} />
                  <ProfileRow label="Email" value={user?.email} />
                  <ProfileRow label="Phone" value={user?.phone || 'Not provided'} />
                  <ProfileRow label="Member Since" value={new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
                  <button onClick={() => setEditingProfile(true)} className="btn-gold-outline py-2 mt-2">
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-cream-200">
      <span className="font-sans text-xs text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="font-sans text-sm text-charcoal">{value}</span>
    </div>
  );
}
