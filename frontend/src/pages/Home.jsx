import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext.jsx';

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-charcoal">
        <img
          src="https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1600&q=80"
          alt="Elegant event decoration"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
      </div>

      {/* Decorative gold lines */}
      <div className="absolute left-8 top-1/4 w-px h-32 bg-gradient-to-b from-transparent via-gold-400 to-transparent opacity-60" />
      <div className="absolute right-8 top-1/4 w-px h-32 bg-gradient-to-b from-transparent via-gold-400 to-transparent opacity-60" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p className="font-sans text-gold-300 text-sm tracking-[0.3em] uppercase mb-6 animate-fade-in">
          Columbus, Ohio
        </p>

        <h1 className="font-serif text-white text-5xl md:text-6xl lg:text-7xl leading-tight mb-6 text-shadow-luxury animate-fade-up">
          Where Every Moment
          <br />
          <span className="gold-shimmer italic">Becomes Magic</span>
        </h1>

        <p className="font-sans text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up">
          Luxury event decoration and planning services that transform your vision into breathtaking reality. From intimate gatherings to grand celebrations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up">
          <Link to="/booking" className="btn-gold text-base px-10 py-4">
            Book Your Event
          </Link>
          <Link to="/gallery" className="btn-white text-base px-10 py-4">
            View Our Work
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────
/*
function Stats() {
  const stats = [
    { value: '500+', label: 'Events Decorated' },
    { value: '8+', label: 'Years in Columbus' },
    { value: '98%', label: 'Client Satisfaction' },
    { value: '50+', label: 'Unique Styles' },
  ];
  return (
    <section className="bg-charcoal py-12">
      <div className="section-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-4xl font-bold text-gold-400 mb-1">{s.value}</div>
              <div className="font-sans text-white/60 text-sm tracking-wide uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
*/
// ─── SERVICES ─────────────────────────────────────────────────────────────────
const services = [
  {
    icon: '🌹',
    title: 'Floral Design',
    description: 'Exquisite floral arrangements and centerpieces that set the perfect tone for your event.'
  },
  {
    icon: '✨',
    title: 'Luxury Décor',
    description: 'Premium backdrops, drapery, lighting, and accessories that create an unforgettable atmosphere.'
  },
  {
    icon: '🎂',
    title: 'Birthday Celebrations',
    description: 'From sweet 16s to milestone birthdays — we craft magical moments for every age.'
  },
  {
    icon: '💍',
    title: 'Wedding Receptions',
    description: 'Romantic, elegant, and timeless — we bring your wedding dreams to life.'
  },
  {
    icon: '👶',
    title: 'Baby & Bridal Showers',
    description: 'Delicate, thoughtful, and beautiful setups that celebrate new beginnings.'
  },
  {
    icon: '🏢',
    title: 'Corporate Events',
    description: 'Professional, polished event design that reflects your brand with sophistication.'
  },
];

