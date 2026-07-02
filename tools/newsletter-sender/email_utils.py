import re
from typing import Optional
from urllib.parse import unquote

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def clean_email(raw: str) -> Optional[str]:
    line = raw.strip()
    if not line:
        return None
    line = re.sub(r"^\d+", "", line)
    line = unquote(line).strip().lower()
    if EMAIL_RE.match(line):
        return line
    return None


def parse_email_list(text: str) -> tuple[list[str], list[str]]:
    emails: list[str] = []
    seen: set[str] = set()
    skipped: list[str] = []

    for raw in text.splitlines():
        cleaned = clean_email(raw)
        if cleaned is None:
            if raw.strip():
                skipped.append(raw.strip())
            continue
        if cleaned in seen:
            continue
        seen.add(cleaned)
        emails.append(cleaned)

    return emails, skipped


def personalize_html(html: str, email: str) -> str:
    return (
        html.replace("{{{EMAIL}}}", email)
        .replace("{{{contact.email}}}", email)
        .replace("{{contact.email}}", email)
    )
