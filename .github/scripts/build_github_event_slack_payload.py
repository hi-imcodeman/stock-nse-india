#!/usr/bin/env python3
"""Build Slack Block Kit payload for GitHub repository webhook events."""

import json
import os
import sys


def truncate(text: str, max_len: int = 200) -> str:
    text = (text or "").strip().replace("\r\n", "\n")
    if len(text) <= max_len:
        return text
    return text[: max_len - 1] + "…"


def field(label: str, value: str) -> dict:
    return {"type": "mrkdwn", "text": f"{label}\n{value}"}


def button(text: str, url: str) -> dict:
    return {
        "type": "button",
        "text": {"type": "plain_text", "text": text, "emoji": True},
        "url": url,
    }


def payload(text: str, blocks: list) -> dict:
    return {"text": text, "blocks": blocks}


def build(event_name: str, action: str, event: dict, repo: str, server_url: str) -> dict:
    if event_name == "pull_request":
        pr = event["pull_request"]
        title = pr.get("title", "")
        author = pr.get("user", {}).get("login", "unknown")
        pr_url = pr.get("html_url", "")
        base = pr.get("base", {}).get("ref", "")
        head = pr.get("head", {}).get("ref", "")

        if action == "opened":
            header = "🔀 PR opened"
            summary = f"*{title}*"
            fields = [
                field("👤 *Author*", f"@{author}"),
                field("🌿 *Branches*", f"`{head}` → `{base}`"),
                field("📦 *Repository*", f"`{repo}`"),
            ]
        elif action == "edited":
            header = "✏️ PR updated"
            summary = f"*{title}*"
            fields = [
                field("👤 *Author*", f"@{author}"),
                field("🌿 *Branches*", f"`{head}` → `{base}`"),
                field("📦 *Repository*", f"`{repo}`"),
            ]
        elif action == "closed":
            if pr.get("merged"):
                header = "🎉 PR merged"
                merger = pr.get("merged_by", {}).get("login") or author
                summary = f"*{title}*"
                fields = [
                    field("👤 *Merged by*", f"@{merger}"),
                    field("🌿 *Into*", f"`{base}`"),
                    field("📦 *Repository*", f"`{repo}`"),
                ]
            else:
                header = "🚫 PR closed"
                summary = f"*{title}* (not merged)"
                fields = [
                    field("👤 *Author*", f"@{author}"),
                    field("🌿 *Branches*", f"`{head}` → `{base}`"),
                    field("📦 *Repository*", f"`{repo}`"),
                ]
        else:
            header = f"🔀 PR {action}"
            summary = f"*{title}*"
            fields = [field("📦 *Repository*", f"`{repo}`")]

        text = f"{header}: {title}"
        blocks = [
            {"type": "header", "text": {"type": "plain_text", "text": header}},
            {"type": "section", "text": {"type": "mrkdwn", "text": summary}},
            {"type": "divider"},
            {"type": "section", "fields": fields},
            {
                "type": "actions",
                "elements": [button("🔍 View PR", pr_url)],
            },
        ]
        return payload(text, blocks)

    if event_name == "issues":
        issue = event["issue"]
        title = issue.get("title", "")
        author = issue.get("user", {}).get("login", "unknown")
        issue_url = issue.get("html_url", "")
        labels = ", ".join(l.get("name", "") for l in issue.get("labels", [])) or "—"

        action_labels = {
            "opened": ("🆕 Issue opened", "🆕"),
            "edited": ("✏️ Issue updated", "✏️"),
            "closed": ("✅ Issue closed", "✅"),
            "reopened": ("🔁 Issue reopened", "🔁"),
        }
        header, _ = action_labels.get(action, (f"📌 Issue {action}", "📌"))

        text = f"{header}: {title}"
        blocks = [
            {"type": "header", "text": {"type": "plain_text", "text": header}},
            {"type": "section", "text": {"type": "mrkdwn", "text": f"*{title}*"}},
            {"type": "divider"},
            {
                "type": "section",
                "fields": [
                    field("👤 *Author*", f"@{author}"),
                    field("🏷️ *Labels*", labels),
                    field("📦 *Repository*", f"`{repo}`"),
                ],
            },
            {
                "type": "actions",
                "elements": [button("🔍 View issue", issue_url)],
            },
        ]
        return payload(text, blocks)

    if event_name == "issue_comment":
        comment = event["comment"]
        issue = event["issue"]
        author = comment.get("user", {}).get("login", "unknown")
        body = truncate(comment.get("body", ""))
        comment_url = comment.get("html_url", "")
        issue_title = issue.get("title", "")
        is_pr = issue.get("pull_request") is not None
        target = "PR" if is_pr else "issue"
        header = f"💬 Comment on {target}"

        text = f"{header}: {issue_title}"
        blocks = [
            {"type": "header", "text": {"type": "plain_text", "text": header}},
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"*{issue_title}*\n\n>{body}"},
            },
            {"type": "divider"},
            {
                "type": "section",
                "fields": [
                    field("👤 *Author*", f"@{author}"),
                    field("📦 *Repository*", f"`{repo}`"),
                ],
            },
            {
                "type": "actions",
                "elements": [button("🔍 View comment", comment_url)],
            },
        ]
        return payload(text, blocks)

    if event_name == "fork":
        fork = event.get("forkee", {})
        forker = event.get("sender", {}).get("login", "unknown")
        fork_url = fork.get("html_url", "")
        fork_full = fork.get("full_name", fork.get("name", ""))

        header = "🍴 Repository forked"
        text = f"{header}: {repo} → {fork_full}"
        blocks = [
            {"type": "header", "text": {"type": "plain_text", "text": header}},
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"@{forker} forked `{repo}`"},
            },
            {"type": "divider"},
            {
                "type": "section",
                "fields": [
                    field("👤 *Forker*", f"@{forker}"),
                    field("📦 *Fork*", f"`{fork_full}`"),
                ],
            },
            {
                "type": "actions",
                "elements": [button("🔍 View fork", fork_url)],
            },
        ]
        return payload(text, blocks)

    if event_name == "watch":
        sender = event.get("sender", {}).get("login", "unknown")
        repository = event.get("repository", {})
        stargazers = repository.get("stargazers_count", "—")
        repo_url = repository.get("html_url", f"{server_url}/{repo}")

        header = "⭐ New star"
        text = f"{header}: {repo} ({stargazers} stars)"
        blocks = [
            {"type": "header", "text": {"type": "plain_text", "text": header}},
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"@{sender} starred `{repo}`"},
            },
            {"type": "divider"},
            {
                "type": "section",
                "fields": [
                    field("👤 *User*", f"@{sender}"),
                    field("⭐ *Stars*", str(stargazers)),
                    field("📦 *Repository*", f"`{repo}`"),
                ],
            },
            {
                "type": "actions",
                "elements": [button("🔍 View repository", repo_url)],
            },
        ]
        return payload(text, blocks)

    header = f"📣 GitHub {event_name}"
    text = f"{header} ({action}) on {repo}"
    return payload(
        text,
        [
            {"type": "header", "text": {"type": "plain_text", "text": header}},
            {
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"Event `{event_name}` / `{action}`"},
            },
        ],
    )


def main() -> None:
    event_name = os.environ["GITHUB_EVENT_NAME"]
    action = os.environ.get("GITHUB_EVENT_ACTION", "")
    repo = os.environ["GITHUB_REPOSITORY"]
    server_url = os.environ.get("GITHUB_SERVER_URL", "https://github.com")
    event = json.loads(os.environ["GITHUB_EVENT_JSON"])

    out_path = os.environ.get("SLACK_PAYLOAD_PATH", "slack-payload.json")
    body = build(event_name, action, event, repo, server_url)

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(body, f, ensure_ascii=False)

    print(f"Wrote Slack payload to {out_path}")


if __name__ == "__main__":
    main()
