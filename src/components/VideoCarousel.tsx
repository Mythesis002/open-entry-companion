import { useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX, Pause } from 'lucide-react';

interface VideoAd {
  id: string;
  title: string;
  category: string;
  thumbnailUrl: string;
  videoUrl: string;
}

const VIDEO_ADS: VideoAd[] = [
  {
    id: 'vid1',
    title: 'Sunrise Café',
    category: 'Food & Beverage',
    thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=700&fit=crop&crop=center',
    videoUrl: 'https://player.vimeo.com/external/517090081.hd.mp4?s=f95d3d3fa4c618c01b2ddff1dfee3d6e3d2b5b08&profile_id=175'
  },
  {
    id: 'vid2',
    title: 'Elite Fitness',
    category: 'Health & Fitness',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=700&fit=crop&crop=center',
    videoUrl: 'https://player.vimeo.com/external/434045526.hd.mp4?s=c27eecc69a27dbc4ff26b38a2f24d34a3fbdef9c&profile_id=175'
  },
  {
    id: 'vid3',
    title: 'Luxe Hotel',
    category: 'Hospitality',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=700&fit=crop&crop=center',
    videoUrl: 'https://player.vimeo.com/external/368484050.hd.mp4?s=e0b9e9ef8de4d2d02795f65ec0dc8b768e0a23c5&profile_id=175'
  },
  {
    id: 'vid4',
    title: 'Urban Style',
    category: 'Fashion & Retail',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=700&fit=crop&crop=center',
    videoUrl: 'https://player.vimeo.com/external/454696113.hd.mp4?s=b8a2c9a9a99c5a7b9f7c8d7e6f5a4b3c2d1e0f9a&profile_id=175'
  },
  {
    id: 'vid5',
    title: 'Glow Beauty',
    category: 'Beauty & Cosmetics',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=700&fit=crop&crop=center',
    videoUrl: 'https://player.vimeo.com/external/422787651.hd.mp4?s=7a0e9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a&profile_id=175'
  }
];

export function VideoCarousel() {
  const [focusedIndex, setFocusedIndex] = useState(2);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const handlePrev = () => {
    stopAllVideos();
    setFocusedIndex(prev => (prev > 0 ? prev - 1 : VIDEO_ADS.length - 1));
  };

  const handleNext = () => {
    stopAllVideos();
    setFocusedIndex(prev => (prev < VIDEO_ADS.length - 1 ? prev + 1 : 0));
  };

  const stopAllVideos = () => {
    videoRefs.current.forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
    setPlayingId(null);
  };

  const handleVideoClick = useCallback((ad: VideoAd, index: number) => {
    if (index !== focusedIndex) {
      stopAllVideos();
      setFocusedIndex(index);
      return;
    }

    const video = videoRefs.current.get(ad.id);
    if (!video) return;

    if (playingId === ad.id) {
      video.pause();
      setPlayingId(null);
    } else {
      stopAllVideos();
      video.muted = isMuted;
      video.play().catch(() => {});
      setPlayingId(ad.id);
    }
  }, [focusedIndex, playingId, isMuted]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    videoRefs.current.forEach((video) => {
      video.muted = !isMuted;
    });
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Ambient glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-amber-500/20 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-[1400px] mx-auto relative">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Live Examples
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold font-display tracking-tighter text-white">
            Ads That Convert
          </h2>
          <p className="text-white/50 text-sm font-medium max-w-md mx-auto">
            Click any video to play. Real AI-generated ads for real businesses.
          </p>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={handlePrev}
          className="absolute left-2 lg:-left-4 top-1/2 mt-8 -translate-y-1/2 z-40 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-2xl"
          aria-label="Previous ad"
        >
          <ChevronLeft size={24} />
        </button>
        
        <button 
          onClick={handleNext}
          className="absolute right-2 lg:-right-4 top-1/2 mt-8 -translate-y-1/2 z-40 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-2xl"
          aria-label="Next ad"
        >
          <ChevronRight size={24} />
        </button>

        {/* Mute toggle */}
        {playingId && (
          <button
            onClick={toggleMute}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-all"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        )}

        {/* Carousel */}
        <div className="relative h-[500px] lg:h-[600px] w-full flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center perspective-1000">
            {VIDEO_ADS.map((ad, index) => {
              const isFocused = index === focusedIndex;
              const isPlaying = playingId === ad.id;
              const offset = index - focusedIndex;
              const absOffset = Math.abs(offset);
              
              const zIndex = isFocused ? 50 : 40 - absOffset * 10;
              const scale = isFocused ? 1 : 0.75 - absOffset * 0.05;
              const translateX = offset * 180;
              const rotateY = offset * -5;
              const opacity = absOffset > 2 ? 0 : 1 - absOffset * 0.2;

              return (
                <div
                  key={ad.id}
                  onClick={() => handleVideoClick(ad, index)}
                  className="absolute transition-all duration-500 ease-out cursor-pointer group"
                  style={{
                    zIndex,
                    opacity,
                    transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                    filter: isFocused ? 'none' : 'grayscale(0.5) brightness(0.6)',
                  }}
                >
                  <div className={`relative w-[200px] lg:w-[240px] aspect-[9/16] rounded-[24px] lg:rounded-[32px] overflow-hidden transition-all duration-500 ${
                    isFocused 
                      ? 'shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8)] ring-2 ring-white/30' 
                      : 'shadow-xl'
                  }`}>
                    {/* Thumbnail */}
                    <img
                      src={ad.thumbnailUrl}
                      alt={ad.title}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
                      loading="lazy"
                    />
                    
                    {/* Video - only loads when clicked */}
                    <video
                      ref={el => { if (el) videoRefs.current.set(ad.id, el); }}
                      src={ad.videoUrl}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}
                      loop
                      playsInline
                      preload="none"
                      muted={isMuted}
                    />
                    
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${isPlaying ? 'opacity-50' : 'opacity-100'}`} />
                    
                    {/* Play button */}
                    {isFocused && !isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                          <Play size={28} className="text-white ml-1" fill="white" />
                        </div>
                      </div>
                    )}

                    {/* Pause indicator */}
                    {isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                          <Pause size={28} className="text-white" fill="white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Labels */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[9px] font-bold text-white uppercase tracking-wider">
                          {ad.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white font-display">
                        {ad.title}
                      </h3>
                    </div>

                    {/* Playing indicator */}
                    {isPlaying && (
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse" />
                          <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse delay-75" />
                          <span className="w-1 h-2 bg-red-500 rounded-full animate-pulse delay-150" />
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {VIDEO_ADS.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                stopAllVideos();
                setFocusedIndex(index);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === focusedIndex 
                  ? 'w-10 bg-gradient-to-r from-cyan-400 to-purple-400' 
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
