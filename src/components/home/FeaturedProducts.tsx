'use client';

import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { FEATURED_PRODUCTS } from '../../data/siteData';
import { Sparkles, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const FeaturedProducts: React.FC = () => {
  const { openProductModal } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Tất cả sản phẩm chủ lực' },
    { id: 'smart-nfc', label: 'Thông minh NFC' },
    { id: 'decor-lighting', label: 'Đèn & Bình hoa Decor' },
    { id: 'desk-organizer', label: 'Phụ kiện Desk Setup' },
  ];

  const filteredProducts =
    selectedCategory === 'all'
      ? FEATURED_PRODUCTS
      : FEATURED_PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <section id="featured-products" className="py-16 sm:py-24 bg-cream-50 border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta-50 text-terracotta-600 text-xs font-bold uppercase tracking-wider mb-3 border border-terracotta-100">
              <Flame className="w-3.5 h-3.5" />
              <span>Sản Phẩm Chủ Lực • Sản Xuất Thật Tại Xưởng</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
              Thiết kế thực tế, hoàn thiện tinh xảo
            </h2>
            <p className="text-sm sm:text-base text-charcoal-500 mt-2 leading-relaxed">
              Các mẫu sản phẩm được đo lường chính xác, ứng dụng nhựa sinh học PLA+ và PETG chống rỉ nước. Có thể cá nhân hóa khắc logo hoặc tên quán.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-charcoal-900 text-white shadow-warm-sm'
                    : 'bg-white text-charcoal-600 hover:bg-cream-200 border border-cream-300'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Hero SKUs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => openProductModal(p)}
            />
          ))}
        </div>

        {/* Sub-strip: Guarantee & Custom request note */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-white border border-cream-300 shadow-warm-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-charcoal-900">
                Cần khắc logo quán hoặc đặt màu sắc thương hiệu riêng?
              </p>
              <p className="text-xs text-charcoal-500">
                T&T hỗ trợ thiết kế mẫu thử 3D và chiết khấu từ 10% đến 25% cho đơn từ 5 chiếc.
              </p>
            </div>
          </div>

          <a
            href="#b2b-solutions"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 hover:underline shrink-0"
          >
            <span>Xem giải pháp cho quán & Homestay</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
};
