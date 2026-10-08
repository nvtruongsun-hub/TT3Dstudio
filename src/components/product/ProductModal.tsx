'use client';

import React, { useState } from 'react';
import { X, Box, ShoppingBag, Check, ShieldCheck, Clock, Wifi, HelpCircle, Sparkles } from 'lucide-react';
import { Product, ColorVariant, MaterialVariant } from '../../types';
import { useStore } from '../../context/StoreContext';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart, open3DViewer } = useStore();

  const [selectedColor, setSelectedColor] = useState<ColorVariant | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialVariant | null>(null);
  const [customText, setCustomText] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Sync default selection when product opens
  React.useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || null);
      setSelectedMaterial(product.materials[0] || null);
      setCustomText('');
      setQuantity(1);
      setActiveImageIndex(0);
    }
  }, [product]);

  if (!isOpen || !product || !selectedColor || !selectedMaterial) return null;

  const currentPrice = product.basePrice + selectedMaterial.priceModifier;
  const totalPrice = currentPrice * quantity;

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedMaterial, quantity, customText);
    onClose();
  };

  const handleOpen3D = () => {
    open3DViewer(product);
  };

  const galleryImages = [
    product.images.hero,
    ...product.images.lifestyle,
    product.images.macroDetail,
  ].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal-900/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-cream-300 shadow-warm-xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header Strip */}
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between bg-cream-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
              Chi Tiết Sản Phẩm
            </span>
            {product.hasNfc && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-tech-600 bg-tech-100 px-2 py-0.5 rounded-full border border-tech-200">
                <Wifi className="w-3 h-3" />
                NFC 1-Chạm
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-800 hover:bg-cream-200 transition-colors"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="overflow-y-auto p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column: Image Gallery & 3D Viewer Trigger */}
          <div className="md:col-span-6 flex flex-col gap-4">
            
            {/* Main Active Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-cream-100 border border-cream-300">
              <img
                src={galleryImages[activeImageIndex] || product.images.hero}
                alt={product.title}
                className="w-full h-full object-cover"
              />

              {/* Supportive 3D Viewer Button */}
              {product.has3DModel && (
                <button
                  type="button"
                  onClick={handleOpen3D}
                  className="absolute bottom-3 right-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/95 hover:bg-white text-charcoal-900 text-xs font-bold shadow-warm-md border border-cream-300 transition-all hover:scale-105 active:scale-95"
                >
                  <Box className="w-4 h-4 text-tech-500" />
                  <span>Xem dạng 3D (360°)</span>
                </button>
              )}
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-terracotta-500 scale-105'
                      : 'border-cream-300 hover:opacity-80'
                  }`}
                >
                  <img src={img} alt="Ảnh nhỏ" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Specifications Box */}
            <div className="mt-2 p-4 rounded-2xl bg-cream-100 border border-cream-300 text-xs space-y-2">
              <div className="font-bold text-charcoal-800 uppercase tracking-wide">
                Thông số kỹ thuật tiêu chuẩn:
              </div>
              <div className="grid grid-cols-2 gap-2 text-charcoal-600">
                <div><span className="font-semibold text-charcoal-800">Kích thước:</span> {product.specifications.dimensions}</div>
                <div><span className="font-semibold text-charcoal-800">Trọng lượng:</span> {product.specifications.weight}</div>
                <div><span className="font-semibold text-charcoal-800">Lớp in:</span> {product.specifications.layerResolution}</div>
                <div><span className="font-semibold text-charcoal-800">Bảo hành:</span> {product.specifications.warrantyMonths} tháng</div>
              </div>
              {product.specifications.nfcSpecs && (
                <div className="pt-2 border-t border-cream-200 text-charcoal-600">
                  <span className="font-semibold text-charcoal-800">Chuẩn NFC:</span> {product.specifications.nfcSpecs.chipType} ({product.specifications.nfcSpecs.compatibility})
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Pricing, Options & Actions */}
          <div className="md:col-span-6 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Title & Headline Benefit */}
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 leading-tight mb-2">
                  {product.title}
                </h2>
                <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed">
                  {product.subtitle}
                </p>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 p-3.5 rounded-xl bg-cream-100 border border-cream-300">
                <span className="text-2xl font-extrabold text-terracotta-600">
                  {formatVnd(currentPrice)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-charcoal-400 line-through">
                    {formatVnd(product.originalPrice)}
                  </span>
                )}
                <span className="ml-auto text-xs font-semibold text-success-700 bg-success-50 px-2 py-0.5 rounded border border-success-100">
                  {product.stockStatus === 'in_stock' ? 'Có sẵn giao ngay' : 'In theo yêu cầu 24h'}
                </span>
              </div>

              {/* 1. Color Variant Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-2">
                  1. Chọn màu sắc: <span className="text-terracotta-600 normal-case">{selectedColor.name}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                        selectedColor.id === c.id
                          ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-900 ring-1 ring-terracotta-500'
                          : 'border-cream-300 bg-white text-charcoal-700 hover:bg-cream-100'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Material Variant Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-2">
                  2. Chọn vật liệu in:
                </label>
                <div className="space-y-2">
                  {product.materials.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMaterial(m)}
                      className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between ${
                        selectedMaterial.id === m.id
                          ? 'border-charcoal-900 bg-charcoal-900 text-white'
                          : 'border-cream-300 bg-white text-charcoal-800 hover:bg-cream-100'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{m.label}</div>
                        <div className={`text-[11px] ${selectedMaterial.id === m.id ? 'text-charcoal-300' : 'text-charcoal-500'}`}>
                          {m.description}
                        </div>
                      </div>
                      {m.priceModifier > 0 && (
                        <span className={`text-xs font-mono font-bold shrink-0 ml-2 ${selectedMaterial.id === m.id ? 'text-amber-300' : 'text-terracotta-600'}`}>
                          +{formatVnd(m.priceModifier)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Customization Input (NFC / Engraving) */}
              {product.customizationOptions?.supportsCustomText && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5 flex items-center justify-between">
                    <span>3. Thông tin khắc tên / Cài WiFi (Tùy chọn)</span>
                    <span className="text-[11px] text-charcoal-400 font-normal">
                      Tối đa {product.customizationOptions.characterLimit || 30} ký tự
                    </span>
                  </label>
                  <input
                    type="text"
                    maxLength={product.customizationOptions.characterLimit || 30}
                    placeholder="VD: Quán Mộc Yên • WiFi: Mocyen2026 / 12345678"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-charcoal-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                  />
                  <p className="text-[11px] text-charcoal-400 mt-1">
                    Kỹ thuật viên T&T sẽ gọi điện/Zalo xác nhận maket thiết kế trước khi đưa máy in chạy.
                  </p>
                </div>
              )}

              {/* Quantity selector */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wide">
                  Số lượng:
                </span>
                <div className="flex items-center border border-cream-300 rounded-xl bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-charcoal-600 hover:bg-cream-100 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-charcoal-900 font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-charcoal-600 hover:bg-cream-100 text-sm font-bold"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-charcoal-500">
                  (Tổng: <strong className="text-terracotta-600 font-bold">{formatVnd(totalPrice)}</strong>)
                </span>
              </div>

            </div>

            {/* Bottom Add to Cart Action */}
            <div className="pt-6 mt-6 border-t border-cream-200 flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 inline-flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-700 text-white font-bold text-sm shadow-warm-md hover:shadow-warm-lg transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Thêm vào giỏ hàng • {formatVnd(totalPrice)}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
