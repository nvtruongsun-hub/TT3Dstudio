/**
 * T&T 3D Studio - TypeScript Core Types & Data Models
 * Designed for Next.js (App Router) + React Architecture
 */

export type ProductMaterial = 'PLA+' | 'PETG' | 'Resin' | 'TPU' | 'Wood-Fill';

export type ProductStockStatus = 'in_stock' | 'made_to_order_24h' | 'out_of_stock';

export interface ColorVariant {
  id: string;
  name: string;
  hex: string;
  imageUrl?: string;
  inStock: boolean;
}

export interface MaterialVariant {
  id: string;
  name: ProductMaterial;
  label: string;
  priceModifier: number; // Delta in VND
  description: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  color: ColorVariant;
  material: MaterialVariant;
  price: number;
  originalPrice?: number;
  stockStatus: ProductStockStatus;
}

export interface ProductSpecification {
  dimensions: string; // e.g. "85 x 65 x 110 mm"
  weight: string; // e.g. "120g"
  layerResolution: string; // e.g. "0.16mm (Fine Detail)"
  origin: string; // e.g. "Thiết kế & sản xuất tại T&T 3D Studio Hà Nội"
  warrantyMonths: number;
  nfcSpecs?: {
    chipType: 'NTAG215' | 'NTAG213';
    rewriteable: boolean;
    waterproof: boolean;
    compatibility: string; // "iOS 13+ & Android (Không cần app)"
  };
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  headlineBenefit: string;
  category: 'smart-nfc' | 'decor-lighting' | 'desk-organizer' | 'custom-gift';
  basePrice: number;
  originalPrice?: number;
  stockStatus: ProductStockStatus;
  badge?: {
    text: string;
    variant: 'terracotta' | 'cyan' | 'neutral';
  };
  hasNfc: boolean;
  has3DModel: boolean;
  modelKey?: string;
  modelPath?: string;
  images: {
    hero: string;
    lifestyle: string[];
    macroDetail: string;
    dimensionComparison: string;
  };
  colors: ColorVariant[];
  materials: MaterialVariant[];
  specifications: ProductSpecification;
  b2bAvailable: boolean;
  shortDescription: string;
  fullDescription: string;
  customizationOptions?: {
    supportsLogoEngraving: boolean;
    supportsNfcPreload: boolean;
    supportsCustomText: boolean;
    characterLimit?: number;
  };
}

export type PrintMaterial = 'PLA' | 'PETG' | 'Resin' | 'TPU' | 'Nylon';
export type InfillPurpose = 'decor' | 'functional' | 'heavy_duty';

export interface InfillOption {
  value: InfillPurpose;
  label: string;
  percentageRange: string;
  description: string;
  multiplier: number;
}

export interface UploadedFileMeta {
  name: string;
  sizeBytes: number;
  extension: 'stl' | 'obj' | 'step' | 'stp';
  parsedVolumeCm3?: number;
  dimensionsMm?: { x: number; y: number; z: number };
}

export interface QuoteInquiry {
  customerName: string;
  phoneOrZalo: string;
  email?: string;
  purpose: 'individual' | 'b2b_cafe' | 'engineering';
  material: PrintMaterial;
  infillPurpose: InfillPurpose;
  quantity: number;
  file?: UploadedFileMeta;
  fileUrl?: string;
  notes?: string;
  estimatedPriceVnd?: number;
  submittedAt?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedColor: ColorVariant;
  selectedMaterial: MaterialVariant;
  customText?: string;
  nfcData?: {
    wifiSsid?: string;
    wifiPassword?: string;
    customUrl?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: 'shipping' | 'warranty' | 'nfc' | 'quote_privacy';
}

export interface CustomerReview {
  id: string;
  customerName: string;
  roleOrLocation: string; // e.g. "Chủ quán Cafe Acoustic, Q.3, TP.HCM"
  avatarUrl?: string;
  rating: number;
  date: string;
  content: string;
  productName: string;
  verifiedPurchase: boolean;
  setupImageUrl?: string;
}
