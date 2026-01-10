import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdExample {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
}

const AD_EXAMPLES: AdExample[] = [
  {
    id: 'ad1',
    title: 'Sunrise Café',
    category: 'Food',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=600&fit=crop&crop=center'
  },
  {
    id: 'ad2',
    title: 'Elite Fitness',
    category: 'Gym',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=600&fit=crop&crop=center'
  },
  {
    id: 'ad3',
    title: 'Luxe Hotel',
    category: 'Hotel',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=600&fit=crop&crop=center'
  },
  {
    id: 'ad4',
    title: 'Urban Style',
    category: 'Retail',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop&crop=center'
  },
  {
    id: 'ad5',
    title: 'Glow Beauty',
    category: 'Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=600&fit=crop&crop=center'
  }
];

export function RecentAdsCarousel() {
  const [focusedIndex, setFocusedIndex] = useState(2);
  const containerRef = useRef<HTMLElement>(null);

  const handlePrev = () => {
    setFocusedIndex(prev => (prev > 0 ? prev - 1 : AD_EXAMPLES.length - 1));
  };

  const handleNext = () => {
    setFocusedIndex(prev => (prev < AD_EXAMPLES.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section ref={containerRef} className="py-20 px-6 relative overflow-hidden bg-neutral-900">
      <div className="max-w-[1400px] mx-auto relative">
        {/* Navigation Arrows */}
        <button 
          onClick={handlePrev}
          className="absolute left-0 lg:-left-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          aria-label="Previous ad"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button 
          onClick={handleNext}
          className="absolute right-0 lg:-right-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          aria-label="Next ad"
        >
          <ChevronRight size={24} />
        </button>

        {/* Carousel */}
        <div className="relative h-[450px] lg:h-[550px] w-full flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center perspective-1000">
            {AD_EXAMPLES.map((ad, index) => {
              const isFocused = index === focusedIndex;
              const offset = index - focusedIndex;
              const absOffset = Math.abs(offset);
              
              // Calculate positions for 3D perspective effect
              const zIndex = isFocused ? 50 : 40 - absOffset * 10;
              const scale = isFocused ? 1 : 0.8 - absOffset * 0.03;
              const translateX = offset * 200;
              const opacity = absOffset > 2 ? 0 : 1 - absOffset * 0.15;

              return (
                <div
                  key={ad.id}
                  onClick={() => setFocusedIndex(index)}
                  className="absolute transition-all duration-500 ease-out cursor-pointer"
                  style={{
                    zIndex,
                    opacity,
                    transform: `translateX(${translateX}px) scale(${scale})`,
                    filter: isFocused ? 'none' : 'grayscale(0.4) brightness(0.7)',
                  }}
                >
                  <div className={`relative w-[200px] lg:w-[260px] aspect-[3/4] rounded-[20px] lg:rounded-[28px] overflow-hidden transition-all duration-500 ${
                    isFocused 
                      ? 'shadow-2xl shadow-black/60 ring-2 ring-white/20' 
                      : 'shadow-lg'
                  }`}>
                    {/* Image */}
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Labels */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
                      <p className="text-[9px] lg:text-[10px] font-medium text-white/60 uppercase tracking-wider mb-1">
                        {ad.category}
                      </p>
                      <h3 className="text-sm lg:text-lg font-bold text-white">
                        {ad.title}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {AD_EXAMPLES.map((_, index) => (
            <button
              key={index}
              onClick={() => setFocusedIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === focusedIndex 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
