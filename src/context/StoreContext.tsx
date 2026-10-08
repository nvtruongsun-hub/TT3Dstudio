'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ColorVariant, MaterialVariant, CartItem } from '../types';

interface StoreContextType {
  // Cart
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    product: Product,
    color: ColorVariant,
    material: MaterialVariant,
    quantity?: number,
    customText?: string
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;

  // Product Detail Modal
  activeProduct: Product | null;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;

  // 3D Model Modal (Lazy Loaded, Supportive inspection)
  viewerProduct: Product | null;
  isViewerOpen: boolean;
  open3DViewer: (product: Product) => void;
  close3DViewer: () => void;

  // Quote Drawer / Modal
  isQuoteModalOpen: boolean;
  setIsQuoteModalOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'tt3d_cart_items_v1';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [viewerProduct, setViewerProduct] = useState<Product | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Rehydrate cart from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch {
      // Local storage unparseable
    }
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Local storage full or unavailable
    }
  }, [cart]);

  const addToCart = (
    product: Product,
    color: ColorVariant,
    material: MaterialVariant,
    quantity = 1,
    customText = ''
  ) => {
    const itemKey = `${product.id}-${color.id}-${material.id}-${customText.trim()}`;
    const unitPrice = product.basePrice + material.priceModifier;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === itemKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      }
      const newItem: CartItem = {
        id: itemKey,
        product,
        selectedColor: color,
        selectedMaterial: material,
        customText: customText.trim() || undefined,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      };
      return [...prev, newItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              totalPrice: nextQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const openProductModal = (product: Product) => setActiveProduct(product);
  const closeProductModal = () => setActiveProduct(null);

  const open3DViewer = (product: Product) => {
    setViewerProduct(product);
    setIsViewerOpen(true);
  };

  const close3DViewer = () => {
    setIsViewerOpen(false);
    setViewerProduct(null);
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        activeProduct,
        openProductModal,
        closeProductModal,
        viewerProduct,
        isViewerOpen,
        open3DViewer,
        close3DViewer,
        isQuoteModalOpen,
        setIsQuoteModalOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
