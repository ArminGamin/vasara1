import json
from datetime import date
from pathlib import Path

STATE_FILE = Path(__file__).resolve().parent / "send_state.json"


def _load() -> dict:
    if not STATE_FILE.exists():
        return {}
    try:
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}


def _save(data: dict) -> None:
    STATE_FILE.write_text(json.dumps(data, indent=2), encoding="utf-8")


def get_sent_today() -> int:
    data = _load()
    today = date.today().isoformat()
    return int(data.get(today, 0))


def add_sent(count: int) -> int:
    data = _load()
    today = date.today().isoformat()
    data[today] = int(data.get(today, 0)) + count
    _save(data)
    return data[today]
