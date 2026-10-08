'use client';

import React from 'react';
import { Cog, CheckCircle2, HeartHandshake, Package, Printer, Sparkles } from 'lucide-react';

export const WorkshopStory: React.FC = () => {
  const steps = [
    {
      num: '01',
      icon: Printer,
      title: 'Hệ Thống Máy In Bambu Lab 24/7',
      desc: 'Dàn máy in thế hệ mới với đầu phun thép tôi cứng (Hardened Steel) và hệ thống bù rung tự động, đảm bảo từng đường kính 0.4mm đùn đều đặn không sót lớp.',
      image: '/assets/images/hero-printer.jpg',
    },
    {
      num: '02',
      icon: Cog,
      title: 'Hậu Kỳ Thủ Công & Xử Lý Bề Mặt',
      desc: 'Tháo support thủ công bằng kìm chuyên dụng, thổi cát làm mờ mịn các mối tiếp giáp, đảm bảo cầm nắm êm tay và thẩm mỹ tối đa khi đặt trên bàn.',
      image: '/assets/images/product-desk-dock.jpg',
    },
    {
      num: '03',
      icon: CheckCircle2,
      title: 'Đúc Chip NFC & Kiểm Thử Từng Chiếc',
      desc: 'Mỗi đế NFC đều được kỹ thuật viên dùng máy quét iPhone & Android đọc thử trước khi xuất xưởng, cam kết 100% chạm là nhận sóng mượt mà.',
      image: '/assets/images/product-nfc-wifi.jpg',
    },
    {
      num: '04',
      icon: Package,
      title: 'Đóng Gói Chống Va Đập Thân Thiện',
      desc: 'Hộp carton cứng cáp cùng xốp định hình tái chế giúp sản phẩm an toàn tuyệt đối khi gửi bưu tá liên tỉnh, sẵn sàng làm quà tặng trang trọng.',
      image: '/assets/images/product-monogram.jpg',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-cream-100 border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200 border border-cream-300 text-charcoal-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-warm-sm">
            <HeartHandshake className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Minh Bạch Quy Trình • Made in Vietnam</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
            Câu chuyện từ xưởng in T&T 3D Studio
          </h2>
          <p className="text-sm sm:text-base text-charcoal-500 mt-2 leading-relaxed">
            Chúng tôi không nhập hàng thương mại đại trà. Từng chiếc đế, chiếc đèn hay bình hoa đều bắt đầu từ bản vẽ thiết kế CAD và thành hình qua quy trình chuẩn hóa nghiêm ngặt tại Hà Nội.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="flex flex-col rounded-2xl bg-white border border-cream-300 shadow-warm-sm hover:shadow-warm-md transition-all duration-300 overflow-hidden group"
              >
                <div className="relative aspect-[16/11] overflow-hidden bg-cream-200">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-charcoal-900/80 backdrop-blur-sm text-white font-mono text-xs font-bold">
                    {s.num}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="w-8 h-8 rounded-lg bg-terracotta-50 text-terracotta-600 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-charcoal-900 leading-snug mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-charcoal-500 leading-relaxed flex-1">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
