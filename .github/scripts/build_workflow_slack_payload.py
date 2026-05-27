#!/usr/bin/env python3
"""Build Slack payloads for workflow completion notifications."""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from slack_layout import button, compose, field  # noqa: E402


def main() -> None:
    kind = os.environ.get("NOTIFY_KIND", "workflow")
    repo = os.environ["GITHUB_REPOSITORY"]
    ref = os.environ.get("GITHUB_REF_NAME", "")
    event_name = os.environ.get("GITHUB_EVENT_NAME", "")
    actor = os.environ.get("GITHUB_ACTOR", "unknown")
    server_url = os.environ.get("GITHUB_SERVER_URL", "https://github.com")
    run_id = os.environ["GITHUB_RUN_ID"]
    run_number = os.environ.get("GITHUB_RUN_NUMBER", "")
    run_url = f"{server_url}/{repo}/actions/runs/{run_id}"

    status_emoji = os.environ.get("STATUS_EMOJI", "ℹ️")
    result_emoji = os.environ.get("RESULT_EMOJI", "🟡")
    workflow_result = os.environ.get("WORKFLOW_RESULT", "unknown")
    workflow_name = os.environ.get("WORKFLOW_NAME", os.environ.get("GITHUB_WORKFLOW", "Workflow"))

    header = f"{status_emoji} {workflow_name.upper()}"
    summary = os.environ.get(
        "SUMMARY_LINE",
        f"{result_emoji} *{workflow_result}*",
    )

    accent_colors = {
        "success": "#2eb886",
        "failure": "#e01e5a",
    }
    accent_color = accent_colors.get(workflow_result)

    fields = [
        field("📦 *Repository*", f"`{repo}`"),
        field("🌿 *Ref*", f"`{ref}`"),
        field("🎯 *Event*", f"`{event_name}`"),
        field("👤 *Actor*", f"@{actor}"),
    ]

    buttons = [button("📋 View workflow run", run_url)]

    if kind == "ci":
        sha = os.environ.get("GITHUB_SHA", "")
        commit_url = f"{server_url}/{repo}/commit/{sha}"
        fields.append(field("🔗 *Commit*", f"<{commit_url}|`{sha}`>"))
        buttons.append(button("🔍 View commit", commit_url))
        footer = f"stock-nse-india CI · run #{run_number}"
    else:
        footer = f"{workflow_name} · run #{run_number}"

    # Minimal preview line — full status and details are inside the card.
    text = f"`{repo}@{ref}`"
    body = compose(
        text=text,
        header=header,
        summary=summary,
        fields=fields,
        buttons=buttons,
        footer=footer,
        primary="header",
        accent_color=accent_color,
    )

    out_path = os.environ.get("SLACK_PAYLOAD_PATH", "slack-payload.json")
    with open(out_path, "w", encoding="utf-8") as handle:
        json.dump(body, handle, ensure_ascii=False)

    print(f"Wrote Slack payload to {out_path}")


if __name__ == "__main__":
    main()
