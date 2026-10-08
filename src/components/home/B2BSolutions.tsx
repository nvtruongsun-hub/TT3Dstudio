'use client';

import React from 'react';
import { Coffee, Building2, Palette, Tag, Check, MessageSquare, PhoneCall, Sparkles } from 'lucide-react';

export const B2BSolutions: React.FC = () => {
  const features = [
    {
      icon: Tag,
      title: 'Khắc Logo & Tên Quán Theo Nhận Diện',
      desc: 'Khắc laser chìm hoặc đúc in nổi 3D logo thương hiệu sắc sảo trực tiếp lên bề mặt đế.',
    },
    {
      icon: Palette,
      title: 'Phối Màu Theo Tone Quán (Nordic, Rustic, Dark Modern)',
      desc: 'Hơn 20 mã màu filament cao cấp: Giả gỗ Walnut, Cam gốm Terracotta, Trắng sứ mờ, Xanh rêu.',
    },
    {
      icon: Coffee,
      title: 'Cài Đặt Sẵn WiFi & Menu Điện Tử',
      desc: 'Xưởng nạp sẵn dữ liệu mạng và liên kết Fanpage/Menu. Nhận hàng chỉ việc đặt lên bàn phục vụ.',
    },
    {
      icon: Building2,
      title: 'Chiết Khấu Số Lượng & Hỗ Trợ Đổi Trả',
      desc: 'Chiết khấu 10% từ 5 chiếc, 20% từ 20 chiếc. Tặng kèm thẻ master dự phòng và hướng dẫn ghi đè.',
    },
  ];

  return (
    <section id="b2b-solutions" className="py-16 sm:py-24 bg-cream-200/60 border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: B2B Proposition & Benefits */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta-50 text-terracotta-600 text-xs font-bold uppercase tracking-wider mb-4 border border-terracotta-100">
              <Sparkles className="w-4 h-4" />
              <span>Giải Pháp Cho Quán Cà Phê, Homestay & Khách Sạn</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight leading-tight mb-4">
              Nâng tầm trải nghiệm bàn đón khách với phụ kiện 3D định danh thương hiệu
            </h2>

            <p className="text-sm sm:text-base text-charcoal-500 leading-relaxed mb-8">
              Thay thế những tờ giấy in mật khẩu WiFi nhàu nát hay chân mica ọp ẹp bằng đế gỗ/nhựa 3D sang trọng. Khách chỉ cần chạm nhẹ là có mạng và xem menu, nhân viên không còn bị ngắt quãng công việc.
            </p>

            {/* Feature matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white border border-cream-300 shadow-warm-sm flex items-start gap-3.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-cream-100 text-terracotta-600 flex items-center justify-center shrink-0 border border-cream-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-charcoal-900 leading-snug">
                        {f.title}
                      </h4>
                      <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* B2B CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <a
                href="https://zalo.me/0986888333"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-700 text-white font-semibold text-sm shadow-warm-md transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Nhận mẫu thử hoặc tư vấn cho quán (Zalo)</span>
              </a>

              <a
                href="tel:0986888333"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-cream-100 text-charcoal-800 font-semibold text-sm border border-cream-300 shadow-warm-sm transition-all"
              >
                <PhoneCall className="w-4 h-4 text-terracotta-600" />
                <span>Hotline: 0986.888.333</span>
              </a>
            </div>

          </div>

          {/* Right Column: Visual Case Setup / Cafe Counter Mockup */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white p-4 border border-cream-300 shadow-warm-lg">
              
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-cream-200 mb-4">
                <img
                  src="/assets/images/product-nfc-card.jpg"
                  alt="Thực tế đế WiFi NFC tại quầy thu ngân quán cafe"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 via-transparent to-transparent pointer-events-none" />

                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-white/95 backdrop-blur-sm border border-cream-300 shadow-warm-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-charcoal-900 block">
                      Bộ 10 Đế NFC Khắc Logo Quán
                    </span>
                    <span className="text-[11px] text-charcoal-500">
                      Giao mẫu thiết kế duyệt trước 3D trong 3 giờ
                    </span>
                  </div>
                  <span className="text-xs font-bold text-success-700 bg-success-50 px-2.5 py-1 rounded-md border border-success-100">
                    -15% Chiết khấu
                  </span>
                </div>
              </div>

              {/* Volume discount tiers */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-charcoal-700 uppercase tracking-wide px-1">
                  Bảng chiết khấu số lượng:
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-cream-100 border border-cream-300">
                    <span className="text-xs text-charcoal-500 block">5 - 10 cái</span>
                    <span className="text-sm font-extrabold text-terracotta-600">Giảm 10%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-cream-100 border border-cream-300">
                    <span className="text-xs text-charcoal-500 block">11 - 30 cái</span>
                    <span className="text-sm font-extrabold text-terracotta-600">Giảm 18%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-cream-100 border border-cream-300">
                    <span className="text-xs text-charcoal-500 block">&gt; 30 cái</span>
                    <span className="text-sm font-extrabold text-terracotta-600">Giảm 25%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
