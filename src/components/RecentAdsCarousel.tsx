import { useRef, useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { RECENT_ADS } from '@/data/constants';

export function RecentAdsCarousel() {
  const [focusedAdIndex, setFocusedAdIndex] = useState(1);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            videoRefs.current.forEach(v => v?.pause());
          } else {
            videoRefs.current[focusedAdIndex]?.play().catch(() => {});
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [focusedAdIndex]);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (i === focusedAdIndex) {
        v?.play().catch(() => {});
      } else {
        v?.pause();
        if (v) v.currentTime = 0;
      }
    });
  }, [focusedAdIndex]);

  return (
    <section ref={sectionRef} className="py-24 px-6 relative overflow-hidden bg-card">
      <div className="max-w-[1200px] mx-auto space-y-16">
        <div className="relative h-[500px] lg:h-[650px] w-full flex items-center justify-center">
          <div className="relative w-full max-w-4xl h-full flex items-center justify-center perspective-1000">
            {RECENT_ADS.map((ad, index) => {
              const isFocused = index === focusedAdIndex;
              const offset = index - focusedAdIndex;
              const zIndex = isFocused ? 30 : 20 - Math.abs(offset);
              const scale = isFocused ? 1 : 0.85;
              const translateX = offset * 240;
              const rotateY = offset * -15;
              const opacity = Math.abs(offset) > 1 ? 0 : 1;

              return (
                <div
                  key={ad.id}
                  onClick={() => setFocusedAdIndex(index)}
                  className="absolute transition-all duration-700 ease-out cursor-pointer group"
                  style={{
                    zIndex,
                    opacity,
                    transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                  }}
                >
                  <div className={`relative aspect-[9/16] h-[400px] lg:h-[550px] rounded-[32px] overflow-hidden border-8 border-card shadow-2xl transition-all duration-500 ${
                    !isFocused && 'grayscale-[0.5] blur-[1px] brightness-75'
                  }`}>
                    <video
                      ref={el => { videoRefs.current[index] = el; }}
                      src={ad.videoUrl}
                      poster={ad.thumbnail}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                    />
                    {!isFocused && (
                      <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full glass flex items-center justify-center border border-card/30 text-card shadow-xl">
                          <Play size={24} fill="currentColor" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
