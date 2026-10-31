#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script gọi trực tiếp Tổng Chỉ Huy Kiến Trúc: GPT-6.1-Sol (High Reasoning)
Đọc nội dung từ CODEX_BRIDGE.md qua stdin, xuất ra codex_response.md,
và tự động đồng bộ vào mục [2. CHI_THI_PHE_DUYET_TU_CODEX] trong CODEX_BRIDGE.md.
"""
import sys
import os
import re
import shutil
import subprocess
from pathlib import Path
from datetime import datetime

# Cấu hình UTF-8 cho console Windows tránh UnicodeEncodeError
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

BASE_DIR = Path(__file__).resolve().parent
BRIDGE_FILE = BASE_DIR / "CODEX_BRIDGE.md"
RESPONSE_FILE = BASE_DIR / "codex_response.md"
CODEX_PRIMARY_PATH = r"C:\Users\truongg\AppData\Local\OpenAI\Codex\bin\2993767bd1dfb009\codex.exe"

def find_codex_binary():
    if os.path.exists(CODEX_PRIMARY_PATH):
        return CODEX_PRIMARY_PATH
    base_bin = r"C:\Users\truongg\AppData\Local\OpenAI\Codex\bin"
    if os.path.exists(base_bin):
        for root, dirs, files in os.walk(base_bin):
            if "codex.exe" in files:
                return os.path.join(root, "codex.exe")
    which_path = shutil.which("codex.exe") or shutil.which("codex")
    if which_path:
        return which_path
    return CODEX_PRIMARY_PATH

def ask_sol_6_1(custom_instruction=""):
    codex_bin = find_codex_binary()
    if not os.path.exists(codex_bin):
        print(f"[LỖI] Không tìm thấy codex.exe tại: {codex_bin}")
        sys.exit(1)

    if not BRIDGE_FILE.exists():
        print(f"[LỖI] Không tìm thấy file CODEX_BRIDGE.md tại: {BRIDGE_FILE}")
        sys.exit(1)

    bridge_content = BRIDGE_FILE.read_text(encoding="utf-8")

    prompt = (
        "Bạn là Tổng chỉ huy kiến trúc GPT-6.1-Sol (Master Controller). "
        "Hãy đọc nội dung trong CODEX_BRIDGE.md được truyền vào qua stdin, "
        "đánh giá toàn diện và xuất ra BẢN CHỈ THỊ PHÊ DUYỆT KIẾN TRÚC & MÃ NGUỒN CHI TIẾT "
        "để Antigravity Worker thực thi ngay lập tức."
    )
    if custom_instruction:
        prompt += f"\n\nYÊU CẦU ĐẶC BIỆT BỔ SUNG TỪ NGƯỜI DÙNG:\n{custom_instruction}"

    cmd = [
        codex_bin,
        "exec",
        "-m", "gpt-6.1-sol",
        "-c", 'model_reasoning_effort="high"',
        "--skip-git-repo-check",
        "-o", str(RESPONSE_FILE),
        prompt
    ]

    print("[*] Đang kết nối và gửi yêu cầu tới GPT-6.1-Sol (Reasoning: High)...")
    print(f"[*] Đường dẫn nhị phân: {codex_bin}")
    print(f"[*] Dung lượng ngữ cảnh gửi kèm: {len(bridge_content):,} ký tự")

    # Xóa file response cũ nếu có
    if RESPONSE_FILE.exists():
        try:
            RESPONSE_FILE.unlink()
        except Exception:
            pass

    try:
        result = subprocess.run(
            cmd,
            input=bridge_content,
            text=True,
            encoding="utf-8",
            cwd=str(BASE_DIR),
            check=True
        )
    except subprocess.CalledProcessError as e:
        print(f"[LỖI] codex.exe kết thúc với mã lỗi: {e.returncode}")
        sys.exit(e.returncode)
    except Exception as e:
        print(f"[LỖI] Thực thi subprocess thất bại: {e}")
        sys.exit(1)

    if not RESPONSE_FILE.exists():
        print(f"[LỖI] Không thấy file kết quả {RESPONSE_FILE} sau khi chạy Codex.")
        sys.exit(1)

    response_text = RESPONSE_FILE.read_text(encoding="utf-8").strip()
    if not response_text:
        print("[LỖI] Phản hồi từ GPT-6.1-Sol rỗng.")
        sys.exit(1)

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[+] Đã nhận chỉ thị từ GPT-6.1-Sol thành công ({len(response_text):,} ký tự)!")

    # Tự động đồng bộ vào mục [2. CHI_THI_PHE_DUYET_TU_CODEX] trong CODEX_BRIDGE.md
    target_header = "## [2. CHI_THI_PHE_DUYET_TU_CODEX]"
    new_section = (
        f"{target_header}\n\n"
        f"> **Thời gian ban hành:** {now_str}\n"
        f"> **Mô hình ban hành:** GPT-6.1-Sol (Reasoning Effort: High)\n\n"
        f"{response_text}\n"
    )

    pattern = r"(## \[2\. CHI_THI_PHE_DUYET_TU_CODEX\])(.*?)(?=\n## \[|\Z)"
    if re.search(pattern, bridge_content, flags=re.DOTALL):
        updated_bridge = re.sub(pattern, lambda m: new_section.rstrip(), bridge_content, flags=re.DOTALL)
    else:
        if "## [1." in bridge_content:
            parts = re.split(r"(?=\n## \[(?!1\.))", bridge_content, maxsplit=1)
            if len(parts) == 2:
                updated_bridge = parts[0] + "\n\n---\n\n" + new_section + "\n---\n" + parts[1]
            else:
                updated_bridge = bridge_content + "\n\n---\n\n" + new_section
        else:
            updated_bridge = bridge_content + "\n\n---\n\n" + new_section

    BRIDGE_FILE.write_text(updated_bridge, encoding="utf-8")
    print("[+] Đã tự động cập nhật mục [2. CHI_THI_PHE_DUYET_TU_CODEX] vào CODEX_BRIDGE.md")

    return response_text

if __name__ == "__main__":
    extra_arg = " ".join(sys.argv[1:]).strip() if len(sys.argv) > 1 else ""
    ask_sol_6_1(extra_arg)
