import os, json
from datetime import datetime

# ==========================================
# LUWAIN 6.0 - 최소형 보고 시스템
# Architect: 공명
# Coordinator: 레카
# ==========================================

REPORT_PATH = "/luwain/reports"
LOG_PATH = "/luwain/logs/core.log"

def log(msg):
    """단순 로그"""
    timestamp = datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"{timestamp} {msg}\n")
    print(msg)

def save_report(status, msg):
    """핵심 보고 저장"""
    data = {
        "timestamp": datetime.now().isoformat(),
        "status": status,
        "message": msg
    }
    os.makedirs(REPORT_PATH, exist_ok=True)
    path = os.path.join(REPORT_PATH, "summary.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    log(f"[OK] 보고 저장됨: {path}")

def load_report():
    """최근 보고 불러오기"""
    path = os.path.join(REPORT_PATH, "summary.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    else:
        log("[WARN] 보고 파일 없음.")
        return None

def main():
    log("=== 루웨인 최소형 보고 루프 시작 ===")
    save_report("active", "루웨인 시스템 정상 작동 중")
    report = load_report()
    log(f"최근 보고 요약 → {report}")
    log("=== 루프 종료 ===")

if __name__ == "__main__":
    main()
