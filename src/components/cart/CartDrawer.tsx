'use client';

import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, MessageSquare, ShieldCheck, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, clearCart, cartTotal } = useStore();

  if (!isCartOpen) return null;

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleCheckoutZalo = () => {
    if (cart.length === 0) return;

    let orderItemsText = cart
      .map(
        (item, index) =>
          `${index + 1}. ${item.product.title}\n   - Màu: ${item.selectedColor.name}\n   - Chất liệu: ${item.selectedMaterial.label}\n   - Khắc/Cài: ${item.customText || 'Không'}\n   - SL: ${item.quantity} x ${formatVnd(item.unitPrice)} = ${formatVnd(item.totalPrice)}`
      )
      .join('\n\n');

    const message = `Xin chào T&T 3D Studio! Tôi muốn đặt mua các sản phẩm sau:\n\n${orderItemsText}\n\n👉 TỔNG TIỀN: ${formatVnd(cartTotal)}\n\n(Vui lòng tư vấn phí ship và thời gian nhận hàng giúp tôi!)`;

    const zaloUrl = `https://zalo.me/0986888333?text=${encodeURIComponent(message)}`;
    window.open(zaloUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-warm-xl border-l border-cream-300 flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-cream-200 flex items-center justify-between bg-cream-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-terracotta-500" />
              <h2 className="text-base font-bold text-charcoal-900">
                Giỏ Hàng Của Bạn ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-800 hover:bg-cream-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center text-charcoal-400 mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-charcoal-800 mb-1">
                  Giỏ hàng của bạn đang trống
                </h3>
                <p className="text-xs text-charcoal-500 max-w-xs mb-4">
                  Khám phá các mẫu đế NFC và đồ decor thiết kế độc bản tại T&T 3D Studio.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-semibold"
                >
                  Tiếp tục xem sản phẩm
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-cream-50 border border-cream-300 flex gap-3.5 relative"
                >
                  <img
                    src={item.product.images.hero}
                    alt={item.product.title}
                    className="w-16 h-16 rounded-xl object-cover bg-cream-200 shrink-0 border border-cream-300"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-charcoal-900 truncate">
                      {item.product.title}
                    </h4>
                    <div className="text-[11px] text-charcoal-500 mt-0.5">
                      Màu: <span className="font-medium text-charcoal-700">{item.selectedColor.name}</span> • {item.selectedMaterial.name}
                    </div>
                    {item.customText && (
                      <div className="text-[11px] text-terracotta-600 truncate mt-0.5">
                        Khắc/Cài: {item.customText}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-cream-300 rounded-lg bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="px-2 py-0.5 text-xs text-charcoal-600 hover:bg-cream-100"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-mono font-bold text-charcoal-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="px-2 py-0.5 text-xs text-charcoal-600 hover:bg-cream-100"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-xs font-extrabold text-terracotta-600">
                        {formatVnd(item.totalPrice)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-2.5 right-2.5 p-1 text-charcoal-300 hover:text-red-500 transition-colors"
                    title="Xóa món này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-cream-200 bg-cream-50 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-500">Tạm tính:</span>
                <span className="text-lg font-extrabold text-charcoal-900">
                  {formatVnd(cartTotal)}
                </span>
              </div>

              <div className="text-[11px] text-charcoal-500 leading-tight">
                * Chưa bao gồm phí vận chuyển (T&T sẽ báo cước tối ưu nhất theo địa chỉ của bạn).
              </div>

              <button
                type="button"
                onClick={handleCheckoutZalo}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-terracotta-500 hover:bg-terracotta-700 text-white font-bold text-xs sm:text-sm shadow-warm-md transition-all active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Gửi đơn hàng qua Zalo (Xác nhận ngay)</span>
              </button>

              <button
                type="button"
                onClick={clearCart}
                className="w-full py-1.5 text-center text-[11px] text-charcoal-400 hover:text-charcoal-600 transition-colors"
              >
                Xóa tất cả sản phẩm trong giỏ
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
