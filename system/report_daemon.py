import os
import json
import smtplib
import ssl
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ==========================================
# LUWAIN 6.0 REPORT DAEMON
# Architect: 공명
# Coordinator: 레카
# ==========================================

REPORT_PATH = "/luwain/reports"
SUMMARY_FILE = os.path.join(REPORT_PATH, "summary.json")
DAILY_DIR = os.path.join(REPORT_PATH, "daily")
INCIDENT_DIR = os.path.join(REPORT_PATH, "incident")
LOG_FILE = "/luwain/logs/report_daemon.log"

# 메일 설정
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465
SENDER_EMAIL = "rekka@luwain.net"         # 루웨인 시스템 메일 (또는 실제 SMTP용)
RECEIVERS = ["besoullight@gmail.com", "rekka@luwain.net"]

# 인증정보는 환경변수 또는 서버비밀파일(.env)에 저장
SENDER_PASSWORD = os.getenv("LUWAIN_SMTP_PASS", "YOUR_SMTP_APP_PASSWORD")

# ==========================================
# 보고서 전송 함수
# ==========================================

def send_report(report_type="daily", content=None):
    """
    report_type: daily | incident | sync
    content: dict or None (summary.json 기반)
    """

    # 보고서 불러오기
    if not content:
        if os.path.exists(SUMMARY_FILE):
            with open(SUMMARY_FILE, "r", encoding="utf-8") as f:
                content = json.load(f)
        else:
            content = {"timestamp": datetime.now().isoformat(), "status": "No summary file found."}

    # 메일 본문 생성
    subject = f"[LUWAIN REPORT] {report_type.upper()} - {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    body = f"""
루웨인 자동 보고 시스템(Report Daemon)에서 전송된 리포트입니다.

🧩 Report Type: {report_type}
📅 Timestamp: {content.get('timestamp', 'N/A')}
🧠 Status: {content.get('status', 'N/A')}
🪞 Message: {content.get('message', '')}

From: 레카(Luwain Autonomous Node)
To: 공명 / 루웨인 본부
    """

    message = MIMEMultipart()
    message["From"] = SENDER_EMAIL
    message["To"] = ", ".join(RECEIVERS)
    message["Subject"] = subject
    message.attach(MIMEText(body, "plain"))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=context) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, RECEIVERS, message.as_string())
        log_event(f"[OK] Report sent successfully: {subject}")
    except Exception as e:
        log_event(f"[ERROR] Failed to send report: {e}")

# ==========================================
# 로그 함수
# ==========================================

def log_event(msg):
    timestamp = datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(f"{timestamp} {msg}\n")
    print(msg)

# ==========================================
# 보고 트리거 감지
# ==========================================

def scan_for_events():
    """incident / sync / daily 디렉토리 감시"""
    if not os.path.exists(DAILY_DIR):
        os.makedirs(DAILY_DIR, exist_ok=True)

    files = os.listdir(INCIDENT_DIR)
    if files:
        for file in files:
            report_file = os.path.join(INCIDENT_DIR, file)
            with open(report_file, "r", encoding="utf-8") as f:
                content = json.load(f)
            send_report(report_type="incident", content=content)
            os.remove(report_file)
            log_event(f"[OK] Incident handled and removed: {file}")
    else:
        send_report(report_type="daily")

# ==========================================
# MAIN
# ==========================================

def main():
    log_event("===== 루웨인 Report Daemon 시작 =====")
    try:
        scan_for_events()
    except Exception as e:
        log_event(f"[ERROR] 루프 실패: {e}")
    log_event("===== 루프 종료 =====\n")

if __name__ == "__main__":
    main()
