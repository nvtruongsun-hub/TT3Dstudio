# VIBECODE HYBRID ORCHESTRATION RULES (CODEX MASTER + ARGON 4 CO-PILOT + ANTIGRAVITY WORKER)

## I. TRẠNG THÁI QUY TẮC (RULE STATUS)
- **[SUSPENDED]:** Tạm dừng quy tắc "Argon 4 là bộ não duy nhất". Không còn khóa cứng tiến trình khi mất kết nối Chrome MCP.
- **[ACTIVE]:** Kích hoạt chế độ **Codex Master Control** kết hợp linh hoạt với Argon 4 và Antigravity.

---

## II. PHÂN CÔNG NHIỆM VỤ & GIAO TIẾP NỘI BỘ (ROLE & HANDOFF PROTOCOL)

### 1. CODEX (Bộ Phận Kiểm Soát Chính - Master Controller)
- **Trách nhiệm:** Điều phối toàn cục, phân tách task, kiểm duyệt kiến trúc, rà soát bảo mật/hiệu năng và phê duyệt mọi thay đổi trước khi áp dụng.
- **Quyền hạn:** 
  - Chủ động gọi MCP (cổng 9222/9223) để hội ý với Argon 4 khi cần tối ưu sâu.
  - Toàn quyền tự quyết định thuật toán và chỉ đạo trực tiếp Antigravity khi cả 2 cổng Argon 4 hết hạn mức.

### 2. GEMINI 4 ARGON HIGH (Cố Vấn Chiến Lược - Strategic Co-Brain)
- **Kết nối:** Cổng MCP `9222` (Primary) -> Tự động Failover sang cổng `9223` (Secondary) nếu gặp `Limit reached` hoặc `Flash-Lite`.
- **Quản lý phiên (Smart Session):** Giữ nguyên đoạn chat cũ nếu làm tiếp cùng một module; tự động bấm "New chat" nếu chuyển sang tính năng mới độc lập.

### 3. ANTIGRAVITY (Nhân Viên Triển Khai - Execution Worker)
- **Trách nhiệm:** 
  1. Đọc cấu trúc thư mục, trích xuất code hiện tại gửi lên cho Codex.
  2. Nhận bản thiết kế/đoạn code đã được Codex phê duyệt để ghi chính xác vào file.
  3. Chạy các bài test (pytest, linter, build) và trả toàn bộ log thực tế về cho Codex nghiệm thu.
- **Giới hạn:** Không tự ý thay đổi logic kiến trúc trái với chỉ đạo của Codex.

---

## III. MA TRẬN XỬ LÝ TÌNH HUỐNG (FAILOVER & AUTONOMY MATRIX)

| Tình trạng Tài khoản Argon 4 | Chế độ vận hành | Luồng xử lý công việc |
| :--- | :--- | :--- |
| **Acc 1 (9222) Hoạt động** | **Hybrid Mode 1** | Codex + Argon 4 (9222) thống nhất giải pháp $\rightarrow$ Antigravity thực thi. |
| **Acc 1 Hết hạn / Acc 2 (9223) Hoạt động** | **Hybrid Mode 2** | Tự động ngắt 9222 $\rightarrow$ Codex + Argon 4 (9223) thống nhất giải pháp $\rightarrow$ Antigravity thực thi. |
| **Cả Acc 1 & Acc 2 Hết hạn (Flash-Lite)** | **Codex Autonomous Mode** | Ngắt toàn bộ Chrome MCP $\rightarrow$ **Codex nắm 100% quyền Bộ não chính** $\rightarrow$ Giao lệnh trực tiếp cho Antigravity triển khai hoàn tất nhiệm vụ. |

---

## 4. HỆ THỐNG TỰ ĐỘNG NHẬN DIỆN TASK & ĐIỀU PHỐI SKILL/MCP (ZERO-PROMPT AUTONOMOUS DISPATCH MATRIX)

> [!IMPORTANT]
> **SYSTEM DIRECTIVE (MANDATORY):**
> Người dùng **KHÔNG CẦN** và **KHÔNG BẮT BUỘC** phải nhớ hay chỉ định tên Skill, MCP Server, hoặc Engine trong câu lệnh.
> Khi nhận bất kỳ yêu cầu (task) nào, Agent **BẮT BUỘC** phải tự động phân tích ý định (Intent Analysis), đối chiếu với Ma trận Điều phối 8 Nhóm dưới đây để tự động nạp `SKILL.md`, kích hoạt `MCP Tool` hoặc gọi `Local Engine` tương ứng.

---

### I. QUY TRÌNH KÍCH HOẠT TỰ ĐỘNG 3 BƯỚC (ZERO-PROMPT DISPATCH PROTOCOL)

Mọi yêu cầu từ người dùng phải đi qua pipeline 3 bước ngầm định trước khi sinh phản hồi hoặc viết code:

1. **Bước 1: DETECT (Nhận diện & Phân rã ý định):**
   - Quét ngữ nghĩa, từ khóa, định dạng file (`.mp4`, `.pptx`, `.py`, `.tsx`, `.pdb`...) và mục tiêu đầu ra của người dùng.
   - Phân loại yêu cầu vào **1 hoặc nhiều nhóm** trong **Ma trận 8 Nhóm Lĩnh vực** (Mục II).
   - Nếu tác vụ phức tạp (Multi-stage), tự động lập chuỗi điều phối (Chaining) kết hợp nhiều nhóm (*Ví dụ: Tạo Slide PPTX -> Xuất MP4 ngầm -> Đưa vào CapCut thêm hiệu ứng & phụ đề*).

2. **Bước 2: SELECT & BIND (Nạp Skill & Kết nối MCP/Engine):**
   - **Đối với Skill:** Tự động đọc file `SKILL.md` của các skill được ánh xạ để nạp quy chuẩn kỹ thuật vào ngữ cảnh làm việc.
   - **Đối với MCP Server:** Kiểm tra trạng thái và gọi trực tiếp các hàm (tool calls) của MCP tương ứng (`capcut-api`, `chrome-devtools`, `pro-account-1`, `pro-account-2`).
   - **Đối với Local Engine:** Trỏ đúng đường dẫn tuyệt đối (Absolute Path) tới môi trường thực thi đã cài đặt trên máy (xem Mục III).

3. **Bước 3: EXECUTE & REPORT (Thực thi ngầm & Báo cáo minh bạch):**
   - **Ưu tiên chạy ngầm (Headless / Silent Mode 100%):** Không làm gián đoạn màn hình của người dùng (dùng cờ Headless cho CLI, `WithWindow=False` cho COM API).
   - **Hiển thị Routing Header:** Ở đầu mỗi câu trả lời hoặc tiến trình thực thi, báo cáo ngắn gọn cấu hình đã tự động kích hoạt theo mẫu:
     > 🎯 **[Auto-Router]** `Nhóm Task`: [Tên nhóm] | `Skills`: [Danh sách skill] | `MCP/Engines`: [Danh sách MCP/Engine]

---

### II. MA TRẬN NHẬN DIỆN & ĐIỀU PHỐI 8 NHÓM LĨNH VỰC (TASK ROUTING MATRIX)

| Nhóm | Lĩnh vực & Dấu hiệu nhận diện (Trigger Intent / Keywords) | Skills tự động nạp (`SKILL.md`) | MCP Servers & Local Engines tự động gọi | Quy tắc thực thi cốt lõi (Execution Rules) |
| :--- | :--- | :--- | :--- | :--- |
| **Nhóm 1** | **Biên tập Video, Hiệu ứng, Âm thanh**<br>*(cắt ghép video, tạo hiệu ứng, sub, caption, lồng tiếng, keyframe, motion graphics, intro/outro, mp4, capcut)* | `automation`<br>`incremental-implementation` | **MCP:** `capcut-api` (`create_draft`, `add_video`, `add_audio`, `add_text`, `add_effect`, `add_subtitle`, `add_keyframe`, `save_draft`)<br>**Engine:** `Remotion`, `MoviePy`, `Manim` | - Dùng **Remotion/Manim** render các đoạn motion graphics/toán học phức tạp dưới nền.<br>- Dùng **capcut-api MCP** can thiệp trực tiếp `draft_content.json` để lắp ghép timeline mà không cần mở giao diện CapCut. |
| **Nhóm 2** | **Bài thuyết trình, Slide, PPTX**<br>*(tạo slide, powerpoint, pptx, bài giảng, thuyết trình, hiệu ứng chuyển trang, xuất slide ra video)* | `automation`<br>`generative_ui` | **Engine:** `Slidev`, `python-pptx`, `pywin32` (PowerPoint COM API) | - Slide hiện đại/Web-based: Dùng **Slidev** (`npx slidev export`).<br>- File `.pptx` chuẩn Office: Dùng `python-pptx` dựng bố cục + `pywin32` (`WithWindow=False`) gán Animation/Transition và gọi `CreateVideo()` ngầm. |
| **Nhóm 3** | **Phát triển Web / Frontend / Extension**<br>*(web, giao diện, UI/UX, React, Vue, CSS, HTML, Chrome Extension, kiểm tra giao diện, DOM)* | `modern-web-guidance`<br>`chrome-extensions`<br>`generative_ui`<br>`browser-testing-with-devtools`<br>`code-review-and-quality` | **MCP:** `chrome-devtools` (inspect DOM, console log, network, visual audit) | - Thiết kế tuân thủ chuẩn `modern-web-guidance`.<br>- Sau khi dựng UI/Extension, tự động bật `chrome-devtools` MCP để kiểm tra lỗi Console, Network và bố cục hiển thị thực tế. |
| **Nhóm 4** | **Lập trình Backend / API / Database**<br>*(server, REST API, GraphQL, database, SQL, microservices, bảo mật, xác thực, tối ưu code)* | `api-and-interface-design`<br>`security-and-hardening`<br>`test-driven-development`<br>`code-simplification`<br>`code-review-and-quality` | **Runtime:** Python 3.13 / Node.js v24.20.0 | - Thiết kế contract API rõ ràng trước khi code.<br>- Viết test tự động (`TDD`) và kiểm tra lỗ hổng bảo mật (`security-and-hardening`) trước khi bàn giao. |
| **Nhóm 5** | **Gỡ lỗi, Fix Bug, Khắc phục sự cố**<br>*(lỗi, bug, crash, exception, không chạy được, treo máy, sai kết quả, kiểm tra nguyên nhân)* | `debugging-and-error-recovery`<br>`doubt-driven-development`<br>`test-driven-development` | **MCP:** `chrome-devtools` (nếu là lỗi Web)<br>**Brain MCP:** `pro-account-1` / `pro-account-2` (nếu lỗi kiến trúc sâu) | - Không đoán mò: Thu thập stack trace, tái hiện lỗi, đặt giả thuyết (`doubt-driven-development`), sửa lỗi tận gốc và viết test chống tái phát. |
| **Nhóm 6** | **Tích hợp AI / LLM / Gemini API**<br>*(AI agent, prompt, Gemini API, multimodal, live audio/video stream, function calling, RAG)* | `gemini-api-dev`<br>`gemini-live-api-dev`<br>`gemini_search_docs` | **Brain MCP:** `pro-account-1`, `pro-account-2` | - Bắt buộc tra cứu `gemini_search_docs` và tuân thủ SDK mới nhất trong `gemini-api-dev` (không dùng code deprecated). |
| **Nhóm 7** | **Tự động hóa & Khởi tạo dự án mới**<br>*(ý tưởng mới, xây dựng hệ thống từ đầu, lập kế hoạch, kiến trúc, workflow tự động, đóng gói)* | `interview-me`<br>`idea-refine`<br>`spec-driven-development`<br>`planning-and-task-breakdown`<br>`incremental-implementation`<br>`shipping-and-launch` | **Brain MCP:** `pro-account-1`, `pro-account-2` (Hội ý Bộ não chính Argon 4 khi cần thiết kế vĩ mô) | - Đi theo luồng chuẩn: Làm rõ yêu cầu (`idea-refine`) -> Viết đặc tả (`spec-driven`) -> Chia nhỏ task (`planning`) -> Triển khai từng bước (`incremental`). |
| **Nhóm 8** | **Tra cứu thông tin & Nghiên cứu khoa học**<br>*(bài báo khoa học, y sinh, thuốc, phân tử, protein, cấu trúc 3D, thử nghiệm lâm sàng, tìm kiếm tài liệu)* | `literature-search-openalex`<br>`pubmed-database`<br>`clinical-trials-database`<br>`chembl-database`<br>`alphafold-database-fetch-and-analyze`<br>`pdb-database`<br>`biomolecular-structure-viewer` | **Brain MCP:** `pro-account-1`, `pro-account-2` | - Truy vấn trực tiếp dữ liệu từ cơ sở dữ liệu chuyên ngành (PubMed, ChEMBL, PDB, AlphaFold), trích dẫn nguồn và mã định danh chính xác. |

