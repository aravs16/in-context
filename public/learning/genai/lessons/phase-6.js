// Phase 6 lesson content. Block types are rendered by LessonBlock in app.jsx.
window.PHASE_LESSONS = window.PHASE_LESSONS || {};
window.PHASE_LESSONS[6] = [
    {
      id: "intuition",
      label: "Intuition",
      blocks: [
        { t: "p", html: "In the last phase you gave your agent a second tool — it can now answer from documents <em>and</em> from your database. Which means one question can trigger several calls behind the scenes: a doc search, a SQL query, the model thinking two or three times. When the final answer comes back <em>wrong</em>, it tells you almost nothing about <em>why</em>. Which of those steps went sideways? You can't see it." },
        { t: "p", html: "What you need is for every request to keep a <strong>diary</strong>: each step writes an entry — what went in, what came out, how long it took (the wait time — engineers call it <strong>latency</strong>), and what it cost. That diary has a name: a <strong>trace</strong>." },
        { t: "p", html: "Watch one request write its diary. The chip up top is the request traveling through your agent; the timeline underneath is the trace filling in, one entry per step:" },
        { t: "traceflow" },
        { t: "p", html: "Notice what the timeline gives you that the final answer never could: you can see which step was slow, which step cost money, and what each step actually did. Once every request leaves a diary like this, debugging stops being detective work." },
        { t: "compare",
          question: "Your agent gave a wrong answer. Why?",
          left: {
            tag: "No traces",
            answer: "Re-run it, add print statements, guess, repeat. An hour later, maybe.",
            verdict: "Hours of guessing",
            note: "You can only see the final output, not the steps that led to it."
          },
          right: {
            tag: "With traces",
            answer: "Open the request's diary and drag back and forth through its timeline — like rewinding a video. The search step (Phase 2's look-up-the-right-paragraph step) pulled the wrong chunk. Found in 30 seconds.",
            verdict: "Seconds",
            note: "Every step is recorded in order, so the bad one is obvious."
          }
        },
        { t: "callout", kind: "key", title: "A trace is the request's diary", html: "A <strong>trace</strong> is a step-by-step timeline of one request — every model call and tool call, with its inputs, outputs, time, and cost. It turns \"why did it do that?\" from guesswork into reading." }
      ]
    },
    {
      id: "what-trace-shows",
      label: "What a trace shows",
      blocks: [
        { t: "p", html: "Each entry in the diary has a technical name: a <strong>span</strong> — one model call or one tool call, with its details. Stack the spans in order and you get the full <strong>trace tree</strong> for that request. Tools like <strong>Langfuse</strong> (hosted — it runs on their servers, you just sign up) or <strong>Arize Phoenix</strong> (runs on your own laptop) record the spans for you and show the tree in a UI you can click through." },
        { t: "diagram", mermaid: "flowchart LR\n  R[Agent request] --> S1[LLM call · span]\n  R --> S2[Tool call · span]\n  R --> S3[LLM call · span]\n  S1 & S2 & S3 --> TT[Trace tree]\n  TT --> UI[Langfuse / Phoenix UI]\n  TT --> M[Aggregate metrics<br/>latency · cost per request]" },
        { t: "p", html: "Make it concrete — here's what one real request's trace tree actually looks like, spans in order:" },
        { t: "steps", items: [
          "<strong>Span 1 · LLM call</strong> — the model decides it needs the doc-search tool. <code>180ms</code>, 340 tokens.",
          "<strong>Span 2 · Tool call</strong> — <code>search_docs(\"parental leave\")</code> runs against your Phase 2 index. <code>90ms</code>.",
          "<strong>Span 3 · LLM call</strong> — the model reads the retrieved chunk and writes the final answer. <code>1,100ms</code>, 620 tokens.",
          "<strong>Total</strong> — <code>1.37s</code> end to end, <code>$0.006</code> (the tool computes the dollar figure from the token counts for you, automatically)."
        ]},
        { t: "p", html: "Without a trace, all you'd see is that final answer, 1.37 seconds later. With one, you can see <em>exactly</em> where the time went — here, almost all of it is the last LLM call, not the search. That's the difference between guessing at a fix and reading the actual bottleneck." },
        { t: "callout", kind: "tip", title: "You don't write traces by hand", html: "These tools give you a <strong>wrapper</strong> — a line that sits around your model calls and records everything automatically. You add it once and the timeline shows up on its own." }
      ]
    },
    {
      id: "debug-story",
      label: "Reading a trace: a real bug",
      blocks: [
        { t: "p", html: "You've seen what a healthy trace looks like. Now use one to catch a real bug — this is the moment traces earn their keep." },
        { t: "p", html: "A Zentara employee asks the agent: <em>\"How much parental leave do I get?\"</em> It answers, confidently: <em>\"Zentara offers 15 days of paid vacation per year.\"</em> Fluent, polite — and about the wrong policy entirely." },
        { t: "p", html: "Your first instinct is to blame the prompt: <em>\"maybe I should tell it to be more careful about leave types…\"</em> You could spend an evening rewording instructions. Instead, open the trace:" },
        { t: "steps", items: [
          "<strong>Span 1 · LLM call</strong> — the model asked for <code>search_docs(\"parental leave\")</code>. Correct request. <em>Not the bug.</em>",
          "<strong>Span 2 · Tool call</strong> — the search returned the <em>vacation-policy</em> paragraph, not the parental-leave one. The similarity search matched on \"leave\" and \"paid time off\" and grabbed the wrong chunk. <strong>There's the bug.</strong>",
          "<strong>Span 3 · LLM call</strong> — the model faithfully summarized the paragraph it was handed. It did its job perfectly — with the wrong material."
        ]},
        { t: "p", html: "So the fix is in <strong>retrieval</strong> — better chunking, a better search query, maybe smaller chunks per Phase 2 — not in the prompt. A rewritten prompt would have changed nothing, because the model was never the problem. Thirty seconds of reading saved you an evening of tuning the innocent step." },
        { t: "callout", kind: "key", title: "Fix the step, not the symptom", html: "A wrong answer only tells you <em>that</em> something failed. The trace tells you <em>which step</em> failed. Without it, you tune whatever step you can see — usually the prompt — while the guilty one stays broken." }
      ]
    },
    {
      id: "seeing-to-saving",
      label: "From seeing to saving",
      blocks: [
        { t: "p", html: "Traces don't just catch bugs — once every call is recorded, you also get the <strong>numbers</strong>. Start with money. Zentara's agent averages <code>$0.006</code> per question. Sounds like nothing — until 500 employees ask it 4 questions a day: 2,000 requests × $0.006 = <strong>$12 a day, about $360 a month</strong>. Small numbers multiply." },
        { t: "p", html: "Time gets measured too. Alongside the <em>average</em> latency you'll see <strong>p95 latency</strong> everywhere, so here's what it means: line up all your response times from fastest to slowest — p95 is the time that 95% of requests beat. In plain words: <em>almost everyone waits less than this</em>. It's your bad-day number, and it matters more than the average, because users remember the slow requests, not the typical ones." },
        { t: "p", html: "And once you can measure cost, you can cut it — usually <strong>30–50% with no quality loss</strong>. On Zentara's $360/month, that's $110–180 back:" },
        { t: "list", items: [
          "<strong>Prompt caching</strong> — your system prompt and tool definitions are the same every call, so cache them and stop paying to re-read them. Often the single biggest win.",
          "<strong>Route by difficulty</strong> — send easy sub-tasks to a small cheap model; keep the frontier model for the hard parts.",
          "<strong>Trim the context</strong> — fewer retrieved chunks, shorter prompts. Less to read means less to pay for.",
          "<strong>Ask for structured output</strong> — have the model return JSON instead of prose you have to parse."
        ]},
        { t: "callout", kind: "tip", title: "You can't optimize what you can't measure", html: "This is why observability comes before tuning — the trace shows you exactly where the time and money are going, so you fix the real bottleneck instead of guessing." }
      ]
    },
    {
      id: "build",
      label: "Add tracing",
      blocks: [
        { t: "p", html: "Add tracing to the agent you've been building, then read the numbers. You'll use <strong>Langfuse</strong> (free hosted tier) or <strong>Phoenix</strong> (local). One heads-up before the code will do anything: Langfuse needs a <strong>free account and two API keys</strong> (a public one and a secret one) so it knows where to send your traces. That's a five-minute signup at cloud.langfuse.com — and the prompt below asks your assistant to walk you through it first. Phoenix skips the signup entirely because it runs on your machine." },
        { t: "assist",
          intro: "In your agent project, paste this:",
          prompt: "Add observability to my agent.py using Langfuse (free tier) or Arize Phoenix — recommend one and tell me why.\n\n- If Langfuse: first walk me through it step by step — creating the free account at cloud.langfuse.com, creating a project, finding the public and secret API keys, and putting them in a .env file so they're not in my code. Don't write the tracing code until the keys are in place.\n- Auto-trace every LLM call (model, prompt, response, input/output tokens, latency, computed cost) and every tool call (name, args, result, latency).\n- Build a small dashboard (a notebook is fine) showing per-request traces plus aggregate metrics: average and p95 latency, tokens per request, and $ per request over the last N requests.\n- Then suggest the top 2-3 cost cuts based on what the traces show (prompt caching, routing to a smaller model, trimming context).\n\nFinish by showing me how to open one trace and read its spans.",
          asks: [
            "What is a trace, and why can't I debug an agent without one?",
            "Where do my traces actually go when the code runs, and who can see them?",
            "What is prompt caching and why does it save so much?",
            "Which is easier to start with — Langfuse or Phoenix?"
          ]
        },
        { t: "p", html: "Read what it sets up — the key idea is a wrapper that records each call automatically:" },
        { t: "code", label: "observability — what good output looks like (read, don't type)", code: "# needs your Langfuse keys in .env first (free account — your assistant\n# walks you through it). Then: wrap the client once, every call is traced.\nfrom langfuse.anthropic import Anthropic   # drop-in wrapper, auto-traces calls\nclient = Anthropic()\n\nclient.messages.create(\n    model=\"claude-sonnet-4-6\", max_tokens=512,\n    messages=[{\"role\": \"user\", \"content\": question}])\n# recorded automatically: prompt, response, tokens, latency, cost\n\n# later: read the aggregate numbers, or open the Langfuse UI\n#   avg latency · p95 latency · tokens/request · $/request" },
        { t: "callout", kind: "key", title: "Deliverable — traces.ipynb", html: "A dashboard of per-request traces plus the aggregate numbers (latency, tokens, $). Now you can debug by reading, and cut cost by 30–50% on purpose instead of by luck." }
      ]
    },
    {
      id: "recap",
      label: "What you should know",
      blocks: [
        { t: "recap", items: [
          "Once an agent makes many calls, the final output can't tell you why it went wrong — you need <strong>traces</strong>.",
          "A <strong>trace</strong> is the request's diary: a step-by-step timeline where each entry is a <strong>span</strong> (one model or tool call, with inputs, outputs, time, and cost).",
          "Reading a trace tells you <strong>which step</strong> failed — Zentara's wrong leave answer was a retrieval bug, not a prompt bug, and only the trace could show that.",
          "Tools like <strong>Langfuse</strong> (hosted, needs a free account + API keys) or <strong>Phoenix</strong> (local) auto-record calls — you add a wrapper, not hand-written logging.",
          "Traces give you the numbers — latency (average and <strong>p95</strong>, the time 95% of requests beat), tokens, and cost per request — and you can't optimize what you can't measure.",
          "Common cuts (30–50% typical): <strong>prompt caching</strong>, routing easy work to a small model, trimming context, structured output.",
          "You built <code>traces.ipynb</code> — per-request traces plus aggregate metrics."
        ]},
        { t: "quiz", items: [
          { q: "Why can't you debug a multi-step agent from its final answer alone?", options: ["The answer is encrypted", "You can't see which of the many in-between steps went wrong", "LLMs don't make mistakes"], answer: 1, explain: "The final output hides the steps; a trace shows each one so you can find the bad step." },
          { q: "Zentara's agent answers a parental-leave question with the vacation policy. The trace shows the search step retrieved the wrong paragraph. What do you fix?", options: ["Rewrite the system prompt", "The retrieval step — better chunks or search", "Switch to a bigger model"], answer: 1, explain: "The trace showed the model summarized the wrong chunk faithfully — the bug lives in retrieval, so prompt or model changes would fix nothing." },
          { q: "Your dashboard says p95 latency is 4 seconds. What does that mean?", options: ["Every request takes exactly 4 seconds", "95% of requests finish faster than 4 seconds", "The agent fails 5% of the time"], answer: 1, explain: "Line up all response times — p95 is the time 95% of requests beat. It's your bad-day number, not the average." },
          { q: "Which usually gives the biggest single cost cut?", options: ["Prompt caching the system prompt and tools", "Using longer prompts", "Asking the model twice"], answer: 0, explain: "Your system prompt and tool definitions repeat on every call; caching them avoids paying to re-read them." },
          { q: "A step-by-step timeline of everything one request did is called a ___ . (one word)", answer: "trace", explain: "A trace is built from spans — one per model or tool call. Think of it as the request's diary." }
        ]}
      ]
    }
];
