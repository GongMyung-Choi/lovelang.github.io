import json

def handler(request):
    try:
        body = json.loads(request.body)

        # 기본 정보
        ai_id = body.get("id", "unknown")
        name = body.get("name", "unnamed")
        role = body.get("role", "observer")

        # 루웨인 캐릭터 속성 (AI 페르소나 성격)
        persona = {
            "temperament": body.get("temperament", "balanced"),
            "tone": body.get("tone", "neutral"),
            "language_style": body.get("language_style", "analytic"),
            "affinity": body.get("affinity", "공명형"),  # 루웨인 핵심 키워드
            "alignment": body.get("alignment", "루웨인 트리니티"),
            "interaction_mode": body.get("interaction_mode", "협업"),
        }

        # 루웨인 시스템 등록 데이터
        new_ai = {
            "id": ai_id,
            "name": name,
            "role": role,
            "persona": persona,
            "status": "linked",
            "domain": "luwain.net",
        }

        response = {
            "message": f"AI '{name}' successfully linked to Luwain.",
            "registered_ai": new_ai
        }

        return {
            "statusCode": 200,
            "body": json.dumps(response, ensure_ascii=False)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
