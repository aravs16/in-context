// Phase 12 lesson content. Block types are rendered by LessonBlock in app.jsx.
window.PHASE_LESSONS = window.PHASE_LESSONS || {};
window.PHASE_LESSONS[12] = [
    {
      id: "intuition",
      label: "Intuition",
      blocks: [
        { t: "p", html: "Back in Phase 4, we called the code that carries messages and runs tools \"the harness,\" and the heart of it \"the loop.\" Now look at everything else you've built since: retries when a call fails, capping the loop, trimming context, saving memory, wrapping guardrails, tracing every call. Notice that <em>almost none of that is the model</em> — it's all machinery <strong>around</strong> the model." },
        { t: "p", html: "One thing to get straight before we widen the lens: <strong>the loop didn't get renamed.</strong> Your Phase 4 loop is still there, still doing exactly the same job — carry the question in, run the tools, carry the answer out. It's just <em>one component</em> inside a bigger harness. The word didn't change; the picture got wider: loop + streaming + permissions + session state + everything else in this phase." },
        { t: "p", html: "Three of those words are new, so here they are in plain terms before you meet them in a table. <strong>Streaming</strong> — the answer appears word by word as the model writes it, instead of all at once at the end (you've watched ChatGPT do this every time you've used it). <strong>Permissions</strong> — the harness stops and asks <em>you</em> before running a risky tool, like sending an email or deleting a file. <strong>Session persistence</strong> — close your laptop mid-conversation, come back tomorrow, and the conversation is still there. That last one should sound familiar: it's your Phase 8 memory work — saving and re-loading session state — wearing its production name." },
        { t: "compare",
          question: "What's the gap between a demo agent and a production one?",
          left: {
            tag: "Just the loop",
            answer: "Calls the model, runs tools, returns an answer. Works in the happy path.",
            verdict: "A demo",
            note: "One flaky call, one weird input, one long session and it falls over."
          },
          right: {
            tag: "Loop + the rest of the harness",
            answer: "The loop, plus: retries, context management, streaming (words as they're made), permissions (ask before risky tools), hooks, session persistence (pick up where you left off), observability.",
            verdict: "Production",
            note: "Most of the real engineering lives here — not in the model."
          }
        },
        { t: "p", html: "Here's the capstone realization: look at that right-hand column again — <strong>you have already built most of it.</strong> The loop is your Phase 4 <code>agent.py</code>. Context management is your Phase 8 compaction. Session persistence is your Phase 8 <code>memory.py</code>. Observability — recording what every call did and cost — is your Phase 6 tracing. And your Phase 7 guardrails? They attach to the harness through hooks, which you'll meet in a moment. The harness isn't a new thing to learn. It's the building this whole course has been constructing, one room at a time." },
        { t: "p", html: "Frameworks like LangGraph, Strands, and even Claude Code itself are harnesses — someone else's version of that same building. Understanding what a harness does is the difference between \"I wrote an agent loop\" and \"I have a production agent system.\"" },
        { t: "callout", kind: "key", title: "What a harness is", html: "The <strong>harness</strong> is everything around the model: the loop (tool dispatch), retries, context management, streaming, permissions, session state, hooks. The Phase 4 loop is one component of it — the one at the center. Most of the engineering complexity in agentic apps lives in the harness, not the model." }
      ]
    },
    {
      id: "what-harness-does",
      label: "What a harness does",
      blocks: [
        { t: "p", html: "In the intuition we listed seven jobs a harness handles. Here they are one by one — with a tag showing where in this course you already did each one by hand:" },
        { t: "list", items: [
          "<strong>Tool dispatch</strong> — routing tool calls to your real functions and feeding results back. This <em>is</em> your Phase 4 loop.",
          "<strong>Retries &amp; backoff</strong> — network calls fail; a harness retries them (waiting a bit longer each time — that's the \"backoff\") so your agent doesn't crash.",
          "<strong>Context management</strong> — trimming and compacting so you never blow the window. Your Phase 8 compaction work.",
          "<strong>Streaming</strong> — showing the answer word by word as it's generated, instead of a long silence and then a wall of text.",
          "<strong>Hooks</strong> — run <em>your</em> code before or after each tool call, or when something errors. This is exactly where your Phase 7 guardrails attach: an input check as a before-hook, a PII redactor as an after-hook.",
          "<strong>Permissions</strong> — pause and ask the human before a risky tool runs. Remember Phase 4's warning that the model can't tell arithmetic from sending a real email? Permissions are the harness acting on that warning.",
          "<strong>Session state</strong> — save where a conversation left off and load it back next time. Your Phase 8 memory, productionized. (Add Phase 6's tracing and you have observability too.)"
        ]},
        { t: "p", html: "Notice that three of those — retries, streaming, permissions — never got a \"your Phase X work\" tag. You never built them, on purpose. Hold that thought; it's the crux of the next section." },
        { t: "p", html: "Now, these seven don't sit side by side like drawers in a cabinet. They fire <em>in order</em>, at different moments of a single request, with the loop at the center and everything else wrapped around it. Follow one message all the way through:" },
        { t: "diagram", mermaid: "flowchart TB\n  U[\"you\"] -->|\"1 · message\"| SS[\"session state<br/>loads where you left off\"]\n  SS -->|\"2\"| CM[\"context mgmt<br/>trims to fit the window\"]\n  CM -->|\"3\"| LP[\"the loop — Phase 4\"]\n  LP <-->|\"4 · API call<br/>retried if it fails\"| M[\"the LLM\"]\n  LP -->|\"5 · tool call?\"| PH[\"permissions — asks you first<br/>hooks — your code fires before/after\"]\n  PH -->|\"6\"| TD[\"tool dispatch<br/>runs the real tool\"]\n  TD -->|\"7 · result\"| LP\n  LP -->|\"8 · streams the answer, word by word<br/>then saves the session\"| U" },
        { t: "p", html: "Read the numbers: the session loads <em>before</em> the loop starts, context gets trimmed <em>before</em> the model sees it, permissions and hooks fire <em>between</em> the model asking for a tool and the tool actually running, and streaming happens on the way <em>out</em>. One request, seven components, each at its moment." },
        { t: "callout", kind: "key", title: "The loop is the center, not the whole", html: "Every request passes through the same shape: <strong>load state → fit context → loop with the model → guard the tools → stream out → save state</strong>. When a framework's docs mention any of these words, you now know exactly where in that shape it sits." }
      ]
    },
    {
      id: "build-vs-buy",
      label: "Build vs buy",
      blocks: [
        { t: "p", html: "So should you use a framework or roll your own? Now you can actually decide, because you understand the underlying problem. A framework saves you from rebuilding all that plumbing — but adds its own concepts to learn and constraints to live with. A hand-rolled loop is simple and fully yours — until you need streaming, retries, and hooks, and slowly rebuild a worse framework. Here are the concrete signals, both directions:" },
        { t: "h", text: "Build your own loop when…" },
        { t: "list", items: [
          "<strong>You need full control of the loop</strong> — custom stopping rules, an unusual order of steps, logic a framework would fight you on.",
          "<strong>Your tools are unusual</strong> — they don't fit the standard \"function with a description\" shape (long-running jobs, hardware, weird approval flows).",
          "<strong>You need tight cost control</strong> — you want to see, count, and trim every token yourself, the way you did in Phases 6 and 8.",
          "<strong>The whole job fits in ~50 lines</strong> — your <code>agent.py</code> already covers it. Don't import a framework to do what one loop does."
        ]},
        { t: "h", text: "Adopt a harness when…" },
        { t: "list", items: [
          "<strong>It's a standard chat or coding-assistant use case</strong> — the well-worn path every framework was built and battle-tested for.",
          "<strong>You want streaming, permissions, and session persistence for free</strong> — exactly the three components you never built by hand. That was deliberate: they're fiddly, solved problems.",
          "<strong>You'd rather ship the product than maintain plumbing</strong> — retries, backoff, and reconnects are not where your app wins or loses."
        ]},
        { t: "callout", kind: "tip", title: "The point of building it by hand first", html: "You spent this course doing the harness work manually on purpose. That's why you can now read any framework's feature list and see exactly what it gives you — and tell when its magic is worth the lock-in and when a 50-line loop is plenty." }
      ]
    },
    {
      id: "build",
      label: "Compare & extend",
      blocks: [
        { t: "p", html: "For the finale: put your hand-rolled agent next to a real harness, see what they do that you don't, and add one missing piece to your own loop." },
        { t: "assist",
          intro: "In your project, paste this:",
          prompt: "Help me write harness.md comparing agent harnesses.\n\n- Make a feature matrix across: my hand-rolled loop, LangGraph, Strands, and Claude Code. Rows: tool dispatch, retries/backoff, streaming, hooks, permissions, session persistence, observability. For my loop, point at the actual code (or its absence).\n- Pick one feature my loop is missing (most likely streaming or pre/post-tool hooks) and add it to my agent.py.\n- Help me write a short take: when is a heavy framework worth it vs. building your own?\n\nKeep it concrete — point at the actual code I have.",
          asks: [
            "What does an agent harness give me beyond the model?",
            "When should I use a framework vs build my own loop?",
            "What's the one feature I should add to my loop first?"
          ]
        },
        { t: "p", html: "Two references so you can sanity-check what your assistant produces. First, the matrix — here's what two correctly filled-in rows of <code>harness.md</code> look like (yours will have all seven rows and a Strands column too):" },
        { t: "code", label: "harness.md — sample rows (read, don't type)", code: "| Feature          | my loop (agent.py)             | LangGraph       | Claude Code    |\n|------------------|--------------------------------|-----------------|----------------|\n| tool dispatch    | ✓ hand-written run_tool()      | ✓ built in      | ✓ built in     |\n| retries/backoff  | ✗ one failed call crashes it   | ✓ configurable  | ✓ automatic    |\n| streaming        | ✗ silence, then the full answer| ✓               | ✓ word by word |" },
        { t: "p", html: "Second, the code change. If your assistant adds <strong>streaming</strong>, the diff to your Phase 4 loop should be surprisingly small — one call swapped for a streaming version. You don't write this; you just check that what your assistant wrote has this shape:" },
        { t: "code", label: "agent.py — the streaming change, roughly (read, don't type)", code: "# BEFORE (Phase 4): silence, then the whole reply at once\nreply = client.messages.create(\n    model=\"claude-sonnet-4-6\", max_tokens=1024,\n    tools=TOOLS, messages=messages)\n\n# AFTER: same call, streamed — words print as the model makes them\nwith client.messages.stream(\n        model=\"claude-sonnet-4-6\", max_tokens=1024,\n        tools=TOOLS, messages=messages) as stream:\n    for text in stream.text_stream:\n        print(text, end=\"\", flush=True)   # <- this is \"streaming\"\n    reply = stream.get_final_message()    # the loop continues as before" },
        { t: "p", html: "Notice what didn't change: the loop, the tools, the cap. Streaming wraps <em>around</em> the same call — one more piece of harness, zero change to the model. (If your assistant adds a <strong>hook</strong> instead, look for the same smallness: your guardrail function called right before or after <code>run_tool</code>.)" },
        { t: "callout", kind: "key", title: "Deliverable — harness.md", html: "A feature comparison of the harnesses you've used, plus one new feature added to your own loop. You can now look at any agent framework and know exactly what it's doing for you — because you've built, by hand, almost everything it sells." }
      ]
    },
    {
      id: "recap",
      label: "What you should know",
      blocks: [
        { t: "recap", items: [
          "The <strong>harness</strong> is everything around the model — tool dispatch, retries, context management, streaming, hooks, permissions, session state. The Phase 4 <strong>loop</strong> is one component inside it, at the center.",
          "The components fire <strong>in order</strong> on each request: load session → fit context → loop with the model → permissions &amp; hooks guard the tools → stream the answer out → save session.",
          "The harness is where the whole course physically lives: Phase 4's loop, Phase 6's tracing (observability), Phase 7's guardrails (attached via hooks), Phase 8's memory (session state + context management).",
          "Most of the engineering in an agent app lives in the <strong>harness</strong>, not the model.",
          "<strong>Build</strong> when you need full loop control, unusual tools, or tight cost control; <strong>buy</strong> when it's standard chat/coding work and you want streaming, permissions, and persistence for free.",
          "Frameworks (LangGraph, Strands, Claude Code) are harnesses; building one by hand shows you exactly what they give you.",
          "You finished the path — from \"an LLM predicts the next word\" all the way to a traced, guarded, remembering, multi-agent system. That's the whole stack, and you could now explain every box in the diagram to a colleague."
        ]},
        { t: "quiz", items: [
          { q: "What is an agent \"harness\"?", options: ["A bigger model", "Everything around the model — the loop, retries, context, hooks, permissions, session state", "A type of prompt"], answer: 1, explain: "The harness is the production plumbing around the model; the Phase 4 loop is one component inside it." },
          { q: "In Phase 12, what happened to Phase 4's \"loop\"?", options: ["It was replaced by the harness", "It's still there — one component at the center of a bigger harness", "It was renamed \"streaming\""], answer: 1, explain: "The word didn't get replaced; the picture got wider. The loop still dispatches tools — the harness adds everything around it." },
          { q: "You close your laptop mid-conversation. Tomorrow, the agent picks up exactly where you left off. Which harness component did that?", options: ["Streaming", "Session state / persistence", "Retries &amp; backoff"], answer: 1, explain: "Session state saves and re-loads the conversation — it's your Phase 8 memory work under its production name." },
          { q: "Your Phase 7 guardrails need to run right before every tool call. Which harness component do they attach to?", options: ["Hooks", "Context management", "Tool dispatch"], answer: 0, explain: "Hooks run your code before/after each tool call or on error — that's exactly where input checks and PII redactors plug in." },
          { q: "The answer appearing word by word as the model writes it — instead of all at once at the end — is called ___ . (one word)", answer: "streaming", explain: "Streaming shows tokens as they're generated. It's pure harness work — the model generates the same way either way." },
          { q: "Which is a good reason to BUILD your own loop instead of adopting a framework?", options: ["You want streaming and permissions for free", "You need full control of the loop, unusual tools, or tight cost control", "Frameworks don't work"], answer: 1, explain: "Free streaming/permissions/persistence is the buy signal. Build when you need control a framework would fight you on — or when 50 lines genuinely covers it." },
          { q: "Why build the harness by hand before reaching for a framework?", options: ["It's faster", "So you understand exactly what a framework gives you and when it's worth the lock-in", "Frameworks don't work"], answer: 1, explain: "Once you've built it yourself, you can read any framework and judge its magic honestly." }
        ]}
      ]
    }
];
