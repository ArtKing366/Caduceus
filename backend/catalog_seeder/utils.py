import hashlib
import re
from typing import Set

POLISH_CHAR_MAP = str.maketrans(
    {
        "ą": "a", "ć": "c", "ę": "e", "ł": "l", "ń": "n",
        "ó": "o", "ś": "s", "ź": "z", "ż": "z",
        "Ą": "a", "Ć": "c", "Ę": "e", "Ł": "l", "Ń": "n",
        "Ó": "o", "Ś": "s", "Ź": "z", "Ż": "z",
    }
)


def slugify(text: str, max_length: int = 60) -> str:
    """Convert Polish/Unicode text into a deterministic URL-safe slug code."""
    normalized = text.translate(POLISH_CHAR_MAP).lower().strip()
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    normalized = normalized.strip("-")
    return (normalized or "item")[:max_length].rstrip("-")


def fit_code(raw_code: str, max_len: int = 80) -> str:
    """Deterministically shorten a code to <= max_len while preserving uniqueness via short hash."""
    if len(raw_code) <= max_len:
        return raw_code
    digest = hashlib.sha1(raw_code.encode("utf-8")).hexdigest()[:8]
    prefix = raw_code[: max_len - 9].rstrip("-")
    return f"{prefix}-{digest}"


class CodeRegistry:
    """Guarantees globally unique `code` identifiers <= max_len within each entity namespace."""

    def __init__(self, max_len: int = 80) -> None:
        self.max_len = max_len
        self._used: Set[str] = set()

    def register(self, base_text: str, suffix_hint: str | int | None = None) -> str:
        suffix_str = slugify(str(suffix_hint), 20) if suffix_hint is not None else ""
        base_budget = self.max_len - (len(suffix_str) + 1 if suffix_str else 0)
        base_slug = slugify(base_text, max_length=max(16, base_budget))
        candidate = f"{base_slug}-{suffix_str}" if suffix_str else base_slug
        candidate = fit_code(candidate, self.max_len)

        if candidate not in self._used:
            self._used.add(candidate)
            return candidate

        counter = 2
        while True:
            tag = f"-{counter}"
            numbered = f"{candidate[: self.max_len - len(tag)].rstrip('-')}{tag}"
            if numbered not in self._used:
                self._used.add(numbered)
                return numbered
            counter += 1