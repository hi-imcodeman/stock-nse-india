"""Shared Slack Block Kit layout helpers for readable vertical spacing."""

from __future__ import annotations

from typing import List, Optional

DIVIDER = {"type": "divider"}


def field(label: str, value: str) -> dict:
    """Label and value with extra line break for readability."""
    return {"type": "mrkdwn", "text": f"{label}\n\n{value}"}


def button(text: str, url: str) -> dict:
    return {
        "type": "button",
        "text": {"type": "plain_text", "text": text, "emoji": True},
        "url": url,
    }


def quote_block(body: str) -> str:
    """Quoted body with padding lines above and below."""
    lines = (body or "").strip().split("\n")
    quoted = "\n".join(f">{line}" if line else ">" for line in lines)
    return f"\n{quoted}\n"


def compose(
    text: str,
    header: str,
    summary: Optional[str] = None,
    fields: Optional[List[dict]] = None,
    quote: Optional[str] = None,
    buttons: Optional[List[dict]] = None,
    footer: Optional[str] = None,
) -> dict:
    """Build a Slack message with dividers and two-column fields."""
    blocks: List[dict] = [
        {"type": "header", "text": {"type": "plain_text", "text": header}},
        DIVIDER,
    ]

    if summary:
        blocks.append(
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"\n{summary.strip()}\n"},
            }
        )
        blocks.append(DIVIDER)

    if quote:
        blocks.append(
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": quote_block(quote)},
            }
        )
        blocks.append(DIVIDER)

    if fields:
        # Slack renders up to two field items per row.
        # Keep label/value spacing inside each field while using a 2-column layout.
        for i in range(0, len(fields), 2):
            blocks.append({"type": "section", "fields": fields[i : i + 2]})
        blocks.append(DIVIDER)

    if buttons:
        blocks.append({"type": "actions", "elements": buttons})
        blocks.append(DIVIDER)

    if footer:
        blocks.append(
            {
                "type": "context",
                "elements": [{"type": "mrkdwn", "text": footer}],
            }
        )

    while blocks and blocks[-1] == DIVIDER:
        blocks.pop()

    return {"text": text, "blocks": blocks}
