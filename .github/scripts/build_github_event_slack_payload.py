#!/usr/bin/env python3
"""Build Slack Block Kit payload for GitHub repository webhook events."""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from slack_layout import button, compose, field  # noqa: E402


def truncate(text: str, max_len: int = 200) -> str:
    text = (text or "").strip().replace("\r\n", "\n")
    if len(text) <= max_len:
        return text
    return text[: max_len - 1] + "…"


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
        elif action == "edited":
            header = "✏️ PR updated"
        elif action == "closed":
            header = "🎉 PR merged" if pr.get("merged") else "🚫 PR closed"
        else:
            header = f"🔀 PR {action}"

        fields = [
            field("👤 *Author*", f"@{author}"),
            field("🌿 *Branches*", f"`{head}` → `{base}`"),
            field("📦 *Repository*", f"`{repo}`"),
        ]
        if action == "closed" and pr.get("merged"):
            merger = pr.get("merged_by", {}).get("login") or author
            fields[0] = field("👤 *Merged by*", f"@{merger}")
            fields[1] = field("🌿 *Into*", f"`{base}`")

        summary = f"*{title}*" if action != "closed" or pr.get("merged") else f"*{title}* (not merged)"
        return compose(
            text=f"{header}: {title}",
            header=header,
            summary=summary,
            fields=fields,
            buttons=[button("🔍 View PR", pr_url)],
        )

    if event_name == "issues":
        issue = event["issue"]
        title = issue.get("title", "")
        author = issue.get("user", {}).get("login", "unknown")
        issue_url = issue.get("html_url", "")
        labels = ", ".join(label.get("name", "") for label in issue.get("labels", [])) or "—"

        action_labels = {
            "opened": "🆕 Issue opened",
            "edited": "✏️ Issue updated",
            "closed": "✅ Issue closed",
            "reopened": "🔁 Issue reopened",
        }
        header = action_labels.get(action, f"📌 Issue {action}")

        return compose(
            text=f"{header}: {title}",
            header=header,
            summary=f"*{title}*",
            fields=[
                field("👤 *Author*", f"@{author}"),
                field("🏷️ *Labels*", labels),
                field("📦 *Repository*", f"`{repo}`"),
            ],
            buttons=[button("🔍 View issue", issue_url)],
        )

    if event_name == "issue_comment":
        comment = event["comment"]
        issue = event["issue"]
        author = comment.get("user", {}).get("login", "unknown")
        body = truncate(comment.get("body", ""))
        comment_url = comment.get("html_url", "")
        issue_title = issue.get("title", "")
        target = "PR" if issue.get("pull_request") is not None else "issue"
        header = f"💬 Comment on {target}"

        return compose(
            text=f"{header}: {issue_title}",
            header=header,
            summary=f"*{issue_title}*",
            quote=body,
            fields=[
                field("👤 *Author*", f"@{author}"),
                field("📦 *Repository*", f"`{repo}`"),
            ],
            buttons=[button("🔍 View comment", comment_url)],
        )

    if event_name == "pull_request_review_comment":
        comment = event["comment"]
        pr = event["pull_request"]
        author = comment.get("user", {}).get("login", "unknown")
        body = truncate(comment.get("body", ""))
        comment_url = comment.get("html_url", "")
        pr_title = pr.get("title", "")
        pr_url = pr.get("html_url", "")
        path = comment.get("path", "")
        line = comment.get("line") or comment.get("original_line")
        location = f"`{path}`" + (f" (line {line})" if line else "") if path else "—"

        action_headers = {
            "created": "📝 Inline review comment",
            "edited": "✏️ Inline review comment updated",
            "deleted": "🗑️ Inline review comment deleted",
        }
        header = action_headers.get(action, "📝 Inline review comment")

        return compose(
            text=f"{header}: {pr_title}",
            header=header,
            summary=f"*{pr_title}*",
            quote=body,
            fields=[
                field("👤 *Author*", f"@{author}"),
                field("📍 *Location*", location),
                field("📦 *Repository*", f"`{repo}`"),
            ],
            buttons=[
                button("🔍 View comment", comment_url),
                button("🔀 View PR", pr_url),
            ],
        )

    if event_name == "pull_request_review":
        review = event["review"]
        pr = event["pull_request"]
        author = review.get("user", {}).get("login", "unknown")
        body = truncate(review.get("body", "") or "")
        review_url = review.get("html_url", "")
        pr_title = pr.get("title", "")
        pr_url = pr.get("html_url", "")
        state = (review.get("state") or "").upper()

        state_headers = {
            "APPROVED": "✅ PR approved",
            "CHANGES_REQUESTED": "🔄 Changes requested",
            "COMMENTED": "💬 Review submitted",
            "DISMISSED": "🚫 Review dismissed",
            "PENDING": "⏳ Review pending",
        }
        if action == "dismissed":
            header = "🚫 Review dismissed"
        elif action == "edited":
            header = "✏️ Review updated"
        else:
            header = state_headers.get(state, f"📋 PR review ({state.lower()})")

        return compose(
            text=f"{header}: {pr_title}",
            header=header,
            summary=f"*{pr_title}*",
            quote=body or None,
            fields=[
                field("👤 *Reviewer*", f"@{author}"),
                field("📊 *State*", state or action),
                field("📦 *Repository*", f"`{repo}`"),
            ],
            buttons=[
                button("🔍 View review", review_url),
                button("🔀 View PR", pr_url),
            ],
        )

    if event_name == "fork":
        fork = event.get("forkee", {})
        forker = event.get("sender", {}).get("login", "unknown")
        fork_url = fork.get("html_url", "")
        fork_full = fork.get("full_name", fork.get("name", ""))
        header = "🍴 Repository forked"

        return compose(
            text=f"{header}: {repo} → {fork_full}",
            header=header,
            summary=f"@{forker} forked `{repo}`",
            fields=[
                field("👤 *Forker*", f"@{forker}"),
                field("📦 *Fork*", f"`{fork_full}`"),
            ],
            buttons=[button("🔍 View fork", fork_url)],
        )

    if event_name == "watch":
        sender = event.get("sender", {}).get("login", "unknown")
        repository = event.get("repository", {})
        stargazers = repository.get("stargazers_count", "—")
        repo_url = repository.get("html_url", f"{server_url}/{repo}")
        header = "⭐ New star"

        return compose(
            text=f"{header}: {repo} ({stargazers} stars)",
            header=header,
            summary=f"@{sender} starred `{repo}`",
            fields=[
                field("👤 *User*", f"@{sender}"),
                field("⭐ *Stars*", str(stargazers)),
                field("📦 *Repository*", f"`{repo}`"),
            ],
            buttons=[button("🔍 View repository", repo_url)],
        )

    header = f"📣 GitHub {event_name}"
    return compose(
        text=f"{header} ({action}) on {repo}",
        header=header,
        summary=f"Event `{event_name}` / `{action}`",
    )


def main() -> None:
    event_name = os.environ["GITHUB_EVENT_NAME"]
    action = os.environ.get("GITHUB_EVENT_ACTION", "")
    repo = os.environ["GITHUB_REPOSITORY"]
    server_url = os.environ.get("GITHUB_SERVER_URL", "https://github.com")
    event = json.loads(os.environ["GITHUB_EVENT_JSON"])

    out_path = os.environ.get("SLACK_PAYLOAD_PATH", "slack-payload.json")
    body = build(event_name, action, event, repo, server_url)

    with open(out_path, "w", encoding="utf-8") as handle:
        json.dump(body, handle, ensure_ascii=False)

    print(f"Wrote Slack payload to {out_path}")


if __name__ == "__main__":
    main()
