'use client';

import React, { useState } from 'react';
import { Product, ColorVariant, MaterialVariant } from '../../types';
import { Eye, ShoppingBag, Wifi, Sparkles, Check, Clock3, Box } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { openProductModal, addToCart, open3DViewer } = useStore();
  const [selectedColor, setSelectedColor] = useState<ColorVariant>(product.colors[0]);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialVariant>(product.materials[0]);

  const currentPrice = product.basePrice + selectedMaterial.priceModifier;
  const isMadeToOrder = product.stockStatus === 'made_to_order_24h';

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleCardClick = () => {
    if (onQuickView) {
      onQuickView(product);
    } else {
      openProductModal(product);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedColor, selectedMaterial, 1);
  };

  const handle3DPreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    open3DViewer(product);
  };

  return (
    <article
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-2xl bg-white border border-cream-300 shadow-warm-sm hover:shadow-warm-lg transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Product Image Container (Consistent 1:1 Aspect Ratio) */}
      <div className="relative aspect-square w-full overflow-hidden bg-cream-200">
        <img
          src={product.images.hero}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges (Stock indicator & Brand Tag) */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Stock Indicator */}
          {isMadeToOrder ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-charcoal-900/80 backdrop-blur-sm text-cream-50 border border-white/10">
              <Clock3 className="w-3 h-3 text-amber-400" />
              Sản xuất 24h
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-success-50 text-success-700 border border-success-100">
              <span className="w-1.5 h-1.5 rounded-full bg-success-600" />
              Còn hàng
            </span>
          )}

          {/* NFC / Tech Tag (Subtle Cyan Accent) */}
          {product.hasNfc && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-tech-100 text-tech-600 border border-tech-200 shadow-sm">
              <Wifi className="w-3 h-3" />
              NFC 1-Chạm
            </span>
          )}
        </div>

        {/* Supportive 3D Preview Quick Trigger (Subtle, doesn't block layout) */}
        {product.has3DModel && (
          <button
            type="button"
            onClick={handle3DPreviewClick}
            title="Xem mô hình 3D xoay 360 độ"
            className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-charcoal-800 text-xs font-medium backdrop-blur-sm border border-cream-300 shadow-warm-sm transition-all hover:scale-105"
          >
            <Box className="w-3.5 h-3.5 text-tech-500" />
            <span>Xem 3D (360°)</span>
          </button>
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Color Variant Selector Pills */}
        <div className="flex items-center gap-1.5 mb-3" onClick={(e) => e.stopPropagation()}>
          <span className="text-[11px] text-charcoal-500 mr-1">Màu:</span>
          {product.colors.map((color) => (
            <button
              key={color.id}
              type="button"
              onClick={() => setSelectedColor(color)}
              aria-label={`Chọn màu ${color.name}`}
              className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
                selectedColor.id === color.id
                  ? 'ring-2 ring-terracotta-500 ring-offset-1 scale-110 border-white'
                  : 'border-cream-400 hover:scale-105'
              }`}
              style={{ backgroundColor: color.hex }}
            >
              {selectedColor.id === color.id && (
                <span className="sr-only">Đã chọn</span>
              )}
            </button>
          ))}
          <span className="text-[11px] font-medium text-charcoal-700 ml-1 truncate">
            {selectedColor.name}
          </span>
        </div>

        {/* Product Title */}
        <h3 className="text-base font-bold text-charcoal-900 group-hover:text-terracotta-600 transition-colors line-clamp-2 leading-snug mb-1.5">
          {product.title}
        </h3>

        {/* One Headline Benefit */}
        <p className="text-xs text-charcoal-500 line-clamp-2 leading-relaxed mb-4 flex-1">
          {product.headlineBenefit}
        </p>

        {/* Material Selection Pills */}
        <div className="flex flex-wrap gap-1 mb-4" onClick={(e) => e.stopPropagation()}>
          {product.materials.map((mat) => (
            <button
              key={mat.id}
              type="button"
              onClick={() => setSelectedMaterial(mat)}
              className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                selectedMaterial.id === mat.id
                  ? 'bg-charcoal-800 text-white'
                  : 'bg-cream-200 text-charcoal-700 hover:bg-cream-300'
              }`}
            >
              {mat.name}
            </button>
          ))}
        </div>

        {/* Pricing and Action Strip */}
        <div className="pt-3 border-t border-cream-200 flex items-center justify-between gap-2 mt-auto">
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-terracotta-600 leading-none">
              {formatVnd(currentPrice)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-charcoal-400 line-through mt-0.5">
                {formatVnd(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label="Thêm vào giỏ hàng"
              className="p-2.5 rounded-xl bg-terracotta-50 hover:bg-terracotta-500 text-terracotta-600 hover:text-white border border-terracotta-200 hover:border-terracotta-500 transition-colors active:scale-95"
              title="Thêm nhanh vào giỏ"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
              className="px-3 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-semibold transition-all active:scale-95"
            >
              Xem chi tiết
            </button>
          </div>
        </div>

      </div>
    </article>
  );
};
