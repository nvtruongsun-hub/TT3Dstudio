'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, UploadCloud, CheckCircle2, Sparkles, Compass } from 'lucide-react';
import { TrustBadges } from './TrustBadges';
import { useStore } from '../../context/StoreContext';

export const HeroSection: React.FC = () => {
  const { setIsQuoteModalOpen } = useStore();

  const handleScrollToProducts = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById('featured-products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToQuote = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById('quote-service');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 bg-cream-100 overflow-hidden border-b border-cream-300">
      {/* Subtle organic ambient background texture */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#C85A32_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_30%,#000_70%,transparent_100%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Two-Path Decision Architecture */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Studio Tag & Tech Accent Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-200 border border-cream-300 shadow-warm-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase text-charcoal-700">
                T&T 3D Studio • Xưởng In & Thiết Kế Hà Nội
              </span>
              <span className="hidden sm:inline-block text-xs font-medium text-tech-600 bg-tech-100 px-2 py-0.5 rounded-full border border-tech-200">
                NFC 1-Chạm
              </span>
            </div>

            {/* Strict Primary Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-charcoal-900 tracking-tight leading-[1.18] mb-6">
              Đồ decor và phụ kiện 3D <br className="hidden sm:inline" />
              <span className="text-terracotta-500">thiết kế cho không gian</span> của bạn
            </h1>

            {/* Strict Subheadline */}
            <p className="text-base sm:text-lg text-charcoal-500 leading-relaxed max-w-2xl mb-8">
              Từ đế WiFi NFC cho quán đến đèn, bình hoa và phụ kiện bàn làm việc — thiết kế tại T&T, có thể cá nhân hóa theo nhu cầu.
            </p>

            {/* Two-Path Decision CTAs (Direct Catalog vs Custom Print Inquiry) */}
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10">
              
              {/* Primary CTA: Direct Catalog */}
              <a
                href="#featured-products"
                onClick={handleScrollToProducts}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-700 text-white font-semibold text-sm sm:text-base shadow-warm-md hover:shadow-warm-lg transition-all duration-200 active:scale-[0.98] min-h-[48px]"
              >
                <span>Khám phá sản phẩm</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              {/* Secondary CTA: Custom Design & File Quote */}
              <a
                href="#quote-service"
                onClick={handleScrollToQuote}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-cream-200 text-charcoal-800 font-semibold text-sm sm:text-base border border-cream-300 shadow-warm-sm transition-all duration-200 active:scale-[0.98] min-h-[48px]"
              >
                <UploadCloud className="w-4 h-4 text-terracotta-600" />
                <span>Đặt thiết kế / Gửi file in</span>
              </a>
            </div>

            {/* Trust Signals Strip (3 Badges) */}
            <div className="w-full">
              <TrustBadges variant="strip" />
            </div>

          </div>

          {/* Right Column: High-quality hero lifestyle photograph of products in context */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative card frame */}
              <div className="relative rounded-3xl overflow-hidden bg-white p-3 shadow-warm-xl border border-cream-300">
                
                {/* Main Hero Lifestyle Image */}
                <div className="relative aspect-[4/5] sm:aspect-[1/1] lg:aspect-[4/5] rounded-2xl overflow-hidden bg-cream-200">
                  <img
                    src="/assets/images/product-nfc-wifi.jpg"
                    alt="Đế NFC TapConnect và đồ decor 3D trong không gian quán cafe"
                    className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                    loading="eager"
                  />
                  
                  {/* Subtle Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent pointer-events-none" />

                  {/* Overlaid Context Floating Pill */}
                  <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-cream-300 shadow-warm-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-tech-100 text-tech-600 flex items-center justify-center shrink-0 border border-tech-200">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-charcoal-900">
                          Đế NFC TapConnect™
                        </div>
                        <div className="text-[11px] text-charcoal-500">
                          Khách chạm kết nối WiFi & Menu tức thì
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-terracotta-600 bg-terracotta-50 px-2 py-1 rounded-md border border-terracotta-200">
                      Từ 109.000₫
                    </span>
                  </div>

                  {/* Top-Right Badge: Studio Quality Tag */}
                  <div className="absolute top-4 right-4 bg-charcoal-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border border-white/20">
                    <CheckCircle2 className="w-3.5 h-3.5 text-tech-400" />
                    <span>Ảnh chụp thật tại Studio</span>
                  </div>

                </div>

              </div>

              {/* Decorative Subtle Shadow Behind */}
              <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-terracotta-200/50 rounded-full blur-3xl -z-10 pointer-events-none" />

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
