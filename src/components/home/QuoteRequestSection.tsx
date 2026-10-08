'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Clock,
  Layers,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { PrintMaterial, InfillPurpose, UploadedFileMeta, QuoteInquiry } from '../../types';

export const QuoteRequestSection: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileMeta, setFileMeta] = useState<UploadedFileMeta | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Form State
  const [material, setMaterial] = useState<PrintMaterial>('PLA');
  const [infill, setInfill] = useState<InfillPurpose>('decor');
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [phoneOrZalo, setPhoneOrZalo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Material Rates map (in VND per gram)
  const materialInfo: Record<PrintMaterial, { label: string; desc: string; ratePerGram: number }> = {
    PLA: {
      label: 'PLA+ Nguyên Sinh (Decor / Nội Thất)',
      desc: 'Mịn màng, không mùi, thích hợp tượng, hộp, đồ trang trí',
      ratePerGram: 1200,
    },
    PETG: {
      label: 'PETG (Chịu Nhiệt / Ngoài Trời)',
      desc: 'Bền dẻo, chịu nhiệt 75°C, chống nước và tia UV',
      ratePerGram: 1500,
    },
    Resin: {
      label: 'Resin SLA 8K (Siêu Chi Tiết)',
      desc: 'Bề mặt phẳng láng như đúc khuôn ép nhựa, nét vi mô',
      ratePerGram: 2400,
    },
    TPU: {
      label: 'TPU (Cao Su Đàn Hồi)',
      desc: 'Dẻo bẻ cong không gãy, làm gioăng đệm hoặc ốp bảo vệ',
      ratePerGram: 2200,
    },
    Nylon: {
      label: 'Nylon SLS / PA12 (Cơ Khí Cường Lực)',
      desc: 'Bền cơ học cao nhất, chống mài mòn cho bánh răng',
      ratePerGram: 5500,
    },
  };

  const infillOptions: Record<InfillPurpose, { label: string; range: string; desc: string; multiplier: number }> = {
    decor: {
      label: 'Decor / Trưng Bày',
      range: '15 - 20%',
      desc: 'Tối ưu trọng lượng và thời gian in, đủ cứng cáp cho đồ decor',
      multiplier: 1.0,
    },
    functional: {
      label: 'Linh Kiện Chức Năng',
      range: '40 - 60%',
      desc: 'Chịu lực tì đè, ngàm bấm, đồ gá kỹ thuật',
      multiplier: 1.45,
    },
    heavy_duty: {
      label: 'Chịu Lực Cực Đại',
      range: '100% Đặc',
      desc: 'Đúc nguyên khối đặc 100% cho chi tiết cơ khí tải nặng',
      multiplier: 2.1,
    },
  };

  // Estimate Calculation
  const calculateEstimatedPrice = () => {
    // Base estimated weight in grams (approx based on file size or default 60g)
    let estimatedWeightGrams = 60;
    if (fileMeta) {
      // Heuristic: roughly 1MB of binary STL is ~15-40cm3, ~18-48g
      const mb = fileMeta.sizeBytes / (1024 * 1024);
      estimatedWeightGrams = Math.max(25, Math.min(650, Math.round(mb * 22 + 30)));
    }
    const matRate = materialInfo[material].ratePerGram;
    const infMultiplier = infillOptions[infill].multiplier;
    const machineFee = 25000; // Phí chuẩn bị & in

    const singleUnitPrice = Math.round((estimatedWeightGrams * matRate * infMultiplier + machineFee) / 1000) * 1000;
    return singleUnitPrice * quantity;
  };

  const estimatedTotal = calculateEstimatedPrice();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 50MB
    const maxSizeBytes = 50 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setFileError('Dung lượng file vượt quá giới hạn 50MB. Vui lòng nén hoặc liên hệ Zalo.');
      return;
    }

    // Check extensions: .stl, .obj, .step, .stp
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['stl', 'obj', 'step', 'stp'].includes(ext || '')) {
      setFileError('Chỉ hỗ trợ định dạng file 3D: .STL, .OBJ, .STEP (tối đa 50MB).');
      return;
    }

    setFileMeta({
      name: file.name,
      sizeBytes: file.size,
      extension: ext as any,
    });
  };

  const handleRemoveFile = () => {
    setFileMeta(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrZalo.trim()) {
      alert('Vui lòng nhập Số điện thoại hoặc Zalo để xưởng gửi báo giá.');
      return;
    }

    setIsSubmitting(true);

    // Build Zalo prefill string for immediate follow-up
    const inquiry: QuoteInquiry = {
      customerName: customerName || 'Khách hàng web',
      phoneOrZalo,
      purpose: 'individual',
      material,
      infillPurpose: infill,
      quantity,
      file: fileMeta || undefined,
      notes,
      estimatedPriceVnd: estimatedTotal,
      submittedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);

      // Open Zalo prefill chat in new tab
      const message = `Xin chào T&T 3D Studio! Tôi muốn nhận báo giá in 3D:
- Khách hàng: ${inquiry.customerName}
- SĐT/Zalo: ${inquiry.phoneOrZalo}
- File: ${fileMeta ? fileMeta.name : 'Chưa đính kèm (gửi qua Zalo)'}
- Vật liệu: ${material}
- Độ đặc: ${infillOptions[infill].label}
- Số lượng: ${quantity} chiếc
- Ghi chú: ${notes || 'Không'}
- Ước tính sơ bộ: ~${estimatedTotal.toLocaleString('vi-VN')}₫`;

      const zaloUrl = `https://zalo.me/0986888333?text=${encodeURIComponent(message)}`;
      window.open(zaloUrl, '_blank');
    }, 600);
  };

  return (
    <section id="quote-service" className="py-16 sm:py-24 bg-cream-50 border-b border-cream-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tech-100 text-tech-600 text-xs font-bold uppercase tracking-wider mb-3 border border-tech-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dịch Vụ In 3D Theo Yêu Cầu • Báo Giá Tức Thì</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight leading-tight">
            Gửi file in 3D & nhận báo giá chuẩn xác
          </h2>
          <p className="text-sm sm:text-base text-charcoal-500 mt-2 leading-relaxed">
            Hỗ trợ công nghệ FDM, Resin 8K và SLS Laser. Nhận file .STL, .OBJ, .STEP (tối đa 50MB) — Kỹ sư T&T phản hồi thông số và chi phí trong 2 giờ.
          </p>
        </div>

        {/* Main Quote Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-cream-300 shadow-warm-lg p-6 sm:p-10">
          
          {isSuccess ? (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-success-50 text-success-600 flex items-center justify-center mb-4 border border-success-100">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-charcoal-900 mb-2">
                Đã tiếp nhận yêu cầu báo giá in 3D!
              </h3>
              <p className="text-sm text-charcoal-500 max-w-md mb-6 leading-relaxed">
                Hệ thống đã kết nối trực tiếp đến Zalo của Kỹ thuật viên T&T Studio. Chúng tôi sẽ phân tích file và gửi file cắt lớp (slicer) kèm báo giá chính xác trong vòng 2 giờ.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setFileMeta(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-charcoal-900 text-white text-xs sm:text-sm font-semibold hover:bg-charcoal-800 transition-colors"
              >
                Gửi thêm yêu cầu in khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitQuote} className="space-y-8">
              
              {/* Step 1: File Dropzone */}
              <div>
                <label className="block text-sm font-bold text-charcoal-900 mb-2 flex items-center justify-between">
                  <span>1. Tải lên file 3D (.STL, .OBJ, .STEP)</span>
                  <span className="text-xs text-charcoal-400 font-normal">Tối đa 50MB</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".stl,.obj,.step,.stp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="quote-file-input"
                />

                {!fileMeta ? (
                  <label
                    htmlFor="quote-file-input"
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-cream-400 hover:border-terracotta-500 rounded-2xl bg-cream-50 hover:bg-terracotta-50/20 cursor-pointer transition-all duration-200 text-center group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white text-terracotta-600 flex items-center justify-center shadow-warm-sm mb-3 border border-cream-300 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-charcoal-800">
                      Kéo thả file vào đây hoặc <span className="text-terracotta-600 underline">chọn từ thiết bị</span>
                    </span>
                    <span className="text-xs text-charcoal-400 mt-1">
                      Định dạng chuẩn: .STL, .OBJ, .STEP (Dung lượng &le; 50MB)
                    </span>
                  </label>
                ) : (
                  <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-tech-100 text-tech-600 flex items-center justify-center font-bold text-xs uppercase border border-tech-200">
                        {fileMeta.extension}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-charcoal-900 truncate max-w-xs sm:max-w-md">
                          {fileMeta.name}
                        </div>
                        <div className="text-xs text-charcoal-500">
                          {(fileMeta.sizeBytes / (1024 * 1024)).toFixed(2)} MB • Sẵn sàng phân tích
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 text-charcoal-400 hover:text-red-500 rounded-lg hover:bg-white transition-colors"
                      title="Xóa file này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {fileError && (
                  <div className="mt-2 text-xs text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>

              {/* Step 2: Material Selection */}
              <div>
                <label className="block text-sm font-bold text-charcoal-900 mb-2">
                  2. Chọn vật liệu in mong muốn
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['PLA', 'PETG', 'Resin'] as PrintMaterial[]).map((mat) => {
                    const info = materialInfo[mat];
                    const isSelected = material === mat;
                    return (
                      <button
                        key={mat}
                        type="button"
                        onClick={() => setMaterial(mat)}
                        className={`p-3.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-warm-sm'
                            : 'bg-cream-100 text-charcoal-800 border-cream-300 hover:bg-cream-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold">{mat}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-tech-400" />}
                        </div>
                        <p
                          className={`text-xs leading-snug ${
                            isSelected ? 'text-charcoal-200' : 'text-charcoal-500'
                          }`}
                        >
                          {info.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Infill Purpose Selection */}
              <div>
                <label className="block text-sm font-bold text-charcoal-900 mb-2">
                  3. Độ đặc ruột / Mục đích sử dụng (Infill)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['decor', 'functional', 'heavy_duty'] as InfillPurpose[]).map((purpose) => {
                    const info = infillOptions[purpose];
                    const isSelected = infill === purpose;
                    return (
                      <button
                        key={purpose}
                        type="button"
                        onClick={() => setInfill(purpose)}
                        className={`p-3.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-terracotta-50 text-terracotta-900 border-terracotta-500 ring-1 ring-terracotta-500'
                            : 'bg-cream-100 text-charcoal-800 border-cream-300 hover:bg-cream-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold">{info.label}</span>
                          <span className="text-xs font-mono font-semibold text-terracotta-600 bg-white px-1.5 py-0.5 rounded border border-cream-300">
                            {info.range}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-500 leading-snug">
                          {info.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Quantity & Contact details */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-bold text-charcoal-900 mb-1.5">
                    Số lượng (chiếc)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-3 rounded-xl border border-cream-300 bg-cream-50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-sm font-bold text-charcoal-900 mb-1.5">
                    Họ tên của bạn
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Anh Tùng / Cafe Kopi"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-cream-300 bg-cream-50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-sm font-bold text-charcoal-900 mb-1.5">
                    Số điện thoại / Zalo <span className="text-terracotta-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0986 888 333"
                    value={phoneOrZalo}
                    onChange={(e) => setPhoneOrZalo(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-cream-300 bg-cream-50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                  />
                </div>
              </div>

              {/* Note input */}
              <div>
                <label className="block text-sm font-bold text-charcoal-900 mb-1.5">
                  Ghi chú yêu cầu kỹ thuật thêm (tùy chọn)
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Cần màu trắng sứ mờ, cần ren đồng M3 đúc chìm, giao trước thứ 6..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                />
              </div>

              {/* Summary & Price Estimator Strip */}
              <div className="p-4 sm:p-5 rounded-2xl bg-cream-200 border border-cream-300 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-charcoal-500 uppercase tracking-wide font-bold">
                    Ước tính sơ bộ (Chưa gồm VAT / Ship)
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-extrabold text-terracotta-600">
                      ~{estimatedTotal.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="text-xs text-charcoal-500">
                      ({quantity} chiếc • {material})
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-700 text-white font-bold text-sm shadow-warm-md hover:shadow-warm-lg transition-all active:scale-95 disabled:opacity-50 min-h-[48px]"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu báo giá nhanh (Phản hồi trong 2 giờ)'}
                  </span>
                </button>
              </div>

              {/* Privacy guarantee note */}
              <div className="flex items-center justify-center gap-2 text-xs text-charcoal-400">
                <ShieldCheck className="w-4 h-4 text-charcoal-500" />
                <span>Cam kết bảo mật 100% bản quyền file 3D, không chia sẻ cho bên thứ ba.</span>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
