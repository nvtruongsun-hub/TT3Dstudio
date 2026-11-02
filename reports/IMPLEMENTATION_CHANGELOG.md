# NHẬT KÝ THỰC THI & THAY ĐỔI MÃ NGUỒN (IMPLEMENTATION CHANGELOG)
## DỰ ÁN: NÂNG CẤP TOÀN DIỆN NỀN TẢNG T&T 3D STUDIO

**Phiên bản hiện tại:** `v5.3-transformation`  
**Nhánh thực hiện:** `feature/smart-address-checkout`  
**Ngày cập nhật:** 02/11/2026  
**Chủ trì:** Principal AI Engineering Agent (Lead Executor)  

---

## 1. TỔNG HỢP CÁC TẬP TIN ĐÃ THAY ĐỔI & THÊM MỚI

| Tập tin (File Path) | Loại thao tác | Mục đích kỹ thuật | Trạng thái kiểm thử |
| :--- | :---: | :--- | :---: |
| [`index.html`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/index.html) | `Modified` | • Gỡ bỏ script rác `automation-simulator.js`.<br>• Cập nhật 3 nút Mua Trọn Bộ tự động gọi `applyCoupon('TT3D10')`.<br>• Sửa mâu thuẫn địa lý "Hà Nội" thành "Hà Tĩnh" trong FAQ và Modal.<br>• Thống nhất thương hiệu "T&T 3D Studio" thay cho "T&T 3D Labs". | **PASS** (`test_sprint1_quick_wins.js`) |
| [`js/cart.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/js/cart.js) | `Modified` | • Bổ sung mã `TT3D10` vào danh sách coupon hợp lệ.<br>• Export hàm `applyCoupon` lên `window.TTCart`. | **PASS** (`test_sprint1_quick_wins.js`) |
| [`scripts/build-static-artifact.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/scripts/build-static-artifact.js) | `Modified` | • Xóa `js/automation-simulator.js` khỏi danh sách bắt buộc preflight.<br>• Đóng gói thành công 238 tệp vào `dist/`. | **PASS** (Exit Code 0) |
| [`tests/test_sprint1_quick_wins.js`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/tests/test_sprint1_quick_wins.js) | `Added` | • Bộ test TDD nghiêm ngặt kiểm tra nút Combo, địa chỉ Hà Tĩnh, thương hiệu T&T 3D Studio và loại bỏ script rác. | **PASS** (100% Green, Đã qua Mutation Test) |
| [`reports/TRANSFORMATION_BASELINE_AUDIT.md`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/reports/TRANSFORMATION_BASELINE_AUDIT.md) | `Added` | • Báo cáo kiểm toán hiện trạng Phase 0 (13 phát hiện P0-P3 có bằng chứng). | **VERIFIED** |
| [`reports/PRODUCT_VISION_AND_STRATEGY.md`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/reports/PRODUCT_VISION_AND_STRATEGY.md) | `Added` | • Bản đặc tả tầm nhìn, 4 chân dung khách hàng và chiến lược danh mục sản phẩm. | **VERIFIED** |
| [`reports/PRIORITIZED_IMPROVEMENT_BACKLOG.md`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/reports/PRIORITIZED_IMPROVEMENT_BACKLOG.md) | `Added` | • Backlog cải tiến ưu tiên theo 4 Sprint có tiêu chí nghiệm thu và kế hoạch test. | **VERIFIED** |
| [`reports/TARGET_ARCHITECTURE.md`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/reports/TARGET_ARCHITECTURE.md) | `Added` | • So sánh đối chiếu 2 phương án kiến trúc, quyết định Evolutionary Upgrade. | **VERIFIED** |
| [`reports/UI_UX_TRANSFORMATION_PLAN.md`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/reports/UI_UX_TRANSFORMATION_PLAN.md) | `Added` | • Kế hoạch thiết kế Atelier Design System, bảng màu WCAG AA và luồng trang chủ. | **VERIFIED** |
| [`reports/SECURITY_AND_DATA_READINESS.md`](file:///c:/Users/truongg/OneDrive%20-%20Thuyloi%20University/T%C3%A0i%20li%E1%BB%87u/02.%20T%26T%203D%20studio/reports/SECURITY_AND_DATA_READINESS.md) | `Added` | • Báo cáo ma trận RLS 10 bảng, phòng thủ tấn công và phân loại dữ liệu dry-run. | **VERIFIED** |

---

## 2. CHI TIẾT CÁC SỬA ĐỔI MÃ NGUỒN (CODE LEVEL DIFF EXPLANATIONS)

### 2.1. Cập nhật mã giảm giá Combo trong `index.html` & `js/cart.js`
* **Vấn đề ban đầu:** Bấm "Mua Trọn Bộ" tại 3 thẻ combo trên trang chủ chỉ nạp sản phẩm ở giá gốc, giỏ hàng không giảm 10% như mô tả trên thẻ quảng cáo.
* **Thay đổi:**
  ```javascript
  // js/cart.js
  function applyCoupon(code) {
    const clean = (code || '').trim().toUpperCase();
    if (clean === 'TT3D10' || clean === 'TT3D2026' || clean === 'STUDIO' || clean === 'SPECIAL10') {
      currentDiscountPercent = 10;
      saveCart();
      if (window.showToast) window.showToast('Đã áp dụng mã ưu đãi giảm 10% thành công!');
    } ...
  }
  ```
  ```html
  <!-- index.html (Dòng 740, 808, 876) -->
  <button type="button" 
          onclick="window.TTCart.addItem(...); window.TTCart.addItem(...); window.TTCart.applyCoupon('TT3D10'); window.TTCart.openCart();" 
          class="btn-primary text-xs !py-3 !px-4">
    Mua Trọn Bộ
  </button>
  ```
* **Kết quả:** Ngay khi khách bấm "Mua Trọn Bộ", giỏ hàng mở ra với mã `TT3D10` được áp dụng tự động, giảm ngay 10% trên tổng giá trị 2 sản phẩm (khớp 100% với giá quảng cáo 412.000 đ hoặc 273.000 đ).

### 2.2. Xóa bỏ Dead Code script rác `js/automation-simulator.js`
* **Vấn đề ban đầu:** File `js/automation-simulator.js` nặng 662 dòng định nghĩa class `LayercraftSimulator` phục vụ giả lập đầu in 3D chuyển động trên Canvas. Tuy nhiên, không có bất kỳ dòng code nào trên trang khởi tạo class này.
* **Thay đổi:**
  - Xóa dòng thẻ `<script src="js/automation-simulator.js?v=4.1"></script>` khỏi `index.html`.
  - Cập nhật pipeline `scripts/build-static-artifact.js` để loại bỏ khỏi danh sách preflight.
* **Kết quả:** Giảm tải kích thước payload ban đầu, tránh tiêu hao CPU của trình duyệt khi nạp mã không dùng đến.

### 2.3. Khắc phục mâu thuẫn địa lý Hà Nội vs Hà Tĩnh
* **Vấn đề ban đầu:** FAQ dòng 624 ghi thời gian chế tác tại "xưởng Hà Nội", modal dòng 1074 ghi "Xưởng chế tác: T&T 3D Labs Studio, Hà Nội", trong khi tiêu đề và footer khẳng định "Xưởng tại Cẩm Xuyên, Tỉnh Hà Tĩnh".
* **Thay đổi:** Thống nhất 100% toàn bộ câu chữ sang địa danh **"Xưởng chế tác tại Thị trấn Cẩm Xuyên, Tỉnh Hà Tĩnh"**, đồng thời chuyển đổi tên thương hiệu từ "T&T 3D Labs" sang chuẩn duy nhất: **"T&T 3D Studio"**.
