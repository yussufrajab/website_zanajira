"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/types";
import { getLocalizedField } from "@/lib/directus";
import { Locale } from "@/lib/directus";

type Props = {
  slides: HeroSlide[];
  locale: Locale;
};

export function HeroSlider({ slides, locale }: Props) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden bg-primary-dark">
      <div className="relative h-[300px] md:h-[450px] lg:h-[500px]">
        {slide.image && (
          <Image
            src={slide.image}
            alt={getLocalizedField(slide, "title", locale)}
            fill
            className="object-cover"
            priority={current === 0}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold mb-2">
              {getLocalizedField(slide, "title", locale)}
            </h2>
            {slide.subtitle_sw && (
              <p className="text-lg md:text-xl opacity-90">
                {getLocalizedField(slide, "subtitle", locale)}
              </p>
            )}
            {slide.link_url && (
              <a
                href={slide.link_url}
                className="inline-block mt-4 px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors"
              >
                Learn More
              </a>
            )}
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === current ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}