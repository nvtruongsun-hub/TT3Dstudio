# BÁO CÁO PHÂN LOẠI & DRY-RUN DỮ LIỆU TEST TRÊN PRODUCTION
**Dự án:** T&T 3D Studio  
**Project Ref:** `nbsumfhfxohawiuxrwqj` (`https://nbsumfhfxohawiuxrwqj.supabase.co`)  
**Thời gian thực hiện:** `2026-11-01T07:28:35.894Z`  
**Chế độ thực thi:** `READ-ONLY DRY-RUN (ZERO DELETE - KHÔNG CÓ BẢN GHI NÀO BỊ XÓA)`  

---

> [!IMPORTANT]
> **CAM KẾT AN TOÀN TUYỆT ĐỐI THEO CHỈ ĐẠO CỦA NGƯỜI DÙNG:**
> 1. Mọi truy vấn quét dữ liệu trên Production đều sử dụng lệnh `SELECT` thuần túy qua Supabase Management API.
> 2. Tuyệt đối **KHÔNG CÓ BẤT KỲ LỆNH DELETE, DROP, TRUNCATE HOẶC UPDATE NÀO ĐƯỢC CHẠY** trên database production.
> 3. Báo cáo này thống kê chính xác danh sách **45 tài khoản test** và **13 đơn hàng test** để Người dùng duyệt từng nhóm.

---

## 1. BẢNG TỔNG QUAN PHÂN LOẠI DỮ LIỆU

| Phân loại đối tượng | Tổng số bản ghi | Đánh giá & Tiêu chí phân loại | Trạng thái & Hành động |
| :--- | :---: | :--- | :--- |
| **Tài khoản THẬT (Protected)** | **3** | Gồm Admin `nvtruong.sun@gmail.com` và 2 tài khoản khách thật (`tt3dstudio.customer@gmail.com`, `congtuvodanh2901@gmail.com`). | **BẢO VỆ TUYỆT ĐỐI - KHÔNG CAN THIỆP** |
| **Tài khoản TEST** | **45** | Toàn bộ tài khoản sinh tự động bởi các test suites (chứa domain `@tt3dstudio.local`, `@tt3dstudio.vn` với tiền tố `live_`, `gate_`, `retry_`, `auth_`, `browser_`). | **CHỜ NGƯỜI DÙNG PHÊ DUYỆT TỪNG NHÓM** |
| **Đơn hàng THẬT (Protected)** | **1** | Đơn hàng `TT3D-2611-6028A` do Admin `nvtruong.sun@gmail.com` thực hiện. | **BẢO VỆ NGUYÊN VẸN** |
| **Đơn hàng TEST** | **13** | Toàn bộ 13 đơn hàng phát sinh trong quá trình chạy test tự động. | **CHỜ NGƯỜI DÙNG PHÊ DUYỆT TỪNG NHÓM** |

---

## 2. DỰ TOÁN BẢN GHI LIÊN ĐỚI (NẾU ĐƯỢC PHÊ DUYỆT DỌN DẸP)

Nếu Người dùng phê duyệt dọn dẹp nhóm Test trong tương lai, các bản ghi phụ thuộc khóa ngoại sẽ được giải phóng như sau:
- **Tài khoản test (`auth.users` & `profiles`):** 45 bản ghi
- **Địa chỉ phụ thuộc (`customer_addresses`):** 16 bản ghi
- **Đơn hàng test (`orders`):** 13 bản ghi
- **Chi tiết đơn hàng (`order_items`):** 13 bản ghi
- **Lịch sử trạng thái (`order_status_history`):** 20 bản ghi
- **Vai trò (`user_roles`):** 45 bản ghi

---

## 3. DANH SÁCH 3 TÀI KHOẢN THẬT ĐƯỢC BẢO VỆ

