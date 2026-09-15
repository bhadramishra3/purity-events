import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext.jsx';

const EVENT_TYPES = [
  'Birthday Party', 'Wedding Reception', 'Baby Shower', 'Bridal Shower',
  'Anniversary', 'Corporate Event', 'Graduation Party', 'Gender Reveal',
  'Holiday Party', 'Other'
];

const PACKAGES = [
  { id: 'intimate', name: 'Intimate Elegance', range: '$500–$600' },
  { id: 'classic', name: 'Classic Celebration', range: '$600–$750' },
  { id: 'grand', name: 'Grand Luxe', range: '$1,000–$1,500' },
  { id: 'corporate', name: 'Corporate Premier', range: '$1,000–$2,000' },
  { id: 'bespoke', name: 'Bespoke Couture', range: '$1,500–$2,000+' },
];

const ADD_ONS = [
  { id: 'floral_center', name: 'Floral Centerpieces', price: 75 },
  { id: 'led_lighting', name: 'LED Accent Lighting', price: 100 },
  { id: 'photo_booth', name: 'Photo Booth Corner', price: 100 },
  { id: 'dessert_table', name: 'Dessert Table Styling', price: 85 },
  { id: 'welcome_sign', name: 'Welcome Sign', price: 25 },
  { id: 'ceiling_drape', name: 'Ceiling Draping', price: 250 },
  { id: 'chair_covers', name: 'Chair Covers', price: 5 },
];

const CENTERPIECE_STYLES = ['Floral', 'Candle', 'Mixed', 'Balloon', 'Custom', 'None'];

const STEPS = ['Event Details', 'Package & Features', 'Budget & Notes', 'Review & Submit'];

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-sans font-bold text-sm transition-all duration-300 ${
              i < current ? 'step-completed' :
              i === current ? 'step-active shadow-luxury' :
              'step-inactive'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`font-sans text-xs hidden sm:block ${
              i === current ? 'text-gold-600 font-semibold' : 'text-gray-400'
            }`}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors duration-300 ${
              i < current ? 'bg-sage-500' : 'bg-cream-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── STEP 1: EVENT DETAILS ────────────────────────────────────────────────────
function Step1({ data, onChange, errors }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl text-charcoal">Tell Us About Your Event</h2>
        <p className="font-sans text-gray-400 text-sm mt-1">Basic event information to get started</p>
      </div>

      {/* Event Type */}
      <div>
        <label className="label-luxury">Event Type *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {EVENT_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => onChange('eventType', type)}
              className={`p-2.5 text-xs font-sans font-medium rounded-sm border-2 transition-all duration-200 text-center ${
                data.eventType === type
                  ? 'border-gold-600 bg-gold-50 text-gold-700'
                  : 'border-cream-300 text-gray-600 hover:border-gold-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>}
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-luxury">Event Date *</label>
          <input
            type="date"
            className="input-luxury"
            value={data.eventDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={e => onChange('eventDate', e.target.value)}
          />
          {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate}</p>}
        </div>
        <div>
          <label className="label-luxury">Event Start Time</label>
          <input
            type="time"
            className="input-luxury"
            value={data.eventTime}
            onChange={e => onChange('eventTime', e.target.value)}
          />
        </div>
      </div>

      {/* Venue */}
      <div>
        <label className="label-luxury">Venue / Location Name *</label>
        <input
          type="text"
          className="input-luxury"
          placeholder="e.g., The Venue at Columbus, My Home, DoubleTree Columbus"
          value={data.venue}
          onChange={e => onChange('venue', e.target.value)}
        />
        {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
      </div>

      <div>
        <label className="label-luxury">Venue Address</label>
        <input
          type="text"
          className="input-luxury"
          placeholder="123 Main St, Columbus, OH 43215"
          value={data.venueAddress}
          onChange={e => onChange('venueAddress', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-luxury">Estimated Guest Count</label>
          <input
            type="number"
            className="input-luxury"
            placeholder="e.g., 50"
            min="1"
            value={data.guestCount}
            onChange={e => onChange('guestCount', e.target.value)}
          />
        </div>
        <div>
          <label className="label-luxury">Color Theme</label>
          <input
            type="text"
            className="input-luxury"
            placeholder="e.g., Gold & Burgundy, Blush & Sage"
            value={data.colorTheme}
            onChange={e => onChange('colorTheme', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── STEP 2: PACKAGE & FEATURES ───────────────────────────────────────────────
function Step2({ data, onChange }) {
  const toggleFeature = (feature) => {
    const current = data.selectedFeatures || [];
    const exists = current.find(f => f.id === feature.id);
    if (exists) {
      onChange('selectedFeatures', current.filter(f => f.id !== feature.id));
    } else {
      onChange('selectedFeatures', [...current, { id: feature.id, name: feature.name, price: feature.price }]);
    }
  };

  const isSelected = (id) => (data.selectedFeatures || []).some(f => f.id === id);
  const total = (data.selectedFeatures || []).reduce((sum, f) => sum + (f.price || 0), 0);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl text-charcoal">Select Your Package</h2>
        <p className="font-sans text-gray-400 text-sm mt-1">Choose a starting package and any add-ons</p>
      </div>

      {/* Package Selection */}
      <div>
        <label className="label-luxury mb-4">Package *</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PACKAGES.map(pkg => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => onChange('selectedPackage', pkg.name)}
              className={`p-4 rounded-sm border-2 text-left transition-all duration-200 ${
                data.selectedPackage === pkg.name
                  ? 'border-gold-600 bg-gold-50 shadow-luxury'
                  : 'border-cream-300 hover:border-gold-300'
              }`}
            >
              <p className="font-serif text-sm font-semibold text-charcoal">{pkg.name}</p>
              <p className="font-sans text-gold-600 text-sm font-bold mt-0.5">{pkg.range}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Table Setup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-luxury">Number of Tables</label>
          <input
            type="number"
            className="input-luxury"
            min="0"
            value={data.tableCount}
            onChange={e => onChange('tableCount', e.target.value)}
          />
        </div>
        <div>
          <label className="label-luxury">Centerpiece Style</label>
          <select
            className="input-luxury"
            value={data.tableCenterpieces}
            onChange={e => onChange('tableCenterpieces', e.target.value)}
          >
            {CENTERPIECE_STYLES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add-Ons */}
      <div>
        <label className="label-luxury mb-3">Add-Ons (Optional)</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ADD_ONS.map(addon => (
            <button
              key={addon.id}
              type="button"
              onClick={() => toggleFeature(addon)}
              className={`flex items-center justify-between p-3 rounded-sm border-2 transition-all duration-200 text-left ${
                isSelected(addon.id)
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-cream-300 hover:border-gold-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected(addon.id) ? 'border-gold-600 bg-gold-600' : 'border-gray-300'
                }`}>
                  {isSelected(addon.id) && <span className="text-white text-[10px]">✓</span>}
                </div>
                <span className="font-sans text-sm text-charcoal">{addon.name}</span>
              </div>
              <span className="font-sans text-xs text-gold-600 font-bold">+${addon.price}</span>
            </button>
          ))}
        </div>
        {(data.selectedFeatures || []).length > 0 && (
          <p className="font-sans text-sm text-gold-600 font-semibold mt-3">
            Add-ons subtotal: +${total.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── STEP 3: BUDGET & NOTES ───────────────────────────────────────────────────
function Step3({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl text-charcoal">Budget & Special Requests</h2>
        <p className="font-sans text-gray-400 text-sm mt-1">Help us understand your vision and budget</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label-luxury">Minimum Budget ($)</label>
          <input
            type="number"
            className="input-luxury"
            placeholder="e.g., 600"
            min="0"
            value={data.budgetMin}
            onChange={e => onChange('budgetMin', e.target.value)}
          />
        </div>
        <div>
          <label className="label-luxury">Maximum Budget ($)</label>
          <input
            type="number"
            className="input-luxury"
            placeholder="e.g., 1000"
            min="0"
            value={data.budgetMax}
            onChange={e => onChange('budgetMax', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label-luxury">Special Requests / Vision Notes</label>
        <textarea
          className="input-luxury min-h-[140px] resize-y"
          placeholder="Describe your dream event setup, specific ideas, themes, must-haves, or any special requests..."
          value={data.specialRequests}
          onChange={e => onChange('specialRequests', e.target.value)}
        />
      </div>

      <div className="bg-gold-50 border border-gold-200 rounded-sm p-6">
        <h4 className="font-serif text-charcoal font-semibold mb-3">What Happens Next?</h4>
        <ul className="space-y-2">
          {[
            'We\'ll review your request within 24 hours',
            'You\'ll receive a detailed quote and design proposal',
            'We\'ll schedule a free consultation call',
            '30–50% deposit secures your date',
          ].map(step => (
            <li key={step} className="flex items-start gap-2">
              <span className="text-gold-500 font-bold text-sm">✓</span>
              <span className="font-sans text-gray-600 text-sm">{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── STEP 4: REVIEW ───────────────────────────────────────────────────────────
function Step4({ data, user }) {
  const ReviewRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-cream-200">
      <span className="font-sans text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="font-sans text-sm text-charcoal font-medium text-right max-w-xs">{value || '—'}</span>
    </div>
  );

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl text-charcoal">Review Your Request</h2>
        <p className="font-sans text-gray-400 text-sm mt-1">Please confirm all details before submitting</p>
      </div>

      <div className="space-y-6">
        {/* Client info */}
        <div className="bg-cream-50 rounded-sm p-5">
          <h4 className="font-serif text-sm uppercase tracking-widest text-gold-600 mb-3">Your Information</h4>
          <ReviewRow label="Name" value={user?.name} />
          <ReviewRow label="Email" value={user?.email} />
        </div>

        {/* Event info */}
        <div className="bg-cream-50 rounded-sm p-5">
          <h4 className="font-serif text-sm uppercase tracking-widest text-gold-600 mb-3">Event Details</h4>
          <ReviewRow label="Event Type" value={data.eventType} />
          <ReviewRow label="Date" value={data.eventDate ? new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''} />
          <ReviewRow label="Time" value={data.eventTime} />
          <ReviewRow label="Venue" value={data.venue} />
          <ReviewRow label="Venue Address" value={data.venueAddress} />
          <ReviewRow label="Guest Count" value={data.guestCount} />
          <ReviewRow label="Color Theme" value={data.colorTheme} />
        </div>

        {/* Package */}
        <div className="bg-cream-50 rounded-sm p-5">
          <h4 className="font-serif text-sm uppercase tracking-widest text-gold-600 mb-3">Package & Setup</h4>
          <ReviewRow label="Package" value={data.selectedPackage} />
          <ReviewRow label="Tables" value={data.tableCount} />
          <ReviewRow label="Centerpieces" value={data.tableCenterpieces} />
          {(data.selectedFeatures || []).length > 0 && (
            <ReviewRow
              label="Add-Ons"
              value={(data.selectedFeatures || []).map(f => f.name).join(', ')}
            />
          )}
        </div>

        {/* Budget */}
        <div className="bg-cream-50 rounded-sm p-5">
          <h4 className="font-serif text-sm uppercase tracking-widest text-gold-600 mb-3">Budget</h4>
          <ReviewRow
            label="Budget Range"
            value={data.budgetMin || data.budgetMax ? `$${data.budgetMin || 0} – $${data.budgetMax || 'Open'}` : ''}
          />
          <ReviewRow label="Special Requests" value={data.specialRequests} />
        </div>

        <div className="bg-gold-50 border border-gold-300 rounded-sm p-4 text-center">
          <p className="font-sans text-sm text-gold-700">
            By submitting, you agree to our terms. A 30–50% deposit will be required to confirm your booking.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING PAGE ─────────────────────────────────────────────────────────────
const INITIAL_FORM = {
  eventType: '',
  eventDate: '',
  eventTime: '',
  venue: '',
  venueAddress: '',
  guestCount: '',
  colorTheme: '',
  selectedPackage: '',
  tableCount: 0,
  tableCenterpieces: 'None',
  selectedFeatures: [],
  budgetMin: '',
  budgetMax: '',
  specialRequests: '',
};

export default function Booking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const onChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 0) {
      if (!form.eventType) newErrors.eventType = 'Please select an event type.';
      if (!form.eventDate) newErrors.eventDate = 'Please select your event date.';
      else if (new Date(form.eventDate) < new Date()) newErrors.eventDate = 'Date must be in the future.';
      if (!form.venue.trim()) newErrors.venue = 'Please enter your venue.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/bookings', form);
      setSuccess(true);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="pt-20 min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center card-luxury p-12">
          <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="font-serif text-3xl text-charcoal mb-3">Request Submitted!</h2>
          <p className="font-sans text-gray-500 mb-8">
            Thank you! We've received your booking request and will be in touch within 24 hours with a custom proposal.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-gold">
              View My Dashboard
            </button>
            <button
              onClick={() => { setSuccess(false); setStep(0); setForm(INITIAL_FORM); }}
              className="btn-gold-outline"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-cream-50">
      {/* Hero */}
      <section className="bg-charcoal py-16">
        <div className="section-container text-center">
          <span className="font-sans text-gold-400 text-sm tracking-[0.2em] uppercase mb-3 block">Let's Plan Your Event</span>
          <h1 className="font-serif text-white text-4xl md:text-5xl">Book Your Event</h1>
          <p className="font-sans text-white/60 mt-3 text-sm">Columbus, Ohio · Free Consultation Included</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <StepIndicator current={step} steps={STEPS} />

          <div className="card-luxury p-8 md:p-12">
            {step === 0 && <Step1 data={form} onChange={onChange} errors={errors} />}
            {step === 1 && <Step2 data={form} onChange={onChange} />}
            {step === 2 && <Step3 data={form} onChange={onChange} />}
            {step === 3 && <Step4 data={form} user={user} />}

            {submitError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-sm">
                <p className="font-sans text-red-600 text-sm">{submitError}</p>
              </div>
            )}

            <div className="flex justify-between items-center mt-10 pt-6 border-t border-cream-200">
              {step > 0 ? (
                <button
                  onClick={handleBack}
                  disabled={submitting}
                  className="font-sans text-sm text-gray-500 hover:text-charcoal flex items-center gap-1 transition-colors"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {step < STEPS.length - 1 ? (
                <button onClick={handleNext} className="btn-gold">
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-gold"
                >
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </button>
              )}
            </div>
          </div>

          <p className="font-sans text-xs text-gray-400 text-center mt-6">
            Logged in as {user?.name} · {user?.email}
          </p>
        </div>
      </section>
    </main>
  );
}
