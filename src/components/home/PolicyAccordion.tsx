'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Truck, RotateCcw, Lock } from 'lucide-react';
import { FAQ_DATA } from '../../data/siteData';

export const PolicyAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const policyPillars = [
    {
      icon: Truck,
      title: 'Giao hàng hỏa tốc & toàn quốc',
      desc: 'Nội thành Hà Nội nhận trong ngày. Các tỉnh khác 2-3 ngày bưu cục GHTK/ViettelPost.',
    },
    {
      icon: RotateCcw,
      title: 'Đổi mới 1-đổi-1 trong 7 ngày',
      desc: 'Nếu có lỗi cong vênh, rò rỉ nước hoặc chip NFC không nhận do sản xuất.',
    },
    {
      icon: ShieldCheck,
      title: 'Bảo hành kết cấu 12 tháng',
      desc: 'Cam kết độ bền vật liệu nhựa sinh học PLA+ và chip NFC NTAG215 tiêu chuẩn.',
    },
    {
      icon: Lock,
      title: 'Bảo mật tuyệt đối file CAD 3D',
      desc: 'Không thương mại hóa hoặc chia sẻ thiết kế của khách hàng cho bên thứ ba.',
    },
  ];

  return (
    <section id="faq-policies" className="py-16 sm:py-24 bg-cream-100 border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200 border border-cream-300 text-charcoal-700 text-xs font-bold uppercase tracking-wider mb-3 shadow-warm-sm">
            <HelpCircle className="w-3.5 h-3.5 text-terracotta-500" />
            <span>Chính Sách & Giải Đáp Thắc Mắc</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
            Câu hỏi thường gặp & Cam kết dịch vụ
          </h2>
          <p className="text-sm sm:text-base text-charcoal-500 mt-2 leading-relaxed">
            Mọi thông tin về độ tương thích điện thoại, quy trình bảo hành và thời gian nhận hàng đều được minh bạch trước khi bạn đặt mua.
          </p>
        </div>

        {/* 4 Policy Quick Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {policyPillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-2xl bg-white border border-cream-300 shadow-warm-sm flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center shrink-0 border border-terracotta-100">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-charcoal-900 leading-snug">
                    {p.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-charcoal-500 mt-0.5 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Accordion List */}
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-cream-300 overflow-hidden shadow-warm-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-cream-50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-charcoal-900">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-cream-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-terracotta-50 text-terracotta-600' : 'text-charcoal-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-charcoal-600 leading-relaxed border-t border-cream-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
