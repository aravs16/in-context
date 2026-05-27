---
id: flappy-bird-test
title: The Flappy Bird test
category: Agentic AI and Tools
date: 2025-07-22
readTime: 3 min
excerpt: When I want to know if a new coding assistant is actually any good, I ask it to build Flappy Bird. One small prompt catches almost everything that matters.
---

Every time a new coding assistant, AI IDE, or code-gen model lands, I give it the same first prompt: _build me Flappy Bird._

It's a silly-sounding test. It is also the one I trust most.

## Why this one prompt works

Most eval prompts fail in one of two ways. They're either too narrow — "write a function that reverses a string" — which any half-decent model can fake without telling you anything about how it behaves on a real task. Or they're too open-ended — "build me a CRM" — which lets the model produce a plausible-looking skeleton and never actually run.

Flappy Bird sits exactly in the middle. It's small enough to ship in one shot, but big enough to touch almost every subsystem a real product touches:

- A game loop and a frame timer
- Input handling
- Physics — gravity, jump impulse, terminal velocity
- Procedural pipe generation with a fair gap
- Collision detection
- Score state, restart state, game-over state
- Rendering — sprites or shapes, a moving background, a score readout

If the model misses any one of those, the game is broken in a way you can _see_ in five seconds. There's no rubric to argue with. The bird either flies or it doesn't.

> A good eval is one where you can't fake it. Flappy Bird is one of those.

## What I'm actually watching for

On first try, I'm watching five things:

**Prompt comprehension.** Did it understand "Flappy Bird" without me having to spec every mechanic? A model that asks me ten clarifying questions before writing a line is failing differently than one that just builds it.

**Time-to-first-run.** How long from "go" to a thing I can actually play. This is the single best proxy I've found for how the tool will feel in a real loop.

**Does it work?** Not "does it compile." Does it _play_. Most failures show up here — pipes that overlap the bird, gravity that's wrong by an order of magnitude, a collision box that's three times too big.

**Code shape.** When I open the file, is it organized like something a human would maintain, or is it one 600-line `main()` with magic numbers? This is where you separate the assistants that you'd actually adopt from the ones that demo well and then collapse.

**Follow-up handling.** "Make the pipes harder." "Add a high score that persists." "The bird animation looks off — fix it." This is the real test. Plenty of models nail the first generation and then fall apart the moment you ask them to change something.

## Why not a harder test

I've tried fancier evals — a small CRUD app, a parser, a tiny compiler. They're more impressive on paper. They're also slower to score, harder to compare across runs, and easier for a model to fake by producing something that looks right.

Flappy Bird gives me a signal in under two minutes. That signal is dense, it's honest, and it generalizes. A model that builds a clean, playable Flappy Bird on the first try and handles two follow-ups gracefully will almost always be the one I reach for the rest of the week.

The point of an eval isn't to be sophisticated. It's to be one you'll actually run.
