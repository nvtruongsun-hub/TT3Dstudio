import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '../context/StoreContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const metadata: Metadata = {
  title: 'T&T 3D Studio | Đồ Decor & Phụ Kiện 3D Thiết Kế Thông Minh',
  description:
    'T&T 3D Studio - Thiết kế & sản xuất đế WiFi NFC cho quán cafe, homestay, đèn ngủ decor Scandinavian, lọ hoa sinh học và dịch vụ in 3D theo yêu cầu tại Hà Nội.',
  keywords: [
    'T&T 3D Studio',
    'đế wifi nfc',
    'đế nfc quán cafe',
    'đồ decor in 3d',
    'in 3d theo yêu cầu hà nội',
    'bình hoa origami pla',
    'đèn ngủ 3d',
    'desk setup',
  ],
  authors: [{ name: 'T&T 3D Studio' }],
  icons: {
    icon: '/assets/images/favicon.svg',
    shortcut: '/assets/images/favicon.png',
  },
  openGraph: {
    title: 'T&T 3D Studio - Đồ Decor & Phụ Kiện 3D Thiết Kế Cho Không Gian Của Bạn',
    description:
      'Từ đế WiFi NFC cho quán đến đèn, bình hoa và phụ kiện bàn làm việc — thiết kế tại T&T, có thể cá nhân hóa theo nhu cầu.',
    url: 'https://tt3dstudio.vn',
    siteName: 'T&T 3D Studio',
    images: [
      {
        url: '/assets/images/product-nfc-wifi.jpg',
        width: 1200,
        height: 630,
        alt: 'T&T 3D Studio Lifestyle Products',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-cream-100 text-charcoal-900">
        <StoreProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