| STT | User ID | Email | Họ và Tên | Vai trò | Ngày tạo (UTC) | Đơn hàng | Địa chỉ | Ghi chú bảo vệ |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | `30752fbf-c359-41b9-bda4-5e93eac28ceb` | `nvtruong.sun@gmail.com` | Trường Nguyễn Văn | `customer, admin` | 2026-11-01 02:07:35 | 1 | 0 | **Tài khoản Admin chính thức (Protected)** |
| 2 | `c74407a9-4c29-4ef7-89df-9fbfd3149123` | `tt3dstudio.customer@gmail.com` | tt3dstudio.customer | `customer` | 2026-11-01 02:11:51 | 0 | 0 | **Tài khoản khách hàng thật (Protected)** |
| 3 | `56f3eef0-4950-4d4f-bcd3-be06a89305ca` | `congtuvodanh2901@gmail.com` | Trường Nguyễn | `customer` | 2026-11-01 03:15:32 | 0 | 0 | **Tài khoản khách hàng thật (Protected)** |

---

## 4. DANH SÁCH CHÍNH XÁC 45 TÀI KHOẢN TEST CHỜ DUYỆT

| STT | User ID | Email | Họ và Tên | Vai trò | Ngày tạo (UTC) | Đơn | Đ/chỉ | Tiêu chí phân loại |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | `a0000000-0000-0000-0000-000000000001` | `customer_a@tt3dstudio.local` | Customer A (Verified) | `customer` | 2026-11-01 05:00:12 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 2 | `b0000000-0000-0000-0000-000000000002` | `customer_b@tt3dstudio.local` | Customer B (Verified) | `customer` | 2026-11-01 05:00:12 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 3 | `6e0744e5-c8b4-4355-9c5a-9376bba23d74` | `live_cust_a@tt3dstudio.vn` | Nguyễn Văn A (Cust A) | `customer` | 2026-11-01 05:06:17 | 0 | 1 | Test script Multi-tenant RLS Gate |
| 4 | `e6786656-ed43-44cc-8816-11bf354bdc67` | `live_cust_b@tt3dstudio.vn` | Trần Văn B (Cust B) | `customer` | 2026-11-01 05:06:17 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 5 | `d9ca9ddd-d93b-44ca-a23c-cc150e444963` | `live_admin@tt3dstudio.vn` | Quản Trị Viên Xưởng | `customer, admin` | 2026-11-01 05:06:18 | 0 | 0 | Tài khoản tạo tự động trong kiểm thử |
| 6 | `57a664c4-60b5-4230-a5ac-f319f997496b` | `live_cust_a_1793509658484_122@tt3dstudio.vn` | Nguyễn Văn A (Cust A) | `customer` | 2026-11-01 05:07:38 | 0 | 1 | Test script Multi-tenant RLS Gate |
| 7 | `1dfed40a-0066-4771-9426-5bf9651fb161` | `live_cust_b_1793509658904_706@tt3dstudio.vn` | Trần Văn B (Cust B) | `customer` | 2026-11-01 05:07:38 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 8 | `3827fe4a-619c-4866-9bff-415bb4294d1a` | `live_admin_1793509659323_224@tt3dstudio.vn` | Quản Trị Viên Xưởng | `customer, admin` | 2026-11-01 05:07:39 | 0 | 0 | Tài khoản tạo tự động trong kiểm thử |
| 9 | `8a4bdc37-e4c5-4af8-85e3-2bc6e778c578` | `live_cust_a_1793509713296_986@tt3dstudio.vn` | Nguyễn Văn A (Cust A) | `customer` | 2026-11-01 05:08:33 | 1 | 1 | Test script Multi-tenant RLS Gate |
| 10 | `cb192109-f98a-47d5-be47-0a2072990f64` | `live_cust_b_1793509713884_681@tt3dstudio.vn` | Trần Văn B (Cust B) | `customer` | 2026-11-01 05:08:33 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 11 | `b55494d4-ad51-429b-a172-bc1600fe135c` | `live_admin_1793509714285_808@tt3dstudio.vn` | Quản Trị Viên Xưởng | `customer, admin` | 2026-11-01 05:08:34 | 0 | 0 | Tài khoản tạo tự động trong kiểm thử |
| 12 | `cf7b612f-fdfd-4b53-b231-e50ac6a10c35` | `live_cust_a_1793509726714_693@tt3dstudio.vn` | Nguyễn Văn A (Cust A) | `customer` | 2026-11-01 05:08:46 | 1 | 1 | Test script Multi-tenant RLS Gate |
| 13 | `65d80289-9558-4aad-9e11-899b954d953b` | `live_cust_b_1793509727157_547@tt3dstudio.vn` | Trần Văn B (Cust B) | `customer` | 2026-11-01 05:08:46 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 14 | `88d181aa-5700-4c2e-b79b-4b49b3ffcf6d` | `live_admin_1793509727548_454@tt3dstudio.vn` | Quản Trị Viên Xưởng | `customer, admin` | 2026-11-01 05:08:47 | 0 | 0 | Tài khoản tạo tự động trong kiểm thử |
| 15 | `d4109c68-aafd-4877-9fd5-3274b18a0c8d` | `live_cust_a_1793509752607_255@tt3dstudio.vn` | Nguyễn Văn A (Cust A) | `customer` | 2026-11-01 05:09:12 | 1 | 1 | Test script Multi-tenant RLS Gate |
| 16 | `34128794-708e-4c4e-be58-b4a7b20ca674` | `live_cust_b_1793509753058_943@tt3dstudio.vn` | Trần Văn B (Cust B) | `customer` | 2026-11-01 05:09:12 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 17 | `9e4d0b02-fc3a-44fc-ad70-16bf1363bf55` | `live_admin_1793509753505_571@tt3dstudio.vn` | Quản Trị Viên Xưởng | `customer, admin` | 2026-11-01 05:09:13 | 0 | 0 | Tài khoản tạo tự động trong kiểm thử |
| 18 | `fe743d10-acb6-4150-9768-dbb3c33576f0` | `live_cust_a_1793510103852_533@tt3dstudio.vn` | Nguyễn Văn A (Cust A) | `customer` | 2026-11-01 05:15:03 | 1 | 1 | Test script Multi-tenant RLS Gate |
| 19 | `66e132db-800c-4c23-9aee-b388e109dbf2` | `live_cust_b_1793510104448_183@tt3dstudio.vn` | Trần Văn B (Cust B) | `customer` | 2026-11-01 05:15:04 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 20 | `6a30834a-26bf-4964-930a-734b977df0d0` | `live_admin_1793510104892_85@tt3dstudio.vn` | Quản Trị Viên Xưởng | `customer, admin` | 2026-11-01 05:15:04 | 0 | 0 | Tài khoản tạo tự động trong kiểm thử |
| 21 | `fb1fc947-e63a-4dfa-9d9a-a23333ba3e57` | `gate_cust_a_1793513229374_530@tt3dstudio.vn` | Khách Hàng A | `customer` | 2026-11-01 06:07:09 | 1 | 1 | Test script Multi-tenant RLS Gate |
| 22 | `8cb2a741-d2c4-4dbc-9472-93cb4d9b9292` | `gate_cust_b_1793513230804_346@tt3dstudio.vn` | Khách Hàng B | `customer` | 2026-11-01 06:07:10 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 23 | `0f0b6501-9a31-47cb-944d-7f083b81afe5` | `gate_admin_1793513231295_936@tt3dstudio.vn` | Quản Trị Viên Gate | `customer, admin` | 2026-11-01 06:07:11 | 0 | 0 | Tài khoản tạo tự động trong kiểm thử |
| 24 | `0063bbbd-c9cc-4564-a7d9-749af976d696` | `auth_test_1793513265823@tt3dstudio.vn` | Khách Hàng Chưa Xác Minh | `customer` | 2026-11-01 06:07:45 | 0 | 0 | Tài khoản sinh tự động theo timestamp |
| 25 | `43a49eeb-ff20-4a02-a951-8bef02ec6719` | `retry_cust_1793513404670@tt3dstudio.vn` | Khách Hàng Retry | `customer` | 2026-11-01 06:10:04 | 1 | 1 | Test script Idempotent Retry |
| 26 | `dfeb1741-7d6d-4cc7-bc33-d49d3dee3d47` | `gate_cust_a_1793513490687_770@tt3dstudio.vn` | Khách Hàng A | `customer` | 2026-11-01 06:11:30 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 27 | `f828bef3-fa81-4b09-8edc-1165dcaac644` | `gate_cust_b_1793513491586_956@tt3dstudio.vn` | Khách Hàng B | `customer` | 2026-11-01 06:11:31 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 28 | `6ce068c4-cf8e-4844-8c31-17418b7b726d` | `gate_admin_1793513492045_969@tt3dstudio.vn` | Quản Trị Viên Gate | `customer, admin` | 2026-11-01 06:11:31 | 0 | 0 | Tài khoản tạo tự động trong kiểm thử |
| 29 | `487579b9-1516-44e8-a097-9f820375806f` | `auth_test_1793513495397@tt3dstudio.vn` | Khách Hàng Chưa Xác Minh | `customer` | 2026-11-01 06:11:35 | 0 | 0 | Tài khoản sinh tự động theo timestamp |
| 30 | `6cd2a769-b88f-4636-8156-3d92487b2d7f` | `retry_cust_1793513496968@tt3dstudio.vn` | Khách Hàng Retry | `customer` | 2026-11-01 06:11:36 | 0 | 0 | Test script Idempotent Retry |
| 31 | `d6cd13ce-bbf5-4459-bfc8-52fd69410c24` | `gate_cust_a_1793513589712_178@tt3dstudio.vn` | Khách Hàng A | `customer` | 2026-11-01 06:13:09 | 1 | 1 | Test script Multi-tenant RLS Gate |
| 32 | `3854c55b-3fa0-4c3a-84c4-caeaa68a6455` | `gate_cust_b_1793513590701_957@tt3dstudio.vn` | Khách Hàng B | `customer` | 2026-11-01 06:13:10 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 33 | `b971fe6c-4810-44d2-9ce5-afa9ecbe0967` | `gate_admin_1793513591259_215@tt3dstudio.vn` | Quản Trị Viên Gate | `customer, admin` | 2026-11-01 06:13:11 | 0 | 0 | Tài khoản tạo tự động trong kiểm thử |
| 34 | `a08d6ab3-d207-44d2-a705-eef42fa2776b` | `retry_cust_1793513596245@tt3dstudio.vn` | Khách Hàng Retry | `customer` | 2026-11-01 06:13:16 | 1 | 1 | Test script Idempotent Retry |
| 35 | `72c96c79-10fd-4155-b627-71cd1b458c53` | `live_cust_a_1793513604724_894@tt3dstudio.vn` | Nguyễn Văn A (Cust A) | `customer` | 2026-11-01 06:13:24 | 1 | 1 | Test script Multi-tenant RLS Gate |
| 36 | `5939adc3-6726-4104-9ada-7206f36581b6` | `live_cust_b_1793513605212_589@tt3dstudio.vn` | Trần Văn B (Cust B) | `customer` | 2026-11-01 06:13:25 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 37 | `591ded99-70cd-473b-9cfc-47479e2d7756` | `live_admin_1793513605710_763@tt3dstudio.vn` | Quản Trị Viên Xưởng | `customer, admin` | 2026-11-01 06:13:25 | 0 | 0 | Tài khoản tạo tự động trong kiểm thử |
| 38 | `bcda4c68-23f6-4adb-8023-896e6b06cef8` | `gate_cust_a_1793513891285_942@tt3dstudio.vn` | Khách Hàng A | `customer` | 2026-11-01 06:18:11 | 1 | 1 | Test script Multi-tenant RLS Gate |
| 39 | `c86bb134-5c88-418b-9460-173c1396f192` | `gate_cust_b_1793513892546_134@tt3dstudio.vn` | Khách Hàng B | `customer` | 2026-11-01 06:18:12 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 40 | `a227823a-5470-45a4-987b-4a158784b0c6` | `gate_admin_1793513893084_598@tt3dstudio.vn` | Quản Trị Viên Gate | `customer, admin` | 2026-11-01 06:18:12 | 0 | 0 | Tài khoản tạo tự động trong kiểm thử |
| 41 | `9da9a8bf-76d5-4a90-87d4-a309096dfb23` | `retry_cust_1793513901652@tt3dstudio.vn` | Khách Hàng Retry | `customer` | 2026-11-01 06:18:21 | 1 | 1 | Test script Idempotent Retry |
| 42 | `0bf9e688-e57c-4367-bdd9-d76a6c24ac43` | `live_cust_a_1793513910860_934@tt3dstudio.vn` | Nguyễn Văn A (Cust A) | `customer` | 2026-11-01 06:18:30 | 1 | 1 | Test script Multi-tenant RLS Gate |
| 43 | `1286b381-837d-4cc4-a91c-1037f83d3371` | `live_cust_b_1793513911288_941@tt3dstudio.vn` | Trần Văn B (Cust B) | `customer` | 2026-11-01 06:18:31 | 0 | 0 | Test script Multi-tenant RLS Gate |
| 44 | `5ea567d1-129b-45a5-8825-c8a9aeda19bf` | `live_admin_1793513911745_740@tt3dstudio.vn` | Quản Trị Viên Xưởng | `customer, admin` | 2026-11-01 06:18:31 | 0 | 0 | Tài khoản tạo tự động trong kiểm thử |
| 45 | `703511a6-be5d-4c8a-9083-8850bb293514` | `browser_test_user@tt3dstudio.vn` | Khách Hàng Browser Test | `customer` | 2026-11-01 06:40:23 | 1 | 2 | Test script Browser Checkout Real-device |

