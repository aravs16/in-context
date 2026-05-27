---
id: ccview
title: ccview — a tiny TUI companion for Claude Code
category: Agentic AI and Tools
date: 2026-04-08
readTime: 2 min
excerpt: I've been running Claude Code for almost everything lately — personal finances, research, side projects. The output is great. The terminal is a terrible place to read it. So I built a small thing.
---

I've been using Claude Code for almost everything lately — personal finances, research, side projects, the occasional half-baked startup idea at midnight. The output is genuinely great. The terminal is a genuinely terrible place to read it.

A 40-row markdown table wrapping into your scrollback is not information. It's wallpaper.

## What I built

`ccview` is a small TUI app that watches a folder. Claude Code drops a JSON file. `ccview` renders it — tables, charts, checklists — right in your terminal, in a layout that's actually meant to be read. You can check items off. State persists between runs.

That's the whole thing. It's not a framework, it's not a platform, it doesn't try to be a chat UI. It's the missing render step between "Claude wrote a thing" and "I can use the thing."

## Why a TUI and not a web app

The honest answer is that I live in my terminal and I didn't want to spawn a browser tab every time I asked Claude to plan something. A few less honest answers:

- A web UI would have meant building auth, hosting, a backend. A TUI is a single binary.
- Claude Code already drops files where you tell it to. Watching a folder is one syscall.
- The terminal is where the trust already is. I don't want a new surface for the output.

The trade-off is that you give up rich rendering — no embedded images, no fancy fonts. For the things I actually use Claude for, that hasn't mattered. A clean table and a checkable list cover 80% of it.

## How it fits the loop

The pattern I've landed on:

1. Tell Claude what I want done.
2. Tell it to drop the output as a JSON file in `~/cc/`.
3. `ccview` (already running in another tmux pane) picks it up and renders.
4. I check things off as I work through them. The state is there next time I open it.

Small enough to barely call a tool. Useful enough that I open it every day.

Code: [github.com/aravs16/ccview](https://github.com/aravs16/ccview). MIT, no telemetry, no install ceremony. Personal side project, not affiliated with my employer.
