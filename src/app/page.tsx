'use client';

import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedProducts } from '../components/home/FeaturedProducts';
import { ValueCraftsmanship } from '../components/home/ValueCraftsmanship';
import { B2BSolutions } from '../components/home/B2BSolutions';
import { QuoteRequestSection } from '../components/home/QuoteRequestSection';
import { WorkshopStory } from '../components/home/WorkshopStory';
import { SocialProof } from '../components/home/SocialProof';
import { PolicyAccordion } from '../components/home/PolicyAccordion';

import { ProductModal } from '../components/product/ProductModal';
import { Viewer3DModal } from '../components/product/Viewer3DModal';
import { CartDrawer } from '../components/cart/CartDrawer';
import { useStore } from '../context/StoreContext';

export default function HomePage() {
  const {
    activeProduct,
    closeProductModal,
    viewerProduct,
    isViewerOpen,
    close3DViewer,
  } = useStore();

  return (
    <div className="flex flex-col">
      {/* 
        =======================================================================
        HOMEPAGE ARCHITECTURE: STRICT 8-STAGE SEQUENCE
        =======================================================================
      */}

      {/* STAGE 1: Hero Section (Two-Path Decision Architecture & Trust Strip) */}
      <HeroSection />

      {/* STAGE 2: Featured Products Grid (#featured-products) */}
      <FeaturedProducts />

      {/* STAGE 3: Value Proof & Craftsmanship (Why T&T?) */}
      <ValueCraftsmanship />

      {/* STAGE 4: B2B & Personalized Solutions (Cafe, Homestay, Workspaces) */}
      <B2BSolutions />

      {/* STAGE 5: Custom 3D Printing & Quote Estimator (#quote-service) */}
      <QuoteRequestSection />

      {/* STAGE 6: Workshop Story & Production Transparency */}
      <WorkshopStory />

      {/* STAGE 7: Social Proof & Real User Setups (UGC & Verified Reviews) */}
      <SocialProof />

      {/* STAGE 8: FAQ & Service Policies (Accordion) */}
      <PolicyAccordion />

      {/* 
        =======================================================================
        SUPPORTIVE CLIENT MODALS & OVERLAYS
        =======================================================================
      */}

      {/* Product Detail & Customization Drawer/Modal */}
      <ProductModal
        product={activeProduct}
        isOpen={Boolean(activeProduct)}
        onClose={closeProductModal}
      />

      {/* Lazy-loaded Interactive 3D WebGL Inspector (Three.js OrbitControls) */}
      <Viewer3DModal
        product={viewerProduct}
        isOpen={isViewerOpen}
        onClose={close3DViewer}
      />

      {/* Slide-over Cart Drawer with Zalo order confirmation */}
      <CartDrawer />
    </div>
  );
}
