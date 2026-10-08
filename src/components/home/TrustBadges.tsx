import React from 'react';
import { Sparkles, Truck, HeadphonesIcon, ShieldCheck } from 'lucide-react';

interface TrustBadgesProps {
  variant?: 'strip' | 'grid';
  className?: string;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({
  variant = 'strip',
  className = '',
}) => {
  const badges = [
    {
      icon: Sparkles,
      title: 'Tư vấn cá nhân hóa',
      subtitle: 'Khắc logo, tên & cài đặt sẵn WiFi/NFC',
    },
    {
      icon: Truck,
      title: 'Giao hàng toàn quốc',
      subtitle: 'Đóng gói chống sốc xốp định hình',
    },
    {
      icon: HeadphonesIcon,
      title: 'Hỗ trợ kỹ thuật trước & sau mua',
      subtitle: 'Hướng dẫn cài đặt & bảo hành 1 đổi 1',
    },
  ];

  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        {badges.map((b, i) => {
          const Icon = b.icon;
          return (
            <div
              key={i}
              className="flex items-start gap-3.5 p-4 rounded-xl bg-white/70 border border-cream-300 shadow-warm-sm backdrop-blur-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-terracotta-50 text-terracotta-600 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-charcoal-900 leading-snug">
                  {b.title}
                </h4>
                <p className="text-xs text-charcoal-500 mt-0.5 leading-relaxed">
                  {b.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-y-4 gap-x-6 py-4 px-5 rounded-2xl bg-cream-200/80 border border-cream-300 ${className}`}
    >
      {badges.map((b, i) => {
        const Icon = b.icon;
        return (
          <div key={i} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white text-terracotta-500 flex items-center justify-center shadow-warm-sm shrink-0 border border-cream-300">
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-charcoal-900 block leading-tight">
                {b.title}
              </span>
              <span className="text-[11px] text-charcoal-500 hidden sm:block">
                {b.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
