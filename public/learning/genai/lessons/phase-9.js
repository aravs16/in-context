// Phase 9 lesson content. Block types are rendered by LessonBlock in app.jsx.
window.PHASE_LESSONS = window.PHASE_LESSONS || {};
window.PHASE_LESSONS[9] = [
    {
      id: "intuition",
      label: "Intuition",
      blocks: [
        { t: "p", html: "Your agent has come a long way: it calls tools (Phase 4), answers questions straight from your database (Phase 5), and remembers people across sessions (Phase 8). The tools are the part everyone else wants. You'd like your text-to-SQL tool inside <strong>Claude Desktop</strong> — the Claude chat app you install on your computer. A teammate wants it in Cursor, a coding app. The snag: every app expects tools wired up in its own format. Same tool, three formats, three copies. Fix a bug in one, and you have to remember to fix it in all three." },
        { t: "p", html: "You've lived this exact problem before — in a drawer at home. Before USB-C, every gadget had its own plug: one cable for the phone, another for the camera, a chunky barrel plug for the laptop, plus a tangle of adapters for the combinations. Then everyone agreed on <em>one plug shape</em>, and suddenly any charger fits any device. <strong>MCP (Model Context Protocol)</strong> is that agreement, for AI tools. (A <em>protocol</em> is just an agreed format for how two programs talk to each other.)" },
        { t: "p", html: "Here's how the “write once” part works. You wrap your tool in a small <strong>server</strong> — and that word needs rescuing first: a server is not a big humming machine in a basement. It's just <em>a small program that sits there waiting to be asked for things</em>. Yours can run right on your laptop. And “any app can plug in” isn't magic either: MCP fixes the exact format for the two questions every app needs to ask — <em>“what tools do you have?”</em> and <em>“run this one, with these arguments.”</em> Any app that can say those two sentences in the standard format can use any server that answers them." },
        { t: "p", html: "If that handshake sounds familiar, it should. In Phase 4 you saw that the LLM never sees your real code — the harness hands it a <em>description</em> of each tool, and the LLM replies “call this tool, with these args.” Tools are not new, and MCP didn't invent them. What MCP adds is a standard for how one program <strong>offers</strong> its tools to another — so the offering works even between programs that have never heard of each other." },
        { t: "p", html: "Why this matters compounds fast. Three apps and three tools, each pair wired by hand, is 3 × 3 = <strong>9</strong> custom connections to build and keep in sync. With one standard, each app implements the plug once and each tool implements it once: 3 + 3 = <strong>6</strong> pieces of work, ever. At a company with 5 apps and 20 tools, that's 100 hand-wirings collapsing to 25. Here's the before-picture — every app wired to every tool, separately:" },
        { t: "diagram", mermaid: "flowchart LR\n  subgraph apps[\"3 apps\"]\n    A1[\"Claude Desktop\"]\n    A2[\"Cursor\"]\n    A3[\"Your agent\"]\n  end\n  subgraph tls[\"3 tools — 9 custom wirings\"]\n    T1[\"SQL tool\"]\n    T2[\"Calendar\"]\n    T3[\"GitHub\"]\n  end\n  A1 --> T1 & T2 & T3\n  A2 --> T1 & T2 & T3\n  A3 --> T1 & T2 & T3" },
        { t: "p", html: "And the after-picture, once everyone agrees on the plug. Same three apps, same three tools — but every line now speaks the same language, so the tangle collapses:" },
        { t: "diagram", mermaid: "flowchart LR\n  subgraph apps[\"same 3 apps\"]\n    A1[\"Claude Desktop\"]\n    A2[\"Cursor\"]\n    A3[\"Your agent\"]\n  end\n  P([\"MCP<br/>one shared plug\"])\n  subgraph srv[\"same 3 tools, as MCP servers\"]\n    S1[\"SQL server\"]\n    S2[\"Calendar server\"]\n    S3[\"GitHub server\"]\n  end\n  A1 & A2 & A3 --> P\n  P --> S1 & S2 & S3" },
        { t: "compare",
          question: "You want your SQL tool in your agent, in Claude Desktop, and in Cursor.",
          left: {
            tag: "Without MCP",
            answer: "Write the tool three times — once per app's format — and keep all three in sync.",
            verdict: "Rewrites",
            note: "Every framework speaks its own tool language. 3 apps × 1 tool = 3 wirings, and it only gets worse."
          },
          right: {
            tag: "With MCP",
            answer: "Write it once as a small server; all three apps plug into the same one.",
            verdict: "Write once",
            note: "One shared plug: each app and each tool implements the standard once."
          }
        },
        { t: "callout", kind: "key", title: "What MCP is", html: "<strong>MCP (Model Context Protocol)</strong> is an <em>open standard</em> — a public rulebook anyone can read and implement, tied to no single company's product — created by Anthropic for how apps talk to tools. Write a tool once as a small <strong>server</strong> (a program that waits to be asked for things), and any MCP-compatible app can plug in and use it. USB-C for AI tools." }
      ]
    },
    {
      id: "how-mcp-works",
      label: "How MCP works",
      blocks: [
        { t: "p", html: "So a server sits there waiting to be asked. The app doing the asking is called the <strong>client</strong> — Claude Desktop, Cursor, Claude Code, and your own <code>agent.py</code> are all clients. And a server can offer more than just tools. MCP covers three kinds of things, and the names are worth keeping straight:" },
        { t: "list", items: [
          "<strong>Tools</strong> — actions the model can ask to run. Your <code>query_db</code> from Phase 5 is a tool: it <em>does</em> something and returns the result.",
          "<strong>Resources</strong> — read-only data the client can load into the model's context. Example: Zentara's holiday-calendar file, so the agent can check “is Friday a company holiday?” before promising a delivery date. Nothing runs — it's just a file to read.",
          "<strong>Prompts</strong> — saved, ready-made request templates. Example: the support team's “summarize this ticket” prompt — written carefully once, then offered to every app so nobody retypes (or mistypes) it."
        ]},
        { t: "p", html: "One server can offer all three at once. Here's a single Zentara support server, and the menu any connected client sees:" },
        { t: "diagram", mermaid: "flowchart LR\n  C[\"any MCP client<br/>Claude Desktop · Cursor · your agent\"] <-->|\"MCP\"| M\n  subgraph S[\"one MCP server — Zentara support\"]\n    M[\"the menu it offers\"]\n    M --> T[\"tools · query_db<br/>(an action to run)\"]\n    M --> R[\"resources · holiday calendar<br/>(a file to read)\"]\n    M --> P[\"prompts · summarize-a-ticket<br/>(a saved template)\"]\n  end" },
        { t: "callout", kind: "key", title: "Keeping the three straight", html: "Tools <strong>do</strong>, resources <strong>know</strong>, prompts <strong>say</strong>. An action to run, data to read, a request template to reuse." },
        { t: "callout", kind: "tip", title: "The real prize is the ecosystem", html: "There are hundreds of ready-made MCP servers — filesystem, GitHub, Slack, Gmail, Postgres, Linear. Once your agent speaks MCP, you can bolt any of them on without writing a line of tool code. You write one server, and in exchange you get everyone else's." }
      ]
    },
    {
      id: "build",
      label: "Build an MCP server",
      blocks: [
        { t: "p", html: "Time to prove “write once, use anywhere” with your own tool: turn the Phase 5 text-to-SQL tool into an MCP server, use it from Claude Desktop <em>and</em> your own agent, then bolt on a community server for free." },
        { t: "p", html: "Two quick introductions before you paste the prompt. You met <strong>Claude Desktop</strong> in the intuition — the Claude chat app you install on your computer, and itself an MCP client. Its <strong>config file</strong> is a small settings text file where you list the MCP servers it should connect to: add your server there, restart the app, and your tool appears in Claude's toolbox. Your assistant will edit that file for you — you just need to know it exists." },
        { t: "assist",
          intro: "In your project, paste this:",
          prompt: "Help me turn my text_to_sql tool into an MCP server.\n\n- Use the Python mcp SDK to wrap text_to_sql.ask() as one MCP tool, in a folder called sql_mcp_server.\n- Show me how to install it in Claude Desktop's config and test it there (ask Claude to query my database).\n- Then connect the same server to my own agent.py, so the one server works in both.\n- Finally, add one community MCP server (filesystem, GitHub, or Brave search) to my agent.\n\nExplain what tools, resources, and prompts mean in MCP.",
          asks: [
            "What problem does MCP actually solve?",
            "What's the difference between an MCP tool, resource, and prompt?",
            "What does the @mcp.tool() line do?",
            "How do I add a community MCP server to my agent?"
          ]
        },
        { t: "p", html: "Read what it builds — remember, you never have to write this yourself; your assistant does. A whole tool server is just a few lines:" },
        { t: "code", label: "sql_server.py — what good output looks like (read, don't type)", code: "# sql_server.py — your text-to-SQL tool, as an MCP server\nfrom mcp.server.fastmcp import FastMCP\nimport text_to_sql\n\nmcp = FastMCP(\"sql\")\n\n@mcp.tool()\ndef query_db(question: str) -> str:\n    \"\"\"Answer a question by running read-only SQL on the company database.\"\"\"\n    return str(text_to_sql.ask(question))   # your Phase 5 tool\n\nmcp.run()   # any MCP client (Claude Desktop, Cursor, your agent) can now use it" },
        { t: "p", html: "One line deserves a spotlight: <code>@mcp.tool()</code>. That label, sitting right above the function, tells the MCP library “offer this to any connected app as a tool.” That's the entire publishing step — the label puts <code>query_db</code> on the server's menu, and the sentence in quotes under its name becomes the tool description the model reads. The same description idea from Phase 4, now in a standard wrapper." },
        { t: "callout", kind: "key", title: "Deliverable — sql_mcp_server/", html: "A custom MCP server your agent consumes alongside one community server. You wrote a tool once and it works in every MCP client — and you gained a new capability without writing any tool code at all." }
      ]
    },
    {
      id: "recap",
      label: "What you should know",
      blocks: [
        { t: "recap", items: [
          "<strong>MCP</strong> is an open standard for how apps talk to tools — write a tool <strong>once</strong>, use it in any MCP client. USB-C for AI tools.",
          "Without a standard, N apps × M tools means N×M custom wirings; with MCP it's N + M — each side implements the plug once.",
          "A <strong>server</strong> is a small program that waits to be asked for things; <strong>clients</strong> (Claude Desktop, Cursor, your agent) connect to it by asking two standard questions: “what do you have?” and “run this one.”",
          "MCP covers <strong>tools</strong> (actions, like <code>query_db</code>), <strong>resources</strong> (read-only data, like a holiday-calendar file), and <strong>prompts</strong> (saved templates, like “summarize this ticket”).",
          "MCP didn't invent tools — your Phase 4 agent already had them. It standardizes how tools are <em>described and offered</em> between programs.",
          "The big win is the <strong>ecosystem</strong>: hundreds of ready-made servers you can plug in without writing tool code.",
          "You built <code>sql_mcp_server/</code> and added a community server to your agent."
        ]},
        { t: "quiz", items: [
          { q: "What problem does MCP solve?", options: ["Models are too slow", "Every app has its own tool format, so you rewrite tools for each", "Tools cost too much"], answer: 1, explain: "MCP is one shared format — one plug shape — so you write a tool once and any client can use it." },
          { q: "In MCP, you package a tool as a small ___ that clients connect to. (one word)", answer: "server", explain: "A server here is just a small program that sits waiting to be asked for things — it can run on your laptop. Claude Desktop, Cursor, and your agent all plug into the same one." },
          { q: "Zentara's holiday-calendar file — data the agent can read but never change — would be offered by an MCP server as a…", options: ["tool", "resource", "prompt"], answer: 1, explain: "Tools do, resources know, prompts say. A read-only file is a resource; an action like query_db is a tool; a saved “summarize this ticket” template is a prompt." },
          { q: "You have 4 apps and 5 tools. Without a standard that's up to 4 × 5 = 20 custom wirings. With MCP?", options: ["Still 20 — MCP just documents them", "9 — each app and each tool implements the standard once", "1 — MCP runs all the tools itself"], answer: 1, explain: "That's the N×M → N+M collapse: 4 apps implement the plug once each, 5 tools implement it once each — 4 + 5 = 9 pieces of work, ever." },
          { q: "Did MCP introduce the idea of tools?", options: ["Yes — tools didn't exist before MCP", "No — your agent had tools back in Phase 4; MCP standardizes how they're offered to any app", "No — tools are a Claude Desktop feature"], answer: 1, explain: "Phase 4's harness already handed the LLM tool descriptions. MCP standardizes that handshake so programs that have never met can share tools." },
          { q: "The biggest practical benefit of MCP is…", options: ["Faster models", "Hundreds of ready-made servers you can plug in for free", "Cheaper tokens"], answer: 1, explain: "Once your agent speaks MCP, the whole community ecosystem (GitHub, Slack, Postgres…) is available without writing tool code." }
        ]}
      ]
    }
];