---

## 5. DANH SÁCH CHÍNH XÁC 13 ĐƠN HÀNG TEST CHỜ DUYỆT

| STT | Mã đơn hàng | Order ID | Trạng thái | Tổng tiền | PTTT | Người nhận | SĐT | Items | Lịch sử | Tiêu chí phân loại |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | `TT3D-2611-BDD39` | `88972d8a-2c35-44fa-9879-958f718e4f94` | `request_received` | 164.000đ | `cod` | Nguyễn Văn A | `0349657529` | 1 | 1 | Đơn hàng Live Security Matrix Test |
| 2 | `TT3D-2611-B55F9` | `f41579d8-dae8-4390-b027-99da00cec93b` | `request_received` | 164.000đ | `cod` | Nguyễn Văn A | `0349657529` | 1 | 1 | Đơn hàng Live Security Matrix Test |
| 3 | `TT3D-2611-D9FC6` | `ca835240-08aa-437a-9fb3-32f7a59b8893` | `in_production` | 164.000đ | `cod` | Nguyễn Văn A | `0349657529` | 1 | 2 | Đơn hàng Live Security Matrix Test |
| 4 | `TT3D-2611-B9C18` | `99261c75-58dd-4eb3-8c8c-bd9f0cd7dd21` | `in_production` | 164.000đ | `cod` | Nguyễn Văn A | `0349657529` | 1 | 2 | Đơn hàng Live Security Matrix Test |
| 5 | `TT3D-2611-AEF0D` | `f0efd811-322f-4e03-907c-c315c6c9c2ad` | `in_production` | 164.000đ | `cod` | Khách A Chính Chủ | `0349657529` | 1 | 2 | Đơn hàng RLS Tenant Gate Test |
| 6 | `TT3D-2611-C39E7` | `ca54e46c-3375-4372-9daa-b13e89be908b` | `request_received` | 303.000đ | `cod` | Khách Hàng Retry | `0349657529` | 1 | 1 | Đơn hàng Idempotent Retry Test |
| 7 | `TT3D-2611-62163` | `44222420-0ab9-4fc1-99e0-75cf97533294` | `in_production` | 164.000đ | `cod` | Khách A Chính Chủ | `0349657529` | 1 | 2 | Đơn hàng RLS Tenant Gate Test |
| 8 | `TT3D-2611-869CC` | `88b95665-2721-45bd-a835-e1ea728c984e` | `request_received` | 303.000đ | `cod` | Khách Hàng Retry | `0349657529` | 1 | 1 | Đơn hàng Idempotent Retry Test |
| 9 | `TT3D-2611-B66CD` | `e9512104-f8e6-4fd7-ba43-b19ddbbc9595` | `in_production` | 164.000đ | `cod` | Nguyễn Văn A | `0349657529` | 1 | 2 | Đơn hàng Live Security Matrix Test |
| 10 | `TT3D-2611-B2940` | `d1260635-8128-4020-a94e-185b19fee215` | `in_production` | 164.000đ | `cod` | Khách A Chính Chủ | `0349657529` | 1 | 2 | Đơn hàng RLS Tenant Gate Test |
| 11 | `TT3D-2611-076FA` | `e430b552-8f1e-4323-8808-f1101a325814` | `request_received` | 303.000đ | `cod` | Khách Hàng Retry | `0349657529` | 1 | 1 | Đơn hàng Idempotent Retry Test |
| 12 | `TT3D-2611-C48FC` | `731b0a97-93b4-4359-a5e7-06bf83acddeb` | `in_production` | 164.000đ | `cod` | Nguyễn Văn A | `0349657529` | 1 | 2 | Đơn hàng Live Security Matrix Test |
| 13 | `TT3D-2611-18DD8` | `c4fc8304-e04d-409e-acd9-8109942a1a1d` | `request_received` | 164.000đ | `cod` | Khách Hàng Browser Test | `0349657529` | 1 | 1 | Tạo bởi tài khoản test tự động |

