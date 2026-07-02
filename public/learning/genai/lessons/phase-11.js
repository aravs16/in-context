// Phase 11 lesson content. Block types are rendered by LessonBlock in app.jsx.
window.PHASE_LESSONS = window.PHASE_LESSONS || {};
window.PHASE_LESSONS[11] = [
    {
      id: "intuition",
      label: "Intuition",
      blocks: [
        { t: "p", html: "Your agent has come a long way: it answers from your docs (Phase 2), queries your database (Phase 5), and since Phase 10 you can even test its behavior. But keep piling tools onto that one agent and it starts to crack: with fifteen tools it picks the wrong one, on long jobs it drifts off-task, and it blows the context window trying to hold everything at once. A single brain can only juggle so much." },
        { t: "p", html: "Restaurants solved this exact problem long ago. A tiny café has one cook who does everything — takes the order, grills, plates, washes up. It works until the dinner rush, when that one cook starts burning things. A busy kitchen runs differently: a <strong>head chef</strong> reads each incoming order and calls out the pieces; each <strong>station</strong> — grill, sauté, pastry — owns exactly one job with its own equipment; finished plates come back to the head chef, who assembles the dish. Crucially, nobody shouts across the kitchen at each other — everything flows through the head chef." },
        { t: "p", html: "<strong>Multi-agent</strong> is that kitchen. You split the job across <em>specialist</em> agents — each with one narrow job and a small set of tools — coordinated by one agent that hands out work and combines the results." },
        { t: "compare",
          question: "A complex task: research the docs, query the database, and write a report.",
          left: {
            tag: "One agent, many tools",
            answer: "Fifteen tools in one prompt — it picks the wrong one and loses the thread halfway through.",
            verdict: "Overloaded",
            note: "The lone café cook in a dinner rush: too many choices, too much to hold in mind at once."
          },
          right: {
            tag: "A small team",
            answer: "A planner splits the work; a RAG agent and a SQL agent each do their part; a writer combines it.",
            verdict: "Focused",
            note: "Each station has one job and few tools, so each does it well."
          }
        },
        { t: "callout", kind: "key", title: "What multi-agent is", html: "<strong>Multi-agent</strong> breaks a hard problem into specialized agents that pass work between them — a kitchen brigade instead of one overwhelmed cook. Each agent has a narrow job and a small set of tools, so it stays focused." }
      ]
    },
    {
      id: "how-agents-talk",
      label: "How agents talk",
      blocks: [
        { t: "p", html: "So a team beats an overloaded generalist. But what does “hand work to each other” actually mean, mechanically? Is one agent messaging another? Sharing a chat room? Reading each other's minds?" },
        { t: "p", html: "Here's the satisfying part: <strong>you already know the mechanism.</strong> It's the Phase 4 tool call, and nothing more. In Phase 4, your harness — the code around the model — told the LLM “a <code>calculator</code> tool exists,” and when the model asked for it, your code ran it and fed the text result back. To call a whole <em>agent</em>, the orchestrator's harness does exactly the same thing: it lists the worker as a tool. When the orchestrator asks for it, the harness runs the worker's entire agent loop — its own prompt, its own tools, as many rounds as it needs — and feeds the worker's final answer back as an ordinary tool result." },
        { t: "p", html: "You'll never write this yourself — your coding assistant will — but seeing it kills the mystery. To the orchestrator, a whole agent sits in the tool list right next to a calculator, and the model can't tell the difference:" },
        { t: "code", label: "read, don't type — a worker agent is registered as a plain tool", code: "# to the orchestrator, a whole agent is just one more tool\ndef ask_researcher(question):\n    return researcher_agent(question)   # runs a FULL agent loop, returns its final text\n\nTOOLS = [ask_researcher_def, calculator_def]  # side by side — request in, text out, either way" },
        { t: "diagram", mermaid: "flowchart TD\n  U[User task] --> O[Orchestrator agent]\n  O -->|\"1 · asks for the tool<br/>ask_researcher(question)\"| H[Orchestrator's harness]\n  H -->|\"2 · runs the whole<br/>researcher loop\"| R[Researcher agent<br/>own prompt · own tools]\n  R -.->|\"3 · final answer, as text\"| H\n  H -.->|\"4 · ordinary tool result\"| O\n  O --> A[Answer to user]" },
        { t: "callout", kind: "key", title: "An agent is just a tool that thinks", html: "To the caller, a worker agent looks like any other tool: a request goes in, text comes back. The only difference is what happens inside — a full agent loop instead of one function. Every multi-agent pattern you'll meet is built from this one move." }
      ]
    },
    {
      id: "patterns",
      label: "The patterns",
      blocks: [
        { t: "p", html: "Once agents can call agents, the question becomes: <em>how do you wire the kitchen?</em> Anthropic's <em>Building Effective AI Agents</em> — the short guide most teams start from — names five ways to arrange a team. (Its sixth pattern is one you already know: the single autonomous agent, the one you built in Phase 4.) These five are the vocabulary for any multi-agent design:" },
        { t: "list", items: [
          "<strong>Routing</strong> — a dispatcher reads the request and sends it to the right specialist. <em>Kitchen:</em> the expediter reads a ticket and calls it to the right station. <em>Zentara:</em> a front-door agent sends “where's my parcel?” to the tracking agent and “this invoice is wrong” to the billing agent.",
          "<strong>Orchestrator-workers</strong> — a manager agent breaks the task into pieces, hands each to a worker, then combines the results. (You'll build this one.) <em>Kitchen:</em> the head chef splits a banquet order across stations and plates the final dish. <em>Zentara:</em> “prepare the Meridian account review” — docs questions go to the RAG worker, numbers to the SQL worker, and a writer assembles the report.",
          "<strong>Prompt chaining</strong> — a fixed sequence: the output of one agent feeds the next. <em>Kitchen:</em> an assembly line — prep, cook, plate, always in that order. <em>Zentara:</em> draft a delay-apology email → check it against the refund policy → translate it for the customer's region.",
          "<strong>Evaluator-optimizer</strong> — one agent does the work, a second reviews it and sends it back for another pass. <em>Kitchen:</em> the head chef tastes the dish and returns it until it's right. <em>Zentara:</em> one agent drafts a customs declaration, a checker agent verifies every code, and it loops until clean.",
          "<strong>Parallelization</strong> — fan the same work out to several agents at once and merge the answers. <em>Kitchen:</em> three cooks each prep a batch simultaneously for a big order. <em>Zentara:</em> quote one shipment with three carrier agents at the same time, then pick the cheapest."
        ]},
        { t: "p", html: "Here's the pattern you'll build — orchestrator-workers — drawn as a kitchen: the head chef in the middle, stations around it." },
        { t: "diagram", mermaid: "flowchart TD\n  U[User task] --> O[Orchestrator]\n  O --> P[Planner agent]\n  O --> R[Researcher · RAG]\n  O --> S[SQL agent]\n  P -.-> O\n  R -.-> O\n  S -.-> O\n  O --> A[Final answer]" },
        { t: "p", html: "<em>Reading the arrows:</em> <strong>solid arrows</strong> are work being handed out — the head chef passing tickets to stations. <strong>Dashed arrows</strong> are results reporting back. Every hand-out and every report-back is the same Phase 4 move from the last section: a tool call in, text back out." }
      ]
    },
    {
      id: "caveat",
      label: "The honest caveat",
      blocks: [
        { t: "p", html: "Before you rush off to build a brigade, here's the part most tutorials skip: <strong>multi-agent is overkill for most apps.</strong> A single well-prompted agent with good tools beats a six-agent swarm about 80% of the time — and the swarm adds latency, cost, and a pile of new ways to fail. A food truck with a three-item menu does not need a head chef and five stations." },
        { t: "p", html: "The signals that you genuinely need a team are specific:" },
        { t: "list", items: [
          "<strong>Tool confusion</strong> — one agent with 12+ tools keeps picking the wrong one, and trimming descriptions didn't fix it.",
          "<strong>Long-task drift</strong> — jobs with many steps where the agent loses the thread before the end.",
          "<strong>Genuinely parallel work</strong> — independent pieces (three carrier quotes, five documents to summarize) that could truly run at the same time."
        ]},
        { t: "callout", kind: "warn", title: "When NOT to use a team", html: "One agent with good tools beats a team you can't debug. Every handoff is a seam where information gets dropped or garbled — and a wrong answer can now be hiding inside any of five agents <em>or</em> in the seams between them. Remember Phase 6: you needed traces to see inside <em>one</em> agent. A team multiplies that — you need a trace for every agent plus every handoff, or debugging becomes guesswork. Don't go multi-agent because the diagram looks impressive; do it when a single agent <em>demonstrably</em> can't cope." }
      ]
    },
    {
      id: "build",
      label: "Build a small team",
      blocks: [
        { t: "p", html: "Time to run the kitchen yourself. You'll rebuild your Phase 4 agent — <code>agent.py</code>, the one that routes questions to your RAG, a web search, or a calculator — as an orchestrator-workers team: a planner, a RAG agent, and a SQL agent, coordinated by an orchestrator. Then, just as important, you'll write down honestly where the team helped and where it just added overhead." },
        { t: "assist",
          intro: "In your project, paste this:",
          prompt: "Rebuild my single agent as a small multi-agent team using LangGraph or Strands.\n\n- An orchestrator that breaks a task into steps and delegates.\n- A RAG worker (wraps my rag.py) and a SQL worker (wraps my text_to_sql tool).\n- A writer that combines the workers' results into a final answer.\n- Run it on a task that needs both docs and data.\n\nThen help me compare it to my single agent on the same task: where did the team help, and where did it just add latency and bugs?",
          asks: [
            "What are the main multi-agent patterns, in plain terms?",
            "Mechanically, how does the orchestrator call a worker — is it just a tool call?",
            "When is multi-agent worth it, and when is it overkill?",
            "Should I pick LangGraph or Strands to start?"
          ]
        },
        { t: "p", html: "Read what it builds — the head chef in code. The orchestrator plans, hands each step to the right station, and plates the result:" },
        { t: "code", label: "swarm.py — what good output looks like (read, don't type)", code: "# swarm.py — an orchestrator delegating to specialist agents\ndef orchestrator(task):\n    plan = planner_agent(task)                # read the ticket: break the task into steps\n    results = []\n    for step in plan:\n        if step.kind == \"docs\":\n            results.append(rag_agent(step))   # Phase 2 RAG, working one station\n        elif step.kind == \"data\":\n            results.append(sql_agent(step))   # Phase 5 SQL, working another\n    return writer_agent(task, results)        # plate it: combine into a final answer" },
        { t: "callout", kind: "key", title: "Deliverable — swarm.py", html: "A planner + researcher + SQL agent coordinated by an orchestrator — plus an honest note on what the team helped with and what it didn't. Knowing when <em>not</em> to use multi-agent is half the skill. Next, in the finale, you'll step back and put a name on all the machinery you've built around the model." }
      ]
    },
    {
      id: "recap",
      label: "What you should know",
      blocks: [
        { t: "recap", items: [
          "<strong>Multi-agent</strong> splits a hard task across specialists — a kitchen brigade: one head chef hands out work, each station owns one job, everything flows back through the chef.",
          "Mechanically, agents talk the Phase 4 way: to the caller, a whole agent is <strong>just one more tool</strong> — a request goes in, text comes back. The harness runs the worker's entire loop behind that tool call.",
          "Five team patterns: <strong>routing</strong>, <strong>orchestrator-workers</strong>, <strong>prompt chaining</strong>, <strong>evaluator-optimizer</strong>, <strong>parallelization</strong> — the sixth in Anthropic's guide is the single autonomous agent you built in Phase 4.",
          "Use a team because one agent is overloaded — too many tools, too-long tasks, truly parallel work — not because it sounds cool.",
          "<strong>Honest truth</strong>: a single good agent beats a swarm ~80% of the time, and a team multiplies your Phase 6 tracing needs — every agent and every handoff needs a trace.",
          "You built <code>swarm.py</code> — a planner + RAG + SQL team — with notes on what helped and what didn't."
        ]},
        { t: "quiz", items: [
          { q: "Why split work across multiple agents?", options: ["More agents are always better", "One agent with too many tools gets confused and loses the thread", "It's cheaper"], answer: 1, explain: "Specialists with narrow jobs and few tools each stay focused where one overloaded agent drifts — like stations in a kitchen." },
          { q: "Mechanically, what happens when an orchestrator “hands work” to a worker agent?", options: ["The two models talk to each other directly over the internet", "The orchestrator's harness calls the worker exactly like a Phase 4 tool — a request goes in, the worker's final text comes back", "The worker reads the orchestrator's context window"], answer: 1, explain: "A worker agent is registered as a plain tool. The harness runs the worker's whole loop and returns its final answer as an ordinary tool result." },
          { q: "A manager agent that breaks a task into pieces and hands them to workers is the ___ pattern.", options: ["routing", "orchestrator-workers", "chaining"], answer: 1, explain: "Orchestrator-workers: the head chef splits the order across stations, then plates the combined result." },
          { q: "One agent drafts a customs declaration; a second reviews it and sends it back until it's clean. Which pattern is that?", options: ["Routing", "Evaluator-optimizer", "Parallelization"], answer: 1, explain: "Evaluator-optimizer: one agent does the work, another tastes the dish and returns it for another pass." },
          { q: "Fan the same job out to several agents at once and merge their answers — that's the ___ pattern. (one word)", answer: "parallelization", explain: "Parallelization: like three carrier agents quoting the same Zentara shipment simultaneously, then picking the cheapest." },
          { q: "Your five-agent team returns a wrong answer. Why is that harder to debug than one agent?", options: ["It isn't — more agents means more chances one got it right", "The mistake could be inside any agent or lost in a handoff, so you need Phase 6-style traces for every agent and every seam", "Multi-agent teams don't make mistakes"], answer: 1, explain: "Teams multiply tracing needs. A team you can't trace is a team you can't debug — which is why one agent with good tools often wins." },
          { q: "True or false: most apps are better off with multiple agents than one.", options: ["True", "False"], answer: 1, explain: "False — a single well-prompted agent beats a swarm most of the time. Reach for a team only when one agent demonstrably can't cope." }
        ]}
      ]
    }
];
