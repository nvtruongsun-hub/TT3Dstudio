'use client';

import React, { useState } from 'react';
import { ShoppingBag, Menu, X, PhoneCall, Sparkles, MessageSquare } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Navbar: React.FC = () => {
  const { cartCount, setIsCartOpen } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-cream-300 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-charcoal-900 text-white flex items-center justify-center font-bold font-mono text-base shadow-warm-sm group-hover:bg-terracotta-500 transition-colors">
              T&T
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-charcoal-900 leading-none group-hover:text-terracotta-600 transition-colors">
                T&amp;T 3D Studio
              </span>
              <span className="text-[10px] tracking-wider uppercase text-charcoal-500 font-medium mt-1">
                Decor &amp; Smart 3D Living
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-semibold text-charcoal-700">
            <a
              href="#featured-products"
              className="hover:text-terracotta-600 transition-colors"
            >
              Sản phẩm
            </a>
            <a
              href="#b2b-solutions"
              className="hover:text-terracotta-600 transition-colors"
            >
              Giải pháp cho quán
            </a>
            <a
              href="#quote-service"
              className="hover:text-terracotta-600 transition-colors flex items-center gap-1.5"
            >
              <span>Báo giá in 3D</span>
              <span className="text-[10px] font-bold text-tech-600 bg-tech-100 px-1.5 py-0.2 rounded-md">
                2 Giờ
              </span>
            </a>
            <a
              href="#faq-policies"
              className="hover:text-terracotta-600 transition-colors"
            >
              Chính sách &amp; FAQ
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            
            {/* Cart Trigger Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-charcoal-800 border border-cream-300 transition-colors flex items-center justify-center"
              aria-label="Xem giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5 text-charcoal-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-terracotta-500 text-white text-[11px] font-bold flex items-center justify-center shadow-warm-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Quick Zalo Consultation Button */}
            <a
              href="https://zalo.me/0986888333"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-700 text-white font-semibold text-xs sm:text-sm shadow-warm-sm transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Zalo Tư Vấn</span>
            </a>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-cream-100 text-charcoal-800 border border-cream-300"
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cream-300 bg-white px-4 pt-3 pb-6 space-y-3 shadow-warm-lg animate-fadeIn">
          <a
            href="#featured-products"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-charcoal-800 hover:text-terracotta-600"
          >
            Sản phẩm chủ lực
          </a>
          <a
            href="#b2b-solutions"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-charcoal-800 hover:text-terracotta-600"
          >
            Giải pháp quán cafe &amp; Homestay
          </a>
          <a
            href="#quote-service"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-charcoal-800 hover:text-terracotta-600"
          >
            Gửi file in 3D &amp; Báo giá nhanh
          </a>
          <a
            href="#faq-policies"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-charcoal-800 hover:text-terracotta-600"
          >
            Chính sách bảo hành &amp; FAQ
          </a>
          <div className="pt-3 border-t border-cream-200">
            <a
              href="https://zalo.me/0986888333"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-terracotta-500 text-white font-bold text-sm shadow-warm-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Nhắn Zalo: 0986.888.333</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
