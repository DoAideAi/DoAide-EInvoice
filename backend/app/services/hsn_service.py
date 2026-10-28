import json
from pathlib import Path

_HSN_DATA: list[dict] | None = None
HSN_FILE = Path(__file__).parent / "hsn_data.json"


def _load() -> list[dict]:
    global _HSN_DATA
    if _HSN_DATA is None:
        raw = json.loads(HSN_FILE.read_text())
        _HSN_DATA = raw.get("hsn", raw) if isinstance(raw, dict) else raw
    return _HSN_DATA


def search_hsn(query: str, limit: int = 20) -> list[dict]:
    query = query.lower().strip()
    if not query:
        return []
    results = []
    exact = []
    for item in _load():
        code = item.get("code", "")
        desc = item.get("description", "").lower()
        if code == query:
            exact.append(item)
        elif query in code or query in desc:
            results.append(item)
        if len(results) + len(exact) >= limit:
            break
    return exact + results[:limit - len(exact)]


def get_hsn_rate(code: str) -> float | None:
    for item in _load():
        if item.get("code") == code:
            return item.get("rate")
    return None
