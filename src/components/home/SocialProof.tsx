'use client';

import React from 'react';
import { Star, CheckCircle, Quote, ThumbsUp, Camera } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../../data/siteData';

export const SocialProof: React.FC = () => {
  const setups = [
    {
      title: 'Quầy Order Quán Cafe Acoustic Mộc Yên',
      location: 'Hà Nội',
      image: '/assets/images/product-nfc-wifi.jpg',
      tag: '15 Đế Gỗ NFC TapConnect',
    },
    {
      title: 'Góc Bàn Làm Việc Minimalist WFH',
      location: 'Cầu Giấy, HN',
      image: '/assets/images/product-desk-dock.jpg',
      tag: 'Dock MagSafe & Bảng Pegboard',
    },
    {
      title: 'Phòng Ngủ Căn Hộ Scandinavian',
      location: 'Quận 2, TP.HCM',
      image: '/assets/images/product-soft-serve-lamp.jpg',
      tag: 'Đèn Ngủ Swirl & Lọ Hoa Gấp Nếp',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-cream-50 border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200 border border-cream-300 text-charcoal-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-warm-sm">
            <ThumbsUp className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Phản Hồi Thực Tế • Trải Nghiệm Khách Hàng</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
            Hiện diện trong không gian làm việc & quán cafe
          </h2>
          <p className="text-sm sm:text-base text-charcoal-500 mt-2 leading-relaxed">
            Hơn 350+ quán cà phê, homestay và cá nhân đam mê setup bàn làm việc đã tin dùng sản phẩm của T&T 3D Studio.
          </p>
        </div>

        {/* UGC Setup Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {setups.map((setup, i) => (
            <div
              key={i}
              className="group relative rounded-2xl overflow-hidden bg-white border border-cream-300 shadow-warm-sm hover:shadow-warm-md transition-all"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
                <img
                  src={setup.image}
                  alt={setup.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-charcoal-800 text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 border border-cream-300">
                  <Camera className="w-3 h-3 text-terracotta-500" />
                  <span>Ảnh thực tế khách gửi</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xs font-bold leading-tight drop-shadow-sm">
                    {setup.title}
                  </div>
                  <div className="text-[11px] text-cream-200 mt-0.5 flex items-center justify-between">
                    <span>{setup.location}</span>
                    <span className="text-tech-400 font-medium">{setup.tag}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Verified Text Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS_DATA.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-2xl bg-white border border-cream-300 shadow-warm-sm flex flex-col justify-between"
            >
              <div>
                {/* Rating stars & verified badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success-700 bg-success-50 px-2 py-0.5 rounded-full border border-success-100">
                    <CheckCircle className="w-3 h-3" />
                    Đã mua hàng
                  </span>
                </div>

                {/* Review Content */}
                <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed italic mb-4">
                  "{rev.content}"
                </p>
              </div>

              {/* Author & Product Info */}
              <div className="pt-3 border-t border-cream-200">
                <div className="text-xs font-bold text-charcoal-900">
                  {rev.customerName}
                </div>
                <div className="text-[11px] text-charcoal-500">
                  {rev.roleOrLocation}
                </div>
                <div className="text-[11px] text-terracotta-600 font-medium mt-1 truncate">
                  Đã mua: {rev.productName}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
