'use client';

import React from 'react';
import { Leaf, Wifi, Gauge, CheckCircle2, Award, Zap } from 'lucide-react';

export const ValueCraftsmanship: React.FC = () => {
  const pillars = [
    {
      step: '01',
      icon: Leaf,
      title: 'Vật liệu an toàn & bền vững',
      tagline: 'PLA sinh học nguyên sinh & PETG chịu nhiệt',
      description:
        'Nhựa PLA chiết xuất từ tinh bột ngô tự nhiên, không phát thải mùi nhựa độc hại khi trưng bày phòng ngủ. Bề mặt mờ mịn (Matte) cao cấp, kháng nước và chống bám vân tay.',
      badges: ['PLA Tinh Bột Ngô', 'PETG Chịu Nhiệt 75°C', 'Bề Mặt Silk-Matte'],
      image: '/assets/images/product-pleated-vase.jpg',
      stat: '100%',
      statLabel: 'Nhựa nguyên sinh an toàn',
    },
    {
      step: '02',
      icon: Wifi,
      title: 'Tích hợp NFC 1-chạm thông minh',
      tagline: 'Không cần cài app, chống nước, ghi đè linh hoạt',
      description:
        'Chip NTAG215 chuẩn ISO được đúc chìm nguyên khối chống ẩm nước tuyệt đối. Tương thích toàn bộ iPhone và Android. Khách chỉ cần chạm nhẹ là bắt WiFi hoặc mở Menu ngay lập tức.',
      badges: ['Chip NTAG215', 'Chống Nước Đúc Chìm', 'Ghi Đè Không Giới Hạn'],
      image: '/assets/images/product-nfc-wifi.jpg',
      stat: '< 1s',
      statLabel: 'Thời gian kết nối 1-chạm',
    },
    {
      step: '03',
      icon: Gauge,
      title: 'Độ chuẩn xác cơ khí & kiểm định',
      tagline: 'Độ dày lớp in siêu mịn (0.12 - 0.2mm)',
      description:
        'Vận hành trên dàn máy in Bambu Lab cao cấp thế hệ mới với hệ thống cân bàn tự động và cảm biến rung. Từng sản phẩm đều được xưởng kiểm tra độ khít, thử nghiệm quang học trước khi đóng gói.',
      badges: ['Độ mịn 0.12 - 0.20mm', 'Kiểm tra khớp nối 100%', 'Bảo hành 12 tháng'],
      image: '/assets/images/hero-printer.jpg',
      stat: '±0.05mm',
      statLabel: 'Dung sai lắp ghép cơ khí',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-cream-100 border-b border-cream-300 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-200 border border-cream-300 text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-3 shadow-warm-sm">
            <Award className="w-4 h-4 text-terracotta-500" />
            <span>Chất Lượng Thực Tế • Cam Kết Của Xưởng</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
            Tại sao khách hàng và quán cafe tin chọn T&T?
          </h2>
          <p className="text-sm sm:text-base text-charcoal-500 mt-3 leading-relaxed">
            Chúng tôi nói không với sản phẩm in 3D bề mặt thô ráp hay dùng chip NFC giá rẻ dễ hỏng. Mỗi sản phẩm được hoàn thiện như một tác phẩm thủ công chính xác.
          </p>
        </div>

        {/* 3 Pillars Grid with Macro / Visual Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex flex-col rounded-3xl bg-white border border-cream-300 shadow-warm-sm hover:shadow-warm-lg transition-all duration-300 overflow-hidden group"
              >
                {/* Pillar Visual / Macro Photograph */}
                <div className="relative aspect-[16/10] overflow-hidden bg-cream-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/50 via-transparent to-transparent pointer-events-none" />

                  {/* Step Pill */}
                  <span className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-charcoal-900/80 backdrop-blur-sm text-white text-xs font-bold font-mono">
                    {item.step}
                  </span>

                  {/* Stat Badge */}
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-sm border border-cream-300 shadow-warm-sm flex items-center gap-2">
                    <span className="text-sm font-extrabold text-terracotta-600">
                      {item.stat}
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-medium">
                      {item.statLabel}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center shrink-0 border border-terracotta-100">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-charcoal-900 leading-snug">
                        {item.title}
                      </h3>
                      <span className="text-xs font-medium text-terracotta-600">
                        {item.tagline}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed mb-6 flex-1">
                    {item.description}
                  </p>

                  {/* Feature Check Badges */}
                  <div className="pt-4 border-t border-cream-200 flex flex-wrap gap-1.5">
                    {item.badges.map((badge, bIdx) => (
                      <span
                        key={bIdx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cream-100 text-charcoal-700 text-[11px] font-medium border border-cream-300"
                      >
                        <CheckCircle2 className="w-3 h-3 text-terracotta-500" />
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