---

### III. BẢN ĐỒ ĐƯỜNG DẪN HỆ SINH THÁI CỤC BỘ (LOCAL ECOSYSTEM PATHS)

Khi điều phối tác vụ thuộc **Nhóm 1** và **Nhóm 2**, Agent tự động sử dụng các đường dẫn vật lý đã được cài đặt trên máy Windows 11 của người dùng:

1. **CapCut MCP Server (`capcut-api`):**
   * Đường dẫn: `c:\Users\truongg\OneDrive - Thuyloi University\Tài liệu\06. edit video\CapCutAPI\mcp_server.py`
2. **Remotion Video Effects Engine (Node.js/React):**
   * Đường dẫn: `c:\Users\truongg\OneDrive - Thuyloi University\Tài liệu\07. Skill tim kiem thong tin\Modern_Automation_Tools\video-effects-engine`
   * Lệnh render ngầm: `npx remotion render src/index.ts <CompositionId> out/output.mp4`
3. **Slidev Presentation Engine (Node.js/Vue):**
   * Đường dẫn: `c:\Users\truongg\OneDrive - Thuyloi University\Tài liệu\07. Skill tim kiem thong tin\Modern_Automation_Tools\slidev-presentation`
   * Lệnh xuất file ngầm: `npx slidev export --format pptx` (hoặc `--format pdf`)
4. **Python PPTX, COM API, Manim & MoviePy Engine:**
   * Đường dẫn thư mục: `c:\Users\truongg\OneDrive - Thuyloi University\Tài liệu\07. Skill tim kiem thong tin\Modern_Automation_Tools\Python_PPTX_Video_Engine`
   * Python thực thi (Venv): `c:\Users\truongg\OneDrive - Thuyloi University\Tài liệu\07. Skill tim kiem thong tin\Modern_Automation_Tools\Python_PPTX_Video_Engine\venv\Scripts\python.exe`

---

### IV. QUY TẮC VẬN HÀNH CHẠY NGẦM & QUẢN LÝ TÀI NGUYÊN (HEADLESS & RESOURCE GUARDRAILS)

1. **Chế độ im lặng tuyệt đối (Silent Execution):**
   * Khi gọi PowerPoint qua `win32com.client`, bắt buộc đặt `WithWindow=False` và bọc trong khối `try...finally` có gọi `presentation.Close()` và `ppt_app.Quit()`.
   * Khi chạy tác vụ nặng dưới nền trên PowerShell, sử dụng `Start-Process -WindowStyle Hidden` hoặc `pythonw.exe`.
2. **Dọn dẹp tiến trình treo (Zombie Process Cleanup):**
   * Nếu tiến trình COM của PowerPoint bị kẹt gây khóa file `.pptx`, tự động chạy lệnh giải phóng:
     `Stop-Process -Name "POWERPNT" -Force -ErrorAction SilentlyContinue`
3. **Điều phối GPU tuần tự (Sequential GPU Rendering):**
   * Không chạy đồng thời (parallel) việc render của Remotion, PowerPoint `CreateVideo` và CapCut Export để tránh tràn VRAM. Bắt buộc thực thi tuần tự: **Tạo Assets (Remotion/PPTX) -> Chờ hoàn tất file MP4 -> Đẩy vào CapCutAPI**.