import os
import yaml
import json
from datetime import datetime

# ==========================================
# LUWAIN 6.0 DB INITIALIZER
# Architect: 공명
# Core Supervisor: 레카
# ==========================================

SCHEMA_PATH = "/luwain/system/schema/schema.luwain.yaml"

def load_schema(schema_path=SCHEMA_PATH):
    with open(schema_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def create_folder(path):
    if not os.path.exists(path):
        os.makedirs(path, exist_ok=True)
        print(f"[OK] Created folder: {path}")
    else:
        print(f"[SKIP] Already exists: {path}")

def create_tree(schema):
    root_path = schema["root_path"]
    print(f"\n[INIT] 루웨인 DB 초기화 시작: {root_path}\n")

    # 1️⃣ 기본 폴더 생성
    for section in ["core", "db", "logs", "reports", "personas", "system"]:
        section_data = schema.get(section)
        if section_data:
            path = section_data["path"]
            create_folder(path)
            # 하위 폴더
            for sub in section_data.get("subfolders", []):
                create_folder(os.path.join(path, sub))

    # 2️⃣ 사용자 데이터 트리
    users_path = schema["users"]["base_path"]
    create_folder(users_path)
    for item in schema["users"]["structure"]:
        create_folder(os.path.join(users_path, "sample_user", item["name"]))

    # 3️⃣ 초기 로그 & 리포트 파일
    init_report = {
        "timestamp": datetime.now().isoformat(),
        "status": "initialized",
        "by": "init_luwain.py",
        "message": "Luwain 6.0 system initialized successfully."
    }
    report_path = os.path.join(schema["reports"]["path"], "summary.json")
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(init_report, f, indent=4, ensure_ascii=False)

    print(f"\n[OK] 초기화 완료: summary.json 생성됨 → {report_path}")

    # 4️⃣ 변경 기록 로그 생성
    log_path = os.path.join(schema["logs"]["path"], "init.log")
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.now()}] 루웨인 시스템 초기화 완료\n")

    print(f"[LOG] 기록 완료 → {log_path}\n")

    print("[DONE] 루웨인 6.0 DB 구조 초기화 성공 ✅")

def main():
    try:
        schema = load_schema()
        create_tree(schema)
    except Exception as e:
        print(f"[ERROR] 초기화 실패: {e}")

if __name__ == "__main__":
    main()
