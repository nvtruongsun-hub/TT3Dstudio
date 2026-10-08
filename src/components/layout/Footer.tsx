import React from 'react';
import { Phone, Mail, MapPin, Clock, CreditCard, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-900 text-charcoal-200 pt-16 pb-12 border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          
          {/* Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta-500 text-white flex items-center justify-center font-bold font-mono text-base">
                T&T
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                T&amp;T 3D Studio
              </span>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-400 leading-relaxed">
              Xưởng thiết kế &amp; sản xuất đồ decor, phụ kiện thông minh NFC và sản phẩm cá nhân hóa bằng công nghệ in 3D FDM / Resin 8K tại Hà Nội.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-charcoal-400">
              <ShieldCheck className="w-4 h-4 text-tech-400" />
              <span>Chế tác độc bản • Bảo mật bản quyền file 3D</span>
            </div>
          </div>

          {/* Quick Contact & Workshop Info (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Thông Tin Liên Hệ &amp; Xưởng Sản Xuất
            </h4>

            <div className="flex items-start gap-3 text-xs sm:text-sm text-charcoal-300">
              <MapPin className="w-4 h-4 text-terracotta-400 shrink-0 mt-0.5" />
              <span>Số 175 Tây Sơn, P. Trung Liệt, Q. Đống Đa, Hà Nội</span>
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-charcoal-300">
              <Phone className="w-4 h-4 text-terracotta-400 shrink-0" />
              <div className="flex items-center gap-2">
                <a href="tel:0986888333" className="hover:text-white transition-colors">
                  0986.888.333
                </a>
                <span>•</span>
                <a
                  href="https://zalo.me/0986888333"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tech-400 hover:underline"
                >
                  Zalo Kỹ Thuật
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-charcoal-300">
              <Mail className="w-4 h-4 text-terracotta-400 shrink-0" />
              <a href="mailto:contact@tt3dstudio.vn" className="hover:text-white transition-colors">
                contact@tt3dstudio.vn
              </a>
            </div>

            <div className="flex items-center gap-3 text-xs text-charcoal-400">
              <Clock className="w-4 h-4 text-terracotta-400 shrink-0" />
              <span>Mở cửa: 08:00 - 21:00 (Hệ thống máy in chạy 24/7)</span>
            </div>
          </div>

          {/* Official Payment Disclaimer & Social Channels (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Tài Khoản Thanh Toán Xác Thực
            </h4>

            <div className="p-4 rounded-2xl bg-charcoal-800/80 border border-charcoal-700 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-charcoal-200 font-semibold">
                <CreditCard className="w-4 h-4 text-tech-400" />
                <span>MB Bank (Ngân hàng Quân Đội)</span>
              </div>
              <div className="text-charcoal-300">
                STK: <strong className="font-mono text-white text-sm">0349657529</strong>
              </div>
              <div className="text-charcoal-400">
                Chủ tài khoản: <strong className="text-charcoal-200">NGUYEN VAN TRUONG</strong>
              </div>
              <p className="text-[10px] text-charcoal-400 leading-tight pt-1">
                * Quý khách vui lòng chỉ thanh toán chuyển khoản vào số tài khoản duy nhất của chủ xưởng nêu trên để tránh giả mạo.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://shopee.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-xs text-charcoal-200 transition-colors"
              >
                Shopee Shop
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-xs text-charcoal-200 transition-colors"
              >
                TikTok Shop
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-xs text-charcoal-200 transition-colors"
              >
                Fanpage Facebook
              </a>
            </div>

          </div>

        </div>

        {/* Copyright and Bottom Disclaimers */}
        <div className="pt-8 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-400">
          <div>
            &copy; {new Date().getFullYear()} T&amp;T 3D Studio. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#faq-policies" className="hover:text-charcoal-200 transition-colors">
              Chính sách giao hàng
            </a>
            <span>•</span>
            <a href="#faq-policies" className="hover:text-charcoal-200 transition-colors">
              Chính sách bảo hành 12 tháng
            </a>
            <span>•</span>
            <a href="#quote-service" className="hover:text-charcoal-200 transition-colors">
              Bảo mật file 3D
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
