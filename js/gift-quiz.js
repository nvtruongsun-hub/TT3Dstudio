/**
 * T&T 3D Labs - Gift Selector Quiz Engine ("Chọn Quà")
 * 3-question filter to match perfect 3D decor & personalized gift products.
 */

(function (window) {
  'use strict';

  const QUIZ_QUESTIONS = [
    {
      step: 1,
      title: 'Món quà này bạn muốn dành tặng cho ai?',
      subtitle: 'Chọn người nhận để xưởng gợi ý phong cách thiết kế phù hợp nhất',
      options: [
        { id: 'lover', label: 'Người yêu / Bạn gái / Vợ', icon: 'fa-heart', desc: 'Tone Coquette, nơ lụa, hoa nếp gấp lãng mạn' },
        { id: 'friend', label: 'Bạn thân / Bạn bè', icon: 'fa-user-group', desc: 'Art toy, fidget giải tỏa stress, móc khóa 3D' },
        { id: 'colleague', label: 'Đồng nghiệp / Bàn làm việc', icon: 'fa-briefcase', desc: 'Khay để bàn, kệ công thái học, ống cắm bút' },
        { id: 'cafe', label: 'Quán cafe / Khách sạn / Shop', icon: 'fa-shop', desc: 'Đế WiFi 1-chạm NFC, biển số bàn QR code' },
        { id: 'self', label: 'Tự thưởng cho bản thân', icon: 'fa-sparkles', desc: 'F5 góc học tập & làm việc thêm cảm hứng' }
      ]
    },
    {
      step: 2,
      title: 'Món quà cho dịp đặc biệt nào?',
      subtitle: 'Mỗi dịp tặng sẽ gắn liền với thông điệp và ý nghĩa riêng',
      options: [
        { id: 'birthday', label: 'Sinh nhật ý nghĩa', icon: 'fa-cake-candles' },
        { id: 'anniversary', label: 'Kỷ niệm tình yêu / Ngày cưới', icon: 'fa-rings-wedding' },
        { id: 'housewarming', label: 'Tân gia / Khai trương cửa hàng', icon: 'fa-champagne-glasses' },
        { id: 'thankyou', label: 'Quà cảm ơn / Tri ân đồng hành', icon: 'fa-handshake-angle' },
        { id: 'daily', label: 'Món quà bất ngờ ngày thường', icon: 'fa-gift' }
      ]
    },
    {
      step: 3,
      title: 'Khoảng ngân sách dự kiến của bạn?',
      subtitle: 'Tất cả sản phẩm đều được hoàn thiện thủ công & kiểm định QC tại Hà Nội',
      options: [
        { id: 'under_150', label: 'Dưới 150.000 đ', desc: 'Móc khóa cá nhân hóa, ống cọ lụa, khay tiện ích' },
        { id: '150_300', label: '150.000 đ – 300.000 đ', desc: 'Khay nơ lụa cao cấp, đế WiFi NFC đúc chìm, lọ hoa dập ly' },
        { id: 'above_300', label: 'Trên 300.000 đ (Freeship)', desc: 'Đèn ngủ xoắn kem nghệ thuật, combo quà tặng trọn bộ' }
      ]
    }
  ];

  let currentStep = 1;
  let userAnswers = {
    recipient: null,
    occasion: null,
    budget: null
  };

  function openGiftQuiz() {
    currentStep = 1;
    userAnswers = { recipient: null, occasion: null, budget: null };
    renderQuizStep();
    const modal = document.getElementById('gift-quiz-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      if (document.body && document.body.style) {
        document.body.style.overflow = 'hidden';
      }
    }
  }

  function closeGiftQuiz() {
    const modal = document.getElementById('gift-quiz-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      if (document.body && document.body.style) {
        document.body.style.overflow = '';
      }
    }
  }

  function renderQuizStep() {
    const container = document.getElementById('gift-quiz-content');
    if (!container) return;

    if (currentStep <= 3) {
      const q = QUIZ_QUESTIONS[currentStep - 1];
      container.innerHTML = `
        <div class="space-y-6">
          
          <!-- Step indicator -->
          <div class="flex items-center justify-between text-xs font-mono pb-3 border-b border-slate-100">
            <span class="text-[#FF5C00] font-bold">BƯỚC ${currentStep} / 3</span>
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full ${currentStep >= 1 ? 'bg-[#FF5C00]' : 'bg-slate-200'}"></span>
              <span class="w-2.5 h-2.5 rounded-full ${currentStep >= 2 ? 'bg-[#FF5C00]' : 'bg-slate-200'}"></span>
              <span class="w-2.5 h-2.5 rounded-full ${currentStep >= 3 ? 'bg-[#FF5C00]' : 'bg-slate-200'}"></span>
            </div>
          </div>

          <!-- Question heading -->
          <div class="space-y-1">
            <h3 class="text-base sm:text-lg font-bold text-[#20231F]">${q.title}</h3>
            <p class="text-xs text-[#586057]">${q.subtitle}</p>
          </div>

          <!-- Options Grid -->
          <div class="space-y-2.5">
            ${q.options.map(opt => `
              <button type="button" 
                      data-option-id="${opt.id}"
                      class="quiz-option-btn w-full p-4 rounded-2xl border border-[#DCDDD5] hover:border-[#FF5C00] bg-white hover:bg-orange-50/40 text-left transition-all flex items-center justify-between group active:scale-[0.99]">
                <div class="flex items-center gap-3.5">
                  <div class="w-10 h-10 rounded-xl bg-orange-100/60 text-[#FF5C00] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <i class="fa-solid ${opt.icon} text-base"></i>
                  </div>
                  <div>
                    <div class="text-xs sm:text-sm font-bold text-[#20231F] group-hover:text-[#FF5C00] transition-colors">${opt.label}</div>
                    ${opt.desc ? `<div class="text-[11px] text-[#586057] mt-0.5">${opt.desc}</div>` : ''}
                  </div>
                </div>
                <i class="fa-solid fa-chevron-right text-xs text-slate-300 group-hover:text-[#FF5C00] group-hover:translate-x-1 transition-all"></i>
              </button>
            `).join('')}
          </div>

        </div>
      `;

      // Bind option clicks
      container.querySelectorAll('.quiz-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const optId = btn.dataset.optionId;
          if (currentStep === 1) userAnswers.recipient = optId;
          else if (currentStep === 2) userAnswers.occasion = optId;
          else if (currentStep === 3) userAnswers.budget = optId;

          currentStep++;
          renderQuizStep();
        });
      });

    } else {
      // Step 4: Show Results
      renderQuizResults(container);
    }
  }

  function getRecommendations() {
    let all = [];
    if (window.TTCatalogStore && typeof window.TTCatalogStore.getProductsSync === 'function') {
      all = window.TTCatalogStore.getProductsSync(false);
    }
    if (!Array.isArray(all) || all.length === 0) {
      all = window.TTCatalogStore?.defaultProducts || [];
    }

    const { recipient, occasion, budget } = userAnswers;

    // Filter by budget
    let pool = all.filter(p => {
      const pr = p.price || 0;
      if (budget === 'under_150') return pr <= 150000;
      if (budget === '150_300') return pr > 150000 && pr <= 300000;
      if (budget === 'above_300') return pr > 300000;
      return true;
    });

    if (pool.length < 3) {
      pool = all; // fallback to all if price range is too narrow
    }

    // Score products based on recipient
    const scored = pool.map(p => {
      let score = 0;
      let reason = 'Món quà decor bàn làm việc xinh xắn';

      if (recipient === 'lover') {
        if (p.category === 'Trang_Diem_Vanity') { score += 10; reason = 'Nơ lụa Coquette mềm mại, rất hợp phái đẹp'; }
        if (p.title.includes('Nơ') || p.title.includes('Lụa')) { score += 8; }
        if (p.category === 'Decor_Den_Noi_That') { score += 5; reason = 'Ánh sáng ấm áp cho không gian thư giãn'; }
      } else if (recipient === 'cafe') {
        if (p.category === 'Ca_Nhan_Hoa_NFC') { score += 15; reason = 'Chạm lưng điện thoại vào WiFi & Menu 1-chạm'; }
        if (p.category === 'Hop_De_Ban_Tien_Ich') { score += 5; }
      } else if (recipient === 'colleague') {
        if (p.category === 'Hop_De_Ban_Tien_Ich') { score += 10; reason = 'Sắp xếp bàn làm việc gọn gàng, công thái học'; }
        if (p.category === 'Ca_Nhan_Hoa_NFC') { score += 6; reason = 'In biển tên chức danh sang trọng'; }
      } else if (recipient === 'friend') {
        if (p.category === 'Do_Choi_Moc_Khoa') { score += 10; reason = 'Đồ chơi khớp xoay độc đáo & xả stress'; }
        if (p.category === 'Trang_Diem_Vanity') { score += 4; }
      } else {
        score += 5;
        reason = 'Món đồ decor điểm nhấn cho góc phòng có gu';
      }

      return { product: p, score, reason };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3);
  }

  function renderQuizResults(container) {
    const results = getRecommendations();

    container.innerHTML = `
      <div class="space-y-6 text-center">
        
        <!-- Header -->
        <div class="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-2xl">
          <i class="fa-solid fa-gift"></i>
        </div>
        <div class="space-y-1">
          <h3 class="text-base sm:text-lg font-bold text-[#20231F]">Gợi Ý Quà Tặng Hoàn Hảo Cho Bạn</h3>
          <p class="text-xs text-[#586057]">Dựa trên sở thích người nhận và ngân sách bạn đã chọn</p>
        </div>

        <!-- Recommendations Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          ${results.map(r => {
            const p = r.product;
            return `
              <div class="p-4 rounded-2xl border border-[#DCDDD5] bg-white hover:border-[#FF5C00] hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div class="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-slate-50">
                    <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover">
                  </div>
                  <span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-orange-50 text-[#FF5C00] border border-orange-200">
                    ✦ Gợi ý phù hợp
                  </span>
                  <h4 class="text-xs font-bold text-[#20231F] mt-2 line-clamp-1">${p.title}</h4>
                  <p class="text-[11px] text-[#586057] mt-1 line-clamp-2 leading-relaxed">${r.reason}</p>
                </div>

                <div class="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                  <span class="text-xs font-mono font-bold text-[#FF5C00]">${(p.price || 0).toLocaleString('vi-VN')} đ</span>
                  <button type="button" 
                          onclick="window.openProductDetailModal('${p.id}'); window.TTGiftQuiz.close();" 
                          class="px-2.5 py-1.5 rounded-lg bg-[#FF5C00] text-white text-[11px] font-bold hover:bg-[#E05200] transition-colors">
                    Xem mẫu
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Footer actions -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
          <button type="button" 
                  onclick="window.TTGiftQuiz.open()" 
                  class="btn-secondary text-xs !py-2 !px-4">
            <i class="fa-solid fa-rotate-right mr-1.5"></i> Chọn Lại
          </button>
          <button type="button" 
                  onclick="window.TTGiftQuiz.close(); window.switchWorkspace('view-store')" 
                  class="btn-primary text-xs !py-2 !px-4">
            Khám Phá Toàn Bộ Cửa Hàng
          </button>
        </div>

      </div>
    `;
  }

  window.TTGiftQuiz = {
    open: openGiftQuiz,
    close: closeGiftQuiz
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.TTGiftQuiz;
  }
})(typeof window !== 'undefined' ? window : globalThis);