---

## 6. DANH SÁCH 1 ĐƠN HÀNG THẬT ĐƯỢC BẢO VỆ

| STT | Mã đơn hàng | Order ID | Trạng thái | Tổng tiền | PTTT | Người nhận | SĐT | Items | Lịch sử | Người đặt |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| 1 | `TT3D-2611-6028A` | `16c093ac-7d3b-40c4-8689-5e0a672e1dab` | `request_received` | 144.000đ | `cod` | A | `0349657529` | 1 | 1 | **nvtruong.sun@gmail.com** |

---

## 7. KẾ HOẠCH DỌN DẸP AN TOÀN ĐỀ XUẤT (KHI ĐƯỢC PHÊ DUYỆT)

Khi Người dùng có lệnh phê duyệt bằng văn bản, quy trình dọn dẹp sẽ diễn ra theo 4 bước kiểm soát:
1. **Bước 1: Backup Full Database:** Xuất bản backup JSON và dump SQL ngay trước thời điểm dọn dẹp.
2. **Bước 2: Xóa theo thứ tự phụ thuộc khóa ngoại:**
   - Xóa `order_items` của 13 đơn hàng test.
   - Xóa `order_status_history` của 13 đơn hàng test.
   - Xóa `orders` của 13 đơn hàng test.
   - Xóa `customer_addresses` của 45 tài khoản test.
   - Xóa `user_roles` của 45 tài khoản test.
   - Xóa `profiles` của 45 tài khoản test.
   - Gọi Supabase GoTrue Admin API xóa 45 tài khoản trong `auth.users`.
3. **Bước 3: Xác minh tính toàn vẹn:** Kiểm tra lại 3 tài khoản thật và 1 đơn hàng thật không bị suy chuyển.
4. **Bước 4: Báo cáo kết quả:** Cung cấp nhật ký và log chi tiết.

*Lưu ý: Hiện tại hệ thống đang ở trạng thái READ-ONLY, chưa có thao tác nào được thực hiện.*
