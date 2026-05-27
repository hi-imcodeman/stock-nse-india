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


def header_block(text: str) -> dict:
    """Large plain-text title block (Slack's biggest text style)."""
    return {
        "type": "header",
        "text": {"type": "plain_text", "text": text[:150], "emoji": True},
    }


def strip_mrkdwn(text: str) -> str:
    """Remove common mrkdwn markers for plain-text headers."""
    return (text or "").strip().replace("*", "").replace("_", "")


def compose(
    text: str,
    header: str,
    summary: Optional[str] = None,
    fields: Optional[List[dict]] = None,
    quote: Optional[str] = None,
    buttons: Optional[List[dict]] = None,
    footer: Optional[str] = None,
    primary: str = "summary",
) -> dict:
    """Build a Slack message with dividers and two-column fields."""
    blocks: List[dict] = []

    if summary:
        title = header if primary == "header" else summary
        subtitle = summary if primary == "header" else header
        blocks.append(header_block(strip_mrkdwn(title)))
        blocks.append(DIVIDER)
        blocks.append(
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": subtitle},
            }
        )
        blocks.append(DIVIDER)
    else:
        blocks.append(header_block(header))
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
