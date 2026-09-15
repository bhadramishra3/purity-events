import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const packages = [
  {
    id: 'intimate',
    name: 'Intimate Elegance',
    subtitle: 'Perfect for small, cozy celebrations',
    priceRange: '$500 – $600',
    icon: '🌸',
    color: 'rose',
    eventTypes: ['Gunyo Choli', 'Bartamanda', 'Birthday Party', 'Anniversary', 'Bridal Shower', 'Baby Shower'],
    features: [
      'Full Center Stage Decor',
      'Candle accent décor',
      'Color-coordinated linens',
      'Setup & teardown',
      'Balloon arrangement (2 colors)',
    ],
    addOns: [
      { name: 'Floral centerpiece upgrade', price: '+$75' },
      { name: 'LED fairy lights', price: '+$50' },
      { name: 'Photo Booth', price: '+150'},
      { name: 'Welcome sign', price: '+$40' },
      { name: 'Loveseat Couch', price: '+75'},
    ],
    featured: false,
  },
  {
    id: 'classic',
    name: 'Classic Celebration',
    subtitle: 'Our most popular package',
    priceRange: '$600 – $750',
    icon: '✨',
    color: 'gold',
    eventTypes: ['Birthday Party', 'Graduation', 'Baby Shower', 'Bridal Shower', 'Gender Reveal'],
    features: [
      'Simple floral table centerpieces',
      'Luxury stage decor',
      'Color-coordinated linens & runners',
      'Welcome sign / marquee letters',
      'Floral accent pieces',
      'Setup & teardown (4 hrs)',
    ],
    addOns: [
      { name: 'Photo booth corner', price: '+$150' },
      { name: 'Extra table centerpieces (each)', price: '+$30' },
      { name: 'Dessert table styling', price: '+$85' },
    ],
    featured: true,
  },
  {
    id: 'grand',
    name: 'Grand Luxe',
    subtitle: 'Go all out for milestone events',
    priceRange: '$1,000 – $1,500',
    guestRange: 'Up to 150 guests',
    icon: '👑',
    color: 'burgundy',
    eventTypes: ['Wedding Reception', 'Quinceañera', 'Sweet 16', 'Corporate Gala', 'Holiday Party'],
    features: [
      'Full venue transformation',
      'Up to 15 table centerpieces',
      'Premium floral backdrop',
      'Floral arrangements (all tables)',
      'Luxury linens and runners',
      'Welcome sign',
      'Dessert table full styling',
      'Setup & teardown (8 hrs)',
    ],
    addOns: [
      { name: 'Ceiling draping', price: '+$200' },
      { name: 'Live floral installation', price: '+$300' },
      { name: 'Chair covers', price: '+$3/chair' },
    ],
    featured: false,
  },
  {
    id: 'corporate',
    name: 'Corporate Premier',
    subtitle: 'Professional events with sophistication',
    priceRange: '$1,000 – $2,000',
    guestRange: 'Up to 200 guests',
    icon: '🏢',
    color: 'charcoal',
    eventTypes: ['Corporate Event', 'Product Launch', 'Award Ceremony', 'Team Celebration'],
    features: [
      'Branded backdrop & step-and-repeat',
      'Up to 20 table centerpieces',
      'Premium corporate color scheme',
      'Stage/podium décor',
      'Logo integration in décor elements',
      'Luxury cocktail table styling',
      'Executive table setup',
      'Setup & teardown included',
    ],
    addOns: [
      { name: 'Custom branded signage', price: '+$150' },
      { name: 'Premium AV draping', price: '+$250' },
      { name: 'VIP lounge area styling', price: '+$200' },
      { name: 'Full coordination support', price: '+100'},
    ],
    featured: false,
  },
  {
    id: 'bespoke',
    name: 'Bespoke Couture',
    subtitle: 'Fully custom — no limits, no compromise',
    priceRange: '$1,500 – $2,000+',
    guestRange: 'Any size',
    icon: '💎',
    color: 'gold',
    eventTypes: ['Any Event Type'],
    features: [
      'Everything in Grand Luxe, PLUS:',
      'Vision board collaboration session',
      'Multiple venue walk-throughs',
      'Unlimited style revisions',
      'Priority scheduling & dedicated team',
      'Luxury floral statement pieces',
      'Full ceiling installation',
      'Custom fabricated elements',
      'Day-of coordination (10 hrs)',
    ],
    addOns: [
      { name: 'Anything — truly bespoke', price: 'Custom quote' },
    ],
    featured: false,
  },
];

const colorMap = {
  rose:     { bg: 'bg-rose-50',       border: 'border-rose-200',   tag: 'bg-rose-100 text-rose-700',     badge: 'bg-rose-600' },
  gold:     { bg: 'bg-cream-50',      border: 'border-gold-300',   tag: 'bg-gold-100 text-gold-700',     badge: 'bg-gold-600' },
  burgundy: { bg: 'bg-burgundy-50',   border: 'border-burgundy-300',tag: 'bg-burgundy-100 text-burgundy-700', badge: 'bg-burgundy-800' },
  charcoal: { bg: 'bg-gray-50',       border: 'border-gray-300',   tag: 'bg-gray-100 text-gray-700',     badge: 'bg-gray-700' },
};

function PackageCard({ pkg }) {
  const [showAddOns, setShowAddOns] = useState(false);
  const c = colorMap[pkg.color] || colorMap.gold;

  return (
    <div className={`relative flex flex-col rounded-sm border-2 ${
      pkg.featured
        ? 'border-gold-500 shadow-luxury bg-white'
        : `${c.border} bg-white shadow-card`
    } overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1`}>

      {/* Featured ribbon */}
      {pkg.featured && (
        <div className="absolute top-4 right-4 bg-gold-600 text-white font-sans text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase shadow">
          Most Popular
        </div>
      )}

      {/* Header */}
      <div className={`p-8 pb-6 ${c.bg} border-b ${c.border}`}>
        <div className="text-4xl mb-3">{pkg.icon}</div>
        <h3 className="font-serif text-2xl text-charcoal mb-1">{pkg.name}</h3>
        <p className="font-sans text-gray-500 text-sm mb-4">{pkg.subtitle}</p>

        <div className="mb-4">
          <span className="font-serif text-3xl font-semibold text-charcoal">{pkg.priceRange}</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="font-sans text-xs text-gray-500">👥 {pkg.guestRange}</span>
        </div>

        {/* Event types */}
        <div className="flex flex-wrap gap-1.5">
          {pkg.eventTypes.slice(0, 3).map(t => (
            <span key={t} className={`font-sans text-xs px-2 py-0.5 rounded-full ${c.tag}`}>{t}</span>
          ))}
          {pkg.eventTypes.length > 3 && (
            <span className={`font-sans text-xs px-2 py-0.5 rounded-full ${c.tag}`}>+{pkg.eventTypes.length - 3} more</span>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="p-8 flex-1">
        <h4 className="font-sans text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">What's Included</h4>
        <ul className="space-y-2.5">
          {pkg.features.map(f => (
            <li key={f} className="flex items-start gap-2.5">
              <span className="text-gold-500 font-bold text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="font-sans text-gray-600 text-sm leading-snug">{f}</span>
            </li>
          ))}
        </ul>

        {/* Add-ons toggle */}
        {pkg.addOns?.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setShowAddOns(p => !p)}
              className="font-sans text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1 transition-colors"
            >
              {showAddOns ? '▾' : '▸'} Popular Add-Ons
            </button>
            {showAddOns && (
              <ul className="mt-3 space-y-1.5 pl-4 border-l-2 border-gold-200">
                {pkg.addOns.map(a => (
                  <li key={a.name} className="flex items-center justify-between">
                    <span className="font-sans text-xs text-gray-500">{a.name}</span>
                    <span className="font-sans text-xs font-semibold text-gold-600">{a.price}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-8 pb-8">
        <Link
          to="/booking"
          className={`w-full block text-center py-3 px-6 font-sans font-semibold text-sm tracking-wide rounded-sm transition-all duration-300 ${
            pkg.featured
              ? 'bg-gold-600 text-white hover:bg-gold-700 shadow-luxury'
              : 'border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white'
          }`}
        >
          Book This Package
        </Link>
        <p className="font-sans text-xs text-gray-400 text-center mt-3">
          Free consultation · No commitment
        </p>
      </div>
    </div>
  );
}

export default function Packages() {
  const [activeFilter, setActiveFilter] = useState('All');
  const eventTypeFilters = ['All', 'Birthday Party', 'Wedding Reception', 'Baby Shower', 'Corporate Event', 'Graduation'];

  const filtered = packages.filter(pkg =>
    activeFilter === 'All' || pkg.eventTypes.includes(activeFilter) || pkg.eventTypes.includes('Any Event Type')
  );

  return (
    <main className="pt-20 min-h-screen bg-white">
      {/* Header */}
      <section className="relative bg-charcoal py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 section-container text-center">
          <span className="font-sans text-gold-400 text-sm tracking-[0.2em] uppercase mb-4 block">Our Packages</span>
          <h1 className="font-serif text-white text-5xl md:text-6xl mb-4">
            Choose Your
            <br />
            <span className="gold-shimmer italic">Dream Package</span>
          </h1>
          <p className="font-sans text-white/70 text-lg max-w-2xl mx-auto">
            Every package includes a personal consultation and can be customized to match your unique vision. All prices are estimates — final pricing based on your specific needs.
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="bg-cream-50 border-b border-cream-200 sticky top-16 md:top-20 z-30">
        <div className="section-container py-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {eventTypeFilters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-shrink-0 font-sans text-sm px-4 py-2 rounded-full transition-all duration-200 ${
                  activeFilter === filter
                    ? 'bg-gold-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gold-400 hover:text-gold-600'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="section-padding">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filtered.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-serif text-gray-400 text-xl">No packages found for this event type.</p>
            </div>
          )}
        </div>
      </section>

      {/* Custom CTA */}
      <section className="py-16 bg-cream-50">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center card-luxury p-12">
            <div className="text-4xl mb-4">💌</div>
            <h2 className="font-serif text-3xl text-charcoal mb-3">Need Something Different?</h2>
            <p className="font-sans text-gray-500 mb-8">
              Every event is unique. Let's talk about exactly what you have in mind and build a custom package just for you.
            </p>
            <Link to="/booking" className="btn-gold">
              Request Custom Quote
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-white">
        <div className="section-container max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="section-tag">FAQ</span>
            <h2 className="section-title">Common Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'How far in advance should I book?', a: 'We recommend booking at least 4–6 weeks in advance for standard packages, and 8–12 weeks for Grand Luxe and Bespoke Couture packages to ensure availability.' },
              { q: 'Is a deposit required?', a: 'Yes, a 30–50% deposit is required to secure your date. The remaining balance is due 7 days before your event.' },
              { q: 'Do you travel outside Columbus?', a: 'Yes! We serve the greater Columbus area including Dublin, Westerville, Hilliard, Grove City, Gahanna, and surrounding communities. Travel fees may apply.' },
              { q: 'Can I see the décor before the event?', a: 'We offer a design preview for all packages and mock-up sessions for Couture and Bespoke packages.'},
              { q: 'What if I need to cancel or reschedule?', a: 'Cancellations after the deposit will not receive their deposits back. With that being said we understand that there can be unforeseen circumstances and we will work with you to make things work, communicate with us.' },
            ].map(faq => (
              <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-sm transition-all duration-200 ${open ? 'border-gold-400 shadow-luxury' : 'border-cream-300'}`}>
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
      >
        <span className="font-serif text-charcoal font-semibold">{question}</span>
        <span className={`text-gold-600 font-bold transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="font-sans text-gray-600 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}
