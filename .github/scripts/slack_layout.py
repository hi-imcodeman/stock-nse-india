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


def title_block(text: str) -> dict:
    """Large title block — biggest text size supported by incoming webhooks."""
    return {
        "type": "header",
        "text": {"type": "plain_text", "text": strip_mrkdwn(text)[:150], "emoji": True},
    }


def subtitle_block(text: str) -> dict:
    """Muted secondary line below the title."""
    return {
        "type": "context",
        "elements": [{"type": "mrkdwn", "text": text}],
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
    accent_color: Optional[str] = None,
) -> dict:
    """Build a Slack message with dividers and two-column fields."""
    blocks: List[dict] = []

    if summary:
        title = header if primary == "header" else summary
        subtitle = summary if primary == "header" else header
        blocks.append(title_block(title))
        blocks.append(DIVIDER)
        blocks.append(subtitle_block(subtitle))
        blocks.append(DIVIDER)
    else:
        blocks.append(title_block(header))
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

    payload: dict = {"text": text, "blocks": blocks}
    if accent_color:
        payload = {
            "text": text,
            "attachments": [{"color": accent_color, "blocks": blocks}],
        }
    return payload