function Services() {
  return (
    <section className="section-padding bg-white">
      <div className="section-container">
        <div className="text-center mb-14">
          <span className="section-tag">Our Services</span>
          <h2 className="section-title">
            Crafting Extraordinary
            <br />
            <span className="gradient-gold-text">Experiences</span>
          </h2>
          <p className="section-subtitle mx-auto mt-4">
            Every event is a canvas. We bring art, elegance, and meticulous attention to detail to every celebration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <div key={service.title} className="card-luxury p-8 text-center group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                {service.icon}
              </div>
              <h3 className="font-serif text-xl text-charcoal mb-3">{service.title}</h3>
              <p className="font-sans text-gray-500 text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/packages" className="btn-gold">
            View All Packages
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── FEATURED GALLERY PREVIEW ─────────────────────────────────────────────────
function GalleryPreview() {
  const [images, setImages] = React.useState([]);

  useEffect(() => {
    api.get('/gallery/featured')
      .then(res => setImages(res.data.images || []))
      .catch(() => {
        // Fallback to placeholder images
        setImages([
          { _id: '1', imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600', title: 'Wedding Reception', eventType: 'Wedding Reception' },
          { _id: '2', imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600', title: 'Birthday Bash', eventType: 'Birthday Party' },
          { _id: '3', imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600', title: 'Baby Shower', eventType: 'Baby Shower' },
          { _id: '4', imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600', title: 'Anniversary Dinner', eventType: 'Anniversary' },
          { _id: '5', imageUrl: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600', title: 'Candlelit Evening', eventType: 'Wedding Reception' },
          { _id: '6', imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600', title: 'Elegant Birthday', eventType: 'Birthday Party' },
        ]);
      });
  }, []);

  return (
    <section className="section-padding bg-cream-50">
      <div className="section-container">
        <div className="text-center mb-12">
          <span className="section-tag">Our Portfolio</span>
          <h2 className="section-title">
            A Glimpse of
            <br />
            <span className="gradient-rose-text italic">Our Work</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {images.slice(0, 6).map((img, i) => (
            <div
              key={img._id || i}
              className={`relative group overflow-hidden rounded-sm ${
                i === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            >
              <div className={`aspect-gallery ${i === 0 ? 'md:aspect-auto md:h-full min-h-[200px] md:min-h-[400px]' : ''}`}>
                <img
                  src={img.imageUrl}
                  alt={img.title || img.eventType}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="gallery-overlay" />
                <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-serif text-white text-sm">{img.title}</p>
                  <p className="font-sans text-gold-300 text-xs">{img.eventType}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/gallery" className="btn-gold-outline">
            Explore Full Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── PACKAGES PREVIEW ─────────────────────────────────────────────────────────
function PackagesPreview() {
  const packages = [
    { name: 'Intimate Elegance', price: '$500–$600', icon: '🌸', highlight: 'Up to 30 guests' },
    { name: 'Classic Celebration', price: '$600–$750', icon: '✨', highlight: 'Up to 75 guests', featured: true },
    { name: 'Grand Luxe', price: '$1,000–$1,500', icon: '👑', highlight: 'Up to 150 guests' },
  ];
  return (
    <section className="section-padding bg-charcoal">
      <div className="section-container">
        <div className="text-center mb-12">
          <span className="font-sans text-gold-400 text-sm tracking-[0.2em] uppercase mb-3 block">Packages</span>
          <h2 className="font-serif text-white text-4xl md:text-5xl">
            Find Your Perfect
            <br />
            <span className="gold-shimmer">Celebration Package</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {packages.map(pkg => (
            <div
              key={pkg.name}
              className={`rounded-sm p-8 text-center transition-all duration-300 hover:-translate-y-1 ${
                pkg.featured
                  ? 'bg-gold-600 shadow-luxury'
                  : 'bg-white/5 border border-white/10 hover:border-gold-600/40'
              }`}
            >
              <div className="text-3xl mb-4">{pkg.icon}</div>
              <h3 className={`font-serif text-xl mb-2 ${pkg.featured ? 'text-white' : 'text-white'}`}>
                {pkg.name}
              </h3>
              <p className={`font-sans text-sm mb-3 ${pkg.featured ? 'text-white/80' : 'text-gray-400'}`}>
                {pkg.highlight}
              </p>
              <p className={`font-serif text-2xl font-semibold ${pkg.featured ? 'text-white' : 'text-gold-400'}`}>
                {pkg.price}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/packages" className="btn-gold">
            View All 5 Packages
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── PROCESS ──────────────────────────────────────────────────────────────────
function Process() {
  const steps = [
    { num: '01', title: 'Share Your Vision', desc: 'Tell us about your dream event — style, colors, theme, and budget.' },
    { num: '02', title: 'Design Consultation', desc: 'We create a custom design proposal tailored to your vision and space.' },
    { num: '03', title: 'Finalize & Confirm', desc: 'Review the plan, select your package, and secure your date with a deposit.' },
    { num: '04', title: 'Sit Back & Enjoy', desc: 'We handle every detail so you can be fully present on your special day.' },
  ];
  return (
    <section className="section-padding bg-white">
      <div className="section-container">
        <div className="text-center mb-14">
          <span className="section-tag">How It Works</span>
          <h2 className="section-title">
            Your Event Journey
            <br />
            <span className="gradient-gold-text">Made Simple</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div key={step.num} className="text-center relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gold-200" />
              )}
              <div className="w-16 h-16 rounded-full bg-cream-100 border-2 border-gold-300 flex items-center justify-center mx-auto mb-4">
                <span className="font-serif text-gold-600 font-bold text-lg">{step.num}</span>
              </div>
              <h3 className="font-serif text-lg text-charcoal mb-2">{step.title}</h3>
              <p className="font-sans text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      quote: "Purity Events transformed my daughter's sweet 16 into something straight out of a fairytale. Every single detail was perfect.",
      name: "Amara J.",
      event: "Sweet 16 Birthday Party",
      avatar: "A"
    },
    {
      quote: "Our wedding reception was absolutely stunning. The floral arrangements and lighting were beyond what I could have imagined. Worth every penny!",
      name: "Priya & Rahul",
      event: "Wedding Reception",
      avatar: "P"
    },
    {
      quote: "Professional, creative, and genuinely passionate about what they do. Our baby shower was the talk of the family. Book them now!",
      name: "Keisha T.",
      event: "Baby Shower",
      avatar: "K"
    },
  ];

  return (
    <section className="section-padding bg-cream-50">
      <div className="section-container">
        <div className="text-center mb-14">
          <span className="section-tag">Testimonials</span>
          <h2 className="section-title">
            Words From Our
            <br />
            <span className="gradient-rose-text italic">Happy Clients</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(t => (
            <div key={t.name} className="card-luxury p-8">
              <div className="text-gold-400 text-4xl font-serif mb-4 leading-none">"</div>
              <p className="font-sans text-gray-600 text-sm leading-relaxed mb-6 italic">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-serif font-bold">{t.avatar}</span>
                </div>
                <div>
                  <p className="font-serif font-semibold text-charcoal text-sm">{t.name}</p>
                  <p className="font-sans text-gold-600 text-xs">{t.event}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA BANNER ───────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1400&q=80"
          alt="Elegant event"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-burgundy-800/85" />
      </div>
      <div className="relative z-10 section-container text-center">
        <span className="font-sans text-gold-300 text-sm tracking-[0.2em] uppercase mb-4 block">Ready to Begin?</span>
        <h2 className="font-serif text-white text-4xl md:text-5xl mb-6">
          Let's Create Something
          <br />
          <span className="italic text-gold-300">Unforgettable Together</span>
        </h2>
        <p className="font-sans text-white/75 text-lg mb-10 max-w-xl mx-auto">
          Serving Columbus, Ohio and surrounding areas. Contact us today to check availability for your event date.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/booking" className="btn-gold text-base px-10 py-4">
            Book Your Event
          </Link>
          <Link to="/packages" className="btn-white text-base px-10 py-4">
            Explore Packages
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold-600 flex items-center justify-center">
                <span className="text-white font-serif font-bold">P</span>
              </div>
              <div>
                <div className="font-serif text-white font-semibold text-lg">Purity Events & Decorations</div>
                <div className="font-sans text-gold-400 text-xs tracking-widest uppercase">Columbus, Ohio</div>
              </div>
            </div>
            <p className="font-sans text-gray-400 text-sm leading-relaxed max-w-xs">
              Transforming moments into timeless memories with luxury event decoration and planning services throughout Columbus, Ohio.
            </p>
            <div className="flex gap-3 mt-6">
              {['instagram', 'facebook', 'pinterest'].map(social => (
                <a
                  key={social}
                  href={`#${social}`}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-gold-400 hover:text-gold-400 transition-colors text-xs font-sans text-gray-400"
                >
                  {social[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-gold-400 mb-4">Services</h4>
            <ul className="space-y-2">
              {['Birthday Parties', 'Wedding Receptions', 'Baby Showers', 'Bridal Showers', 'Corporate Events', 'Anniversaries'].map(s => (
                <li key={s}>
                  <Link to="/packages" className="font-sans text-gray-400 text-sm hover:text-gold-400 transition-colors hover-underline-gold">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-sm uppercase tracking-widest text-gold-400 mb-4">Contact</h4>
            <ul className="space-y-3 font-sans text-gray-400 text-sm">
              <li>📍 Columbus, Ohio</li>
              <li>
                <a href="tel:+16145551234" className="hover:text-gold-400 transition-colors">
                  📞 (614) 555-1234
                </a>
              </li>
              <li>
                <a href="mailto:hello@purityevents.com" className="hover:text-gold-400 transition-colors">
                  ✉️ hello@purityevents.com
                </a>
              </li>
              <li className="text-gray-500 text-xs mt-4 leading-relaxed">
                Mon–Sat: 9 AM – 7 PM
                <br />
                Sun: By appointment
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-gray-500 text-xs">
            © {new Date().getFullYear()} Purity Events & Decorations. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service'].map(link => (
              <a key={link} href="#" className="font-sans text-gray-500 text-xs hover:text-gold-400 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <GalleryPreview />
      <PackagesPreview />
      <Process />
      <Testimonials />
      <CTABanner />
      <Footer />
    </main>
  );
}
