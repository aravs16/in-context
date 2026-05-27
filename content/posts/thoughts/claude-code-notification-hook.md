---
id: claude-code-notification-hook
title: The five-line Claude Code hook that gives me back 30 minutes a day
category: Agentic AI and Tools
date: 2026-04-15
readTime: 2 min
excerpt: Kick off a Claude Code task, switch screens, get pulled into something else, come back 20 minutes later and find it sitting there waiting for a Yes/No. There's a dead-simple fix.

---

Have you ever kicked off a task in Claude Code, switched to another screen, got pulled into something else… and come back twenty minutes later to find it sitting there, waiting on a Yes/No?

I did this to myself enough times that I finally went and fixed it. The fix is one line of config and two native macOS commands.

## The hook

Claude Code has a hooks system that runs shell commands on lifecycle events. One of those events is `Notification` — it fires whenever Claude Code needs your attention (permission prompt, plan approval, anything that blocks).

Drop this into `~/.claude/settings.json`:

```
{
  "hooks": {
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "afplay /System/Library/Sounds/Glass.aiff & osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

Now whenever Claude Code is waiting on you:

- A chime plays — you hear it from any screen.
- A macOS notification banner pops — you see it from any app.

That's it. No daemons, no extra installs.

## Why it's worth doing

I want to make the case for why this tiny thing matters more than it sounds.

The cost of a missed permission prompt isn't the 30 seconds it takes to walk back and click Yes. It's the context switch. You left Claude in one mental model and came back in another. You have to re-load the state — what was it doing, why, what's the next step. Multiply that by ten times a day and you've lost a real hour of focused work, plus the more expensive thing, which is the shape of your attention.

> The small friction points are the ones worth solving. They're the ones you stop noticing.

The reason it took me months to fix this is the same reason it'll take you months: it's not painful enough in any single moment to interrupt what you're doing. The pain accumulates silently. The version of you who's getting paged from across the room when Claude finishes is doing meaningfully better work than the version who keeps tab-checking every two minutes.

## What I'd add next

Once you have one hook running, the next ones are basically free. Things I've found worth wiring up:

- A different sound on `Stop` so I know the run actually finished, not just paused.
- A `PreToolUse` hook that vetoes destructive shell commands without my explicit ok.
- A `PostToolUse` hook that runs my project's formatter on every file edit so I never have to think about it.

But start with the notification hook. It's the highest leverage one, and it's two minutes to set up.
