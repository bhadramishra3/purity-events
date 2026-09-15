import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../context/AuthContext.jsx';

const EVENT_TYPES = [
  'All',
  'Birthday Party',
  'Wedding Reception',
  'Baby Shower',
  'Bridal Shower',
  'Anniversary',
  'Corporate Event',
  'Graduation Party',
  'Gender Reveal',
  'Holiday Party',
];


// Lightbox modal
function Lightbox({ image, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  if (!image) return null;
  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] w-full"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={image.imageUrl?.replace('w=600', 'w=1200')}
          alt={image.title || image.eventType}
          className="w-full h-full object-contain max-h-[80vh] rounded-sm"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-sm">
          <p className="font-serif text-white text-lg">{image.title}</p>
          <p className="font-sans text-gold-300 text-sm">{image.eventType}</p>
          {image.tags?.length > 0 && (
            <div className="flex gap-2 mt-2">
              {image.tags.map(tag => (
                <span key={tag} className="font-sans text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors text-xl font-light"
        >
          ×
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
        >
          ‹
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchImages = useCallback(async (filter, pageNum = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNum, limit: 18 };
      if (filter !== 'All') params.eventType = filter;

      const res = await api.get('/gallery', { params });
      const { images: newImgs, totalPages } = res.data;

      if (pageNum === 1) {
        setImages(newImgs);
      } else {
        setImages(prev => [...prev, ...newImgs]);
      }
      setHasMore(pageNum < (totalPages || 1));
    } catch {
      if (pageNum === 1) setImages([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchImages(activeFilter, 1);
  }, [activeFilter, fetchImages]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchImages(activeFilter, nextPage);
  };

  const handleImageClick = (index) => {
    setLightboxIndex(index);
    // Increment view count
    if (images[index]?._id) {
      api.patch(`/gallery/${images[index]._id}/view`).catch(() => {});
    }
  };

  return (
    <main className="pt-20 min-h-screen bg-white">
      {/* Header */}
      <section className="relative bg-charcoal py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 section-container text-center">
          <span className="font-sans text-gold-400 text-sm tracking-[0.2em] uppercase mb-4 block">Our Work</span>
          <h1 className="font-serif text-white text-5xl md:text-6xl mb-4">
            A Gallery of
            <br />
            <span className="gold-shimmer italic">Cherished Moments</span>
          </h1>
          <p className="font-sans text-white/70 text-lg max-w-xl mx-auto">
            Browse our portfolio of events and get inspired for yours.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-cream-50 border-b border-cream-200 sticky top-16 md:top-20 z-30">
        <div className="section-container py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {EVENT_TYPES.map(filter => (
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

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="section-container">
          {loading && images.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-gallery bg-cream-200 rounded-sm animate-pulse" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-serif text-gray-400 text-xl">No images found for this category.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <div
                    key={image._id || index}
                    className="relative group overflow-hidden rounded-sm cursor-pointer aspect-gallery"
                    onClick={() => handleImageClick(index)}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.title || image.eventType}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="gallery-overlay rounded-sm" />
                    <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="font-serif text-white text-sm font-medium leading-tight">{image.title}</p>
                      <p className="font-sans text-gold-300 text-xs">{image.eventType}</p>
                    </div>
                    {/* Event type badge */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="font-sans text-xs bg-gold-600 text-white px-2 py-0.5 rounded-full">
                        {image.eventType?.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="btn-gold-outline"
                  >
                    {loading ? 'Loading…' : 'Load More'}
                  </button>
                </div>
              )}

              <p className="font-sans text-gray-400 text-sm text-center mt-6">
                Showing {images.length} images
                {activeFilter !== 'All' ? ` for ${activeFilter}` : ''}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          image={images[lightboxIndex]}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(i => (i - 1 + images.length) % images.length)}
          onNext={() => setLightboxIndex(i => (i + 1) % images.length)}
        />
      )}

      {/* CTA */}
      <section className="py-16 bg-cream-50">
        <div className="section-container text-center">
          <h2 className="font-serif text-3xl text-charcoal mb-4">
            Ready to Create Your Own
            <span className="gradient-gold-text"> Stunning Moment?</span>
          </h2>
          <p className="font-sans text-gray-500 mb-8 max-w-lg mx-auto">
            Let's bring your vision to life. Book a consultation and start planning your perfect event.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/booking" className="btn-gold">Book Your Event</a>
            <a href="/packages" className="btn-gold-outline">View Packages</a>
          </div>
        </div>
      </section>
    </main>
  );
}
