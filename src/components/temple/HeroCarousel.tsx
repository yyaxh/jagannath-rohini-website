import { useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Link } from 'react-router-dom';
import { useSiteContent, type HeroSlide } from '@/lib/siteContent';

export default function HeroCarousel() {
  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const slides = useSiteContent<HeroSlide[]>('hero_slides');

  return (
    <section>
      <div className="relative" role="region" aria-roledescription="carousel" aria-label="Temple highlights">
        <Carousel opts={{ loop: true }} plugins={[autoplay.current]}>
          <CarouselContent>
            {slides.map((slide) =>
            <CarouselItem key={slide.id}>
                <div className="relative w-full" style={{ height: '520px' }}>
                  <img
                  src={slide.image}
                  alt={'headline' in slide && slide.headline ? slide.headline : `Temple slide ${slide.id}`}
                  className="w-full h-full object-cover"
                  loading={slide.id === 1 ? 'eager' : 'lazy'}
                  fetchPriority={slide.id === 1 ? 'high' : 'auto'} />
                
                  {'headline' in slide && slide.headline &&
                <>
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent pointer-events-none" />
                      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 pointer-events-none">
                        <div className="max-w-xl pointer-events-auto">
                          {slide.id === 1 ?
                      <p
                        className="text-white font-bold mb-3 leading-tight"
                        style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(22px, 4vw, 42px)' }}>
                        
                              {slide.headline}
                            </p> :

                      <p
                        className="text-white font-bold mb-3 leading-tight"
                        style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(22px, 4vw, 42px)' }}>
                        
                              {slide.headline}
                            </p>
                      }
                          {slide.subtext &&
                      <p className="text-primary text-base md:text-lg mb-2">{slide.subtext}</p>
                      }
                          {'location' in slide && slide.location &&
                      <p className="text-white font-semibold text-sm mb-4">{slide.location}</p>
                      }
                          {slide.cta &&
                      <Link
                        to={slide.cta.href}
                        className="inline-block bg-primary text-primary-foreground font-bold px-6 py-2 rounded transition hover:bg-primary/90">
                        
                              {slide.cta.label}
                            </Link>
                      }
                        </div>
                      </div>
                    </>
                }
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious className="left-4 text-white border-white/50 bg-black/40 hover:bg-primary hover:border-primary" />
          <CarouselNext className="right-4 text-white border-white/50 bg-black/40 hover:bg-primary hover:border-primary" />
        </Carousel>
      </div>

      {/* Booking tiles */}
      <div className="bg-primary py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-4 px-4">
          <Link
            to="/prasad-booking"
            className="flex items-center gap-3 bg-background rounded-lg px-6 py-3 shadow smooth-card">
            
            <img
              src="/airo-assets/images/components/annaprasad-booking-tile.png"
              alt="Annaprasad Booking"
              className="h-12 w-auto object-contain"
              loading="lazy" />
            
          </Link>
          <Link
            to="/rituals"
            className="flex items-center gap-3 bg-background rounded-lg px-6 py-3 shadow smooth-card">
            
            <img
              src="/airo-assets/images/components/temple-herocarousel/rituals-booking.png"
              alt="Rituals Booking"
              className="h-12 w-auto object-contain"
              loading="lazy" />
            
          </Link>
        </div>
      </div>
    </section>);

}