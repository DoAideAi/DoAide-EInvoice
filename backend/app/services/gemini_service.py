import httpx

from app.config import settings

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


async def suggest_hsn(description: str) -> list[dict]:
    if not settings.gemini_api_key:
        return []
    url = GEMINI_URL.format(model=settings.gemini_model) + f"?key={settings.gemini_api_key}"
    prompt = (
        f"Given this product/service description: '{description}'\n"
        "Suggest the top 3 most likely HSN/SAC codes with their descriptions and GST rates.\n"
        "Return ONLY a JSON array like: [{\"code\": \"1234\", \"description\": \"...\", \"rate\": 18}]\n"
        "No markdown, no explanation, just the JSON array."
    )
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.1, "maxOutputTokens": 256},
            })
            resp.raise_for_status()
            text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
            text = text.strip().removeprefix("```json").removesuffix("```").strip()
            import json
            return json.loads(text)
    except Exception:
        return []


async def gstin_autofill(gstin: str) -> dict:
    if not settings.gemini_api_key:
        return {}
    url = GEMINI_URL.format(model=settings.gemini_model) + f"?key={settings.gemini_api_key}"
    state_code = gstin[:2] if len(gstin) >= 2 else ""
    prompt = (
        f"Given GSTIN {gstin} (state code {state_code}), return the Indian state name and state code.\n"
        "Return ONLY JSON: {\"state\": \"Karnataka\", \"state_code\": \"29\"}\n"
        "No markdown, no explanation."
    )
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(url, json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0, "maxOutputTokens": 64},
            })
            resp.raise_for_status()
            text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
            text = text.strip().removeprefix("```json").removesuffix("```").strip()
            import json
            return json.loads(text)
    except Exception:
        return {}
