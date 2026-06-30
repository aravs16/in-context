/* GenAI Learning Plan — phase data. Plain JS global so it loads outside Babel. */
window.PHASES = [
  {
    n: 1,
    kicker: "FOUNDATIONS",
    icon: "terminal-window",
    title: "Talk to an LLM",
    goal: "Make your first API call and develop intuition for how LLMs respond.",
    what: [
      "An LLM is just an HTTP API. You send a list of <strong>messages</strong> (a system message describing who the assistant is, plus user/assistant turns) and you get back a generated message. That's the whole thing.",
      "The same model can produce wildly different outputs depending on the <strong>system prompt</strong> (its instructions), <strong>temperature</strong> (how random the sampling is), and <strong>max tokens</strong> (how long the reply can be). Before you build anything fancy, you need a gut feel for how these knobs change behavior.",
      "You'll also learn that <strong>different models</strong> have very different tradeoffs. A small, cheap model (Claude Haiku, GPT-4o-mini) is fast but less capable. A frontier model (Claude Sonnet/Opus, GPT-4o) is smarter but slower and ~30× more expensive. Picking the right one is a real engineering decision."
    ],
    plan: [
      "Sign up for an API account (Anthropic or OpenAI). Generate a key. Store it in a <code>.env</code> file — never commit it.",
      "Install the SDK: <code>pip install anthropic</code> or <code>pip install openai</code>.",
      "Write a ~20-line Python script: read a prompt from <code>sys.argv</code>, send it to the API, print the response.",
      "Add a <code>--model</code> flag. Run the same prompt against a small model and a frontier model. Note: response quality, latency, tokens used, dollar cost.",
      "Add <code>--system</code> and <code>--temperature</code> flags. See how a sharp system prompt (\"You are a terse senior engineer\") completely changes the output."
    ],
    research: [
      "What's the messages format for the Anthropic / OpenAI SDK? Show me a minimal example.",
      "How do I load API keys safely with python-dotenv?",
      "What does temperature actually do — explain in one paragraph.",
      "Help me count input and output tokens before sending so I can predict cost.",
      "What's a system prompt and why does it matter?"
    ],
    outcomes: [
      "You can call any LLM from the terminal in under a minute.",
      "You've felt the speed/quality/cost triangle in real numbers.",
      "You understand what a system prompt is and why it changes everything.",
      "You have a reusable <code>llm_chat.py</code> you'll build on for the next 10 phases."
    ],
    deliverable: { file: "llm_chat.py", desc: "A CLI that takes a prompt, optional model and system message, and returns a response." },
    concepts: ["API keys", "messages format", "model selection", "token counting"],
    diagram: `sequenceDiagram
  participant You as Your script
  participant API as LLM API
  You->>API: messages = [system, user]
  Note right of API: model · temperature · max_tokens
  API-->>You: assistant message
  Note left of You: tokens · latency · $`
  },

  {
    n: 2,
    kicker: "RAG",
    icon: "files",
    title: "Give the LLM your data",
    goal: "Answer questions over documents the model was never trained on.",
    what: [
      "<strong>RAG (Retrieval-Augmented Generation)</strong> is the standard way to give an LLM access to information beyond its training data — your company's docs, your personal notes, a PDF that was published yesterday.",
      "The pipeline has three steps. <em>Index time:</em> split your docs into <strong>chunks</strong>, turn each chunk into a numerical <strong>embedding</strong> (a vector that captures meaning), and store them in a <strong>vector database</strong> like FAISS. <em>Query time:</em> embed the question, find the K nearest chunks by similarity, and stuff them into the prompt as context. The LLM then answers using that retrieved context.",
      "The single biggest lever in RAG quality is <strong>chunking strategy</strong> — how you split the documents. Fixed-size, recursive (paragraph → sentence → token), and semantic (split where meaning shifts) all behave very differently. Most RAG failures trace back to bad chunks."
    ],
    plan: [
      "Pick a small corpus you actually care about (10–50 docs): your blog posts, a product manual, your obsidian notes, a few PDFs.",
      "Convert everything to plain text (use <code>pdfplumber</code> or <code>pypdf</code> for PDFs).",
      "Start naive: fixed-size chunks of ~500 chars with ~50-char overlap.",
      "Embed each chunk with <code>text-embedding-3-small</code> (OpenAI) or Voyage. Store vectors in a FAISS index (in-memory, no infra).",
      "Build a query function: embed the question → FAISS top-K search → format chunks into a prompt template → call the LLM.",
      "Now iterate on chunking: try recursive (split on paragraphs first, then sentences), then semantic. Compare answer quality on the same 5 hard questions."
    ],
    research: [
      "What is an embedding? Why does cosine similarity tell us which texts are 'similar'?",
      "FAISS quickstart in Python — show me index creation, add, and search.",
      "When should I use fixed-size vs. recursive vs. semantic chunking?",
      "What chunk size and overlap make sense for technical docs? For prose?",
      "How do I evaluate retrieval quality separately from answer quality?"
    ],
    outcomes: [
      "You can answer questions over your own documents.",
      "You've felt how chunk size and strategy change answer quality more than the model does.",
      "You can explain embeddings as 'vibes-as-vectors' to a friend.",
      "You have a reusable <code>rag.py</code> module to plug into the agent in Phase 4."
    ],
    deliverable: { file: "rag.py", desc: "Pass a query, get an answer grounded in your docs — with citations to the retrieved chunks." },
    concepts: ["embeddings", "vector search", "chunking trade-offs", "context window"],
    diagram: `flowchart LR
  subgraph idx[Index time]
    D[Docs] --> C[Chunks]
    C --> E[Embeddings]
    E --> V[(FAISS)]
  end
  subgraph qry[Query time]
    Q[Question] --> QE[Embed]
    QE --> S[Top-K search]
    S --> P[Prompt + context]
    P --> L[LLM]
    L --> A[Answer]
  end
  V -.-> S`
  },

  {
    n: 3,
    kicker: "EVAL",
    icon: "test-tube",
    title: "Stop guessing if it works",
    goal: "Measure quality systematically instead of eyeballing outputs.",
    what: [
      "<strong>Evaluation</strong> is how you know your LLM app actually works — not by reading a few outputs and saying \"looks good\", but with a test suite that runs on every change. Without eval, you're flying blind: a small prompt tweak can quietly break 30% of cases and you'll never notice until a user complains.",
      "<strong>Promptfoo</strong> is the most popular open-source eval framework. You write test cases in YAML (a question + assertions like \"answer must contain X\" or \"an LLM judge gives this a 4/5\"), define one or more <strong>providers</strong> (model + prompt template combinations), and run <code>promptfoo eval</code>. It gives you a side-by-side table with pass/fail, latency, and cost per cell.",
      "There's a vocabulary worth learning: <strong>offline eval</strong> (running tests against a fixed dataset, like CI) vs. <strong>online eval</strong> (measuring real user interactions in production). You're starting with offline. The hardest part isn't the tool — it's writing good test cases."
    ],
    plan: [
      "Install: <code>npm install -g promptfoo</code>.",
      "Write 10–20 test cases for your Phase 2 RAG pipeline. Mix easy questions (clear single-answer) with edge cases (ambiguous, multi-doc, out-of-scope).",
      "Configure 3–4 providers in <code>promptfooconfig.yaml</code>: e.g. (Sonnet + naive chunking), (Sonnet + recursive chunking), (Haiku + recursive chunking), (Haiku + verbose prompt).",
      "Use mixed assertions: <code>equals</code> and <code>contains</code> for factual questions, <code>llm-rubric</code> (LLM-as-judge) for fuzzy ones, <code>javascript</code> for custom checks.",
      "Run <code>promptfoo eval</code> and open the web UI. Pick a winner based on pass-rate × cost × latency — not just accuracy.",
      "Re-run any time you change a prompt, swap a model, or update the RAG pipeline. This is your regression net for the rest of the journey."
    ],
    research: [
      "What is LLM evaluation and why is eyeballing not enough?",
      "Show me a minimal Promptfoo config with two providers and three assertions.",
      "What's the difference between <code>equals</code>, <code>contains</code>, and <code>llm-rubric</code> assertions?",
      "How do I write a good eval dataset? How many cases do I need?",
      "What is LLM-as-judge and when does it fail?"
    ],
    outcomes: [
      "You can pick the right model + prompt + chunking combo based on data, not vibes.",
      "You have a regression suite that catches breakage when you change anything.",
      "You know what makes a good test case (and how painful it is to write 50).",
      "You can quantify a 'better' prompt with real numbers — accuracy, p95 latency, $/call."
    ],
    deliverable: { file: "promptfooconfig.yaml", desc: "A results table showing which model + prompt + chunking combo wins on your data." },
    concepts: ["offline eval", "regression testing", "LLM-as-judge", "data-backed selection"],
    diagram: `flowchart LR
  T[Test cases<br/>question + assertion] --> P[promptfoo eval]
  M1[Sonnet + naive chunks] --> P
  M2[Sonnet + recursive] --> P
  M3[Haiku + recursive] --> P
  P --> R[Comparison table<br/>accuracy · p95 · $]
  R --> W[Pick a winner]`
  },

  {
    n: 4,
    kicker: "AGENT",
    icon: "wrench",
    title: "Let the LLM use tools",
    goal: "Move from one-shot Q&A to an LLM that decides actions.",
    what: [
      "An <strong>agent</strong> is an LLM that can call <strong>tools</strong> (functions you define) and decide what to do next. You hand it a list of available tools with descriptions and parameter schemas. Instead of replying with text, the model can reply with \"call <code>search_docs(query='...')</code>\". Your code runs the tool, feeds the result back, and the model continues — maybe calling more tools, maybe answering. This think-act-observe loop is the agent.",
      "The key shift from a workflow to an agent: in a <strong>workflow</strong>, you decide the order of steps. In an <strong>agent</strong>, the LLM decides. That's powerful (handles novel inputs) and dangerous (the LLM picks badly when tool descriptions are vague).",
      "Tool descriptions are <strong>secretly another prompt</strong>. A good description tells the model when to use the tool, what it does, and what arguments mean. Bad descriptions cause the model to pick the wrong tool or hallucinate arguments — the #1 cause of agent failure."
    ],
    plan: [
      "Use the raw SDK (no LangChain yet — you need to feel the loop before a framework hides it).",
      "Define 3 tools as Python functions with clear docstrings and type hints. Wrap them in the SDK's tool format.",
      "Write the agent loop: while the model responds with a <code>tool_use</code>, run the tool and append the result; otherwise, return the final answer. Cap at ~10 iterations to prevent runaway loops.",
      "Wrap your Phase 2 RAG pipeline as a <code>search_docs</code> tool.",
      "Add 2 more general tools: a calculator and a web-search tool (Brave or Tavily API)."
    ],
    research: [
      "How does tool use / function calling work in Claude or GPT? Show a minimal example.",
      "How should I write tool descriptions so the model picks the right one?",
      "What's the ReAct pattern (Reason + Act)?",
      "How do I prevent an agent from looping forever?",
      "Anthropic's tool use guide — what are the must-know patterns?"
    ],
    outcomes: [
      "You have an assistant that picks the right capability for a question.",
      "You understand the difference between a workflow and an agent (and when each is right).",
      "You've felt how tool descriptions act as a second prompt.",
      "You've felt the agent loop end-to-end — Phase 5 plugs structured data (text-to-SQL) into the same shape."
    ],
    deliverable: { file: "agent.py", desc: "A chatbot that routes questions to the right tool: RAG, web search, or calculator." },
    concepts: ["function calling", "the agent loop", "ReAct", "tool descriptions"],
    diagram: `flowchart TD
  U[User question] --> L[LLM with tool list]
  L --> D{Tool call?}
  D -->|yes| T[Run tool<br/>RAG · search · calc]
  T --> R[Append result to messages]
  R --> L
  D -->|no| A[Final answer]`
  },

  {
    n: 5,
    kicker: "TEXT-TO-SQL",
    icon: "database",
    title: "Talk to your database",
    goal: "Let users ask structured questions in plain English.",
    what: [
      "<strong>Text-to-SQL</strong> is the pattern where the LLM writes SQL from a natural-language question. It's the highest-leverage pattern for structured data — most internal 'BI tools' are just text-to-SQL with a chart on top.",
      "The hard parts aren't writing the first prompt. They're <strong>schema grounding</strong> (telling the model which tables and columns exist), <strong>validation</strong> (making sure the generated SQL actually runs), and <strong>safety</strong> (read-only, no dropping tables, capped row counts)."
    ],
    plan: [
      "Pick a small SQLite DB — Chinook, Northwind, or your own 3–5 table dataset.",
      "Build the prompt: include the schema as <code>CREATE TABLE</code> statements, plus 2–3 few-shot Q/SQL examples and explicit constraints (<em>read-only, LIMIT 100</em>).",
      "Run the generated SQL. If it errors, send the error back to the model and ask for a fix — cap at one retry.",
      "Wrap the whole thing as a tool and plug it into your Phase 4 agent."
    ],
    research: [
      "Show me a minimal text-to-SQL prompt with schema injection and few-shot examples.",
      "How do I handle large schemas (50+ tables) that don't fit in the context window?",
      "What safety guards should always wrap a text-to-SQL tool?",
      "What does a SQL repair loop look like, and when should you stop retrying?"
    ],
    outcomes: [
      "You can answer questions over structured data without writing SQL.",
      "You understand schema injection — and why it gets hard once tables outnumber your context window.",
      "You've felt the generate → validate → repair pattern that applies to any code-generating LLM use.",
      "You have a SQL tool plugged into your agent — it'll become an MCP server in Phase 9."
    ],
    deliverable: { file: "text_to_sql.py", desc: "A schema-aware text-to-SQL tool with validation and a one-shot repair loop." },
    concepts: ["schema injection", "query validation", "repair loop", "structured outputs"],
    diagram: `flowchart LR
  Q[Question] --> P[Prompt + schema + few-shot]
  P --> L[LLM generates SQL]
  L --> V{Validate / run}
  V -->|error| R[Feed error back]
  R --> L
  V -->|ok| D[(SQLite)]
  D --> A[Rows → Answer]`
  },

  {
    n: 6,
    kicker: "OBSERVABILITY",
    icon: "chart-line",
    title: "See what's happening",
    goal: "Instrument the agent so you can debug and optimize it.",
    what: [
      "Once your agent makes multiple LLM and tool calls per request, you can't debug it from the final output alone. You need <strong>traces</strong> — a structured timeline of every step: which prompt went in, what came out, how many tokens, how long it took, what it cost.",
      "Tools like <strong>Langfuse</strong> (cloud, easy) and <strong>Arize Phoenix</strong> (local, open-source) wrap your LLM SDK calls and ship spans to a UI. You can click any request and walk through every model call and tool invocation in order. This turns \"why did it answer wrong?\" from hours of guessing into a 30-second scrub.",
      "Once you have traces, you also have <strong>aggregate metrics</strong>: avg/p95 latency, tokens per request, $/request. Now you can <em>optimize</em>: enable <strong>prompt caching</strong>, route simple subtasks to a smaller model, trim retrieved context, ask for structured JSON output instead of parsing prose. A 30–50% cost cut without quality loss is typical."
    ],
    plan: [
      "Pick Langfuse (managed, free tier) or Arize Phoenix (run locally with Docker). Either has a Python decorator that auto-instruments LLM calls.",
      "Wrap every LLM call: log model, prompt, response, input/output tokens, latency, computed cost.",
      "Wrap every tool call: name, args, return value, latency. Now the full trace tree is visible per request.",
      "Compute aggregate metrics over the last N requests: avg & p95 latency, tokens/req, $/req. Display in a notebook or simple dashboard.",
      "Apply cost cuts: turn on <strong>prompt caching</strong> for your system prompt + tool definitions (massive win), route easy subtasks to Haiku, trim retrieved context to top-3 chunks, switch to structured JSON outputs."
    ],
    research: [
      "What is distributed tracing? What's OpenTelemetry?",
      "Langfuse Python quickstart — auto-instrumenting Anthropic calls.",
      "How does Anthropic prompt caching work? What's the 90% discount about?",
      "What metrics should I track for an LLM app in production?",
      "Concrete strategies to cut LLM cost without dropping quality."
    ],
    outcomes: [
      "You can debug any agent failure by clicking through its trace.",
      "You know what your agent actually costs per request, in dollars.",
      "You've cut latency or cost by 30–50% with prompt caching + smaller models.",
      "You can answer 'what got better/worse in this PR' with numbers, not feelings."
    ],
    deliverable: { file: "traces.ipynb", desc: "A dashboard showing per-request traces and aggregate metrics (latency, tokens, $)." },
    concepts: ["tracing", "prompt caching", "token economics", "model routing"],
    diagram: `flowchart LR
  R[Agent request] --> S1[LLM call · span]
  R --> S2[Tool call · span]
  R --> S3[LLM call · span]
  S1 & S2 & S3 --> TT[Trace tree]
  TT --> UI[Langfuse / Phoenix UI]
  TT --> M[Aggregate metrics<br/>p95 latency · $/req]`
  },

  {
    n: 7,
    kicker: "GUARDRAILS",
    icon: "shield-check",
    title: "Keep the agent in its lane",
    goal: "Prevent unsafe, off-topic, or malformed outputs from reaching users.",
    what: [
      "<strong>Guardrails</strong> are filters wrapped around your agent that block bad inputs and bad outputs. Without them, your app is one prompt injection away from an embarrassing screenshot.",
      "There are three layers. <strong>Input guards</strong> reject obviously off-topic or malicious prompts (jailbreaks, scope violations). <strong>Output guards</strong> validate the response: schema-check JSON, redact PII, refuse content that violates safety policy. <strong>Trust guards</strong> use a separate small model as <strong>LLM-as-judge</strong> to check that the answer is actually grounded in retrieved context — the cheapest way to catch hallucinations.",
      "Critical principle: <strong>defense in depth</strong>. No single guard is enough. A jailbreak slips past the input guard but gets caught by the output guard. A subtle hallucination passes schema check but is flagged by the groundedness judge. Layer them."
    ],
    plan: [
      "Implement an <strong>input guard</strong>: a fast classifier prompt that returns yes/no — \"Is this question in scope for our app?\" Reject early with a friendly message.",
      "Implement an <strong>output guard</strong>: Pydantic schema validation on JSON outputs + a regex/library-based PII redactor (emails, phones, SSNs).",
      "Add a <strong>groundedness check</strong>: \"Given this retrieved context and this answer, is the answer supported by the context? Answer yes/no with one-sentence reason.\" Run it with a cheap small model.",
      "Wire all three as pre/post hooks around the Phase 4 agent loop. Fail fast and return a safe canned response when any guard trips.",
      "Re-run your Phase 3 Promptfoo evals to confirm guardrails don't break good queries. Add a few <em>adversarial</em> test cases (jailbreak attempts, off-topic) and verify they're rejected."
    ],
    research: [
      "What are common prompt-injection patterns? Show me the top 5.",
      "Compare Guardrails AI, NeMo Guardrails, and llm-guard — what do they each do best?",
      "What is LLM-as-judge for groundedness? When does it produce false positives?",
      "What's the OWASP LLM Top 10?",
      "How do I redact PII in Python (presidio, regex)?"
    ],
    outcomes: [
      "Your agent refuses out-of-scope requests gracefully instead of guessing.",
      "Outputs are always schema-valid and PII-redacted.",
      "You can catch most hallucinations before they reach the user.",
      "You understand defense in depth — and why a single LLM call is never enough on its own."
    ],
    deliverable: { file: "guardrails.py", desc: "Before/after hooks wrapping the agent: input scope check, output schema/PII guards, groundedness judge." },
    concepts: ["defense in depth", "LLM-as-judge", "prompt injection", "PII redaction"],
    diagram: `flowchart LR
  U[User input] --> IG{Input guard<br/>in scope?}
  IG -->|no| X[Safe message]
  IG -->|yes| A[Agent]
  A --> OG{Output guard<br/>schema · PII}
  OG -->|invalid| X
  OG -->|valid| GC{Groundedness<br/>LLM judge}
  GC -->|hallucination| X
  GC -->|grounded| R[Response]`
  },

  {
    n: 8,
    kicker: "MEMORY",
    icon: "brain",
    title: "Agents that remember",
    goal: "Move from stateless chat to persistent, personalized interactions.",
    what: [
      "An LLM call is stateless — the model forgets everything between requests. <strong>Memory</strong> is the system you build around the model to make it feel persistent.",
      "There are two tiers. <strong>Short-term memory</strong> is the conversation history within a single session: you store messages in a list, pass the last N turns into each new prompt. <strong>Long-term memory</strong> is facts about the user that survive across sessions: their name, preferences, past projects, recurring topics. Stored in SQLite or a vector DB keyed by user_id, loaded into the system prompt at session start.",
      "The third concept is <strong>identity</strong>: the user profile + persistent system prompt that makes \"this agent\" feel like <em>this</em> agent. And as conversations grow long, you'll need <strong>compaction</strong>: replace old turns with a summary so you don't blow the context window."
    ],
    plan: [
      "Short-term: store messages in-memory keyed by <code>session_id</code>. Pass the last N turns into each new prompt.",
      "Long-term: at session end, call an LLM to extract durable facts (\"user lives in Atlanta\", \"works on agentic AI at AWS\"). Store them in SQLite, tagged by <code>user_id</code> and timestamp.",
      "On new session start: load the user's facts + a summary of their most recent session into the system prompt. The agent now picks up where it left off.",
      "Add a vector store over old conversation summaries — when a question relates to past topics, retrieve and inject them (long-term recall, not just last session).",
      "Handle context limits with compaction: when a session exceeds N tokens, summarize the oldest M turns and replace them with the summary."
    ],
    research: [
      "How does ChatGPT 'remember' me between sessions? What's actually stored?",
      "Compare Mem0, Letta (formerly MemGPT), and LangChain's memory modules — what's the right tool for me?",
      "What is context-window management and why does it matter?",
      "Strategies for conversation summarization without losing key facts.",
      "How do I extract user facts from a conversation reliably?"
    ],
    outcomes: [
      "Your agent remembers you across sessions and references past chats.",
      "Long conversations don't blow up the context window.",
      "You can build a personalized assistant, not a stateless chatbot.",
      "You understand the recall vs. cost tradeoff — more memory = bigger, slower, costlier prompts."
    ],
    deliverable: { file: "memory.py", desc: "The agent remembers across sessions, summarizes long chats, and personalizes replies." },
    concepts: ["memory tiers", "compaction", "user modeling", "identity"],
    diagram: `flowchart TB
  subgraph st[Short-term · this session]
    H[Last N turns]
  end
  subgraph lt[Long-term · persisted]
    F[User facts]
    S[Past summaries]
  end
  Q[New question] --> P[System prompt + loaded context]
  F --> P
  S --> P
  H --> P
  P --> AG[Agent]
  AG --> R[Response]
  AG -.summarize.-> S
  AG -.extract.-> F`
  },

  {
    n: 9,
    kicker: "MCP",
    icon: "plugs",
    title: "Standardize your tools",
    goal: "Make tools portable across agents and clients.",
    what: [
      "<strong>MCP (Model Context Protocol)</strong> is an open standard from Anthropic for how agents talk to tools. Before MCP, every framework had its own tool format — you'd write a tool for LangChain, then rewrite it for Claude Code, then rewrite it again for your own agent.",
      "With MCP, you write a tool <strong>once</strong> as a small server. Any MCP-compatible client (Claude Desktop, Cursor, Claude Code, your custom agent) can plug in and use it. The protocol covers <strong>tools</strong> (actions), <strong>resources</strong> (read-only data), and <strong>prompts</strong> (templated requests).",
      "The big win is the <strong>ecosystem</strong>. There are hundreds of community MCP servers — filesystem, GitHub, Slack, Gmail, Postgres, Linear. Once your agent speaks MCP, you can bolt on any of them for free."
    ],
    plan: [
      "Read the MCP spec (it's short — server, client, tools, resources, prompts). Skim Anthropic's intro doc.",
      "Pick one of your tools — the Phase 5 text-to-SQL tool is a great candidate — and rewrite it as an <strong>MCP server</strong> using the <code>mcp</code> Python SDK.",
      "Install your server in Claude Desktop's config and verify it works there: ask Claude to query your DB.",
      "Connect the same server to your agent code. Proof: the same server works across multiple clients.",
      "Add a community MCP server (filesystem, GitHub, or Brave search) to your agent. You just gained a capability without writing any code."
    ],
    research: [
      "MCP introduction — modelcontextprotocol.io. What problem does it solve?",
      "Show me a minimal MCP server in Python.",
      "What's the difference between MCP, OpenAI function calling, and ChatGPT plugins?",
      "Where do I find community MCP servers? What are the highest-quality ones?",
      "How do MCP resources and prompts work (not just tools)?"
    ],
    outcomes: [
      "Your tools are now portable — any MCP client can use them.",
      "You can plug community MCP servers into your agent for free capability.",
      "You understand the boundary between capability (the server) and agent code (the client).",
      "You can contribute back to the open MCP ecosystem."
    ],
    deliverable: { file: "sql_mcp_server/", desc: "A custom MCP server your agent consumes alongside one community server." },
    concepts: ["tool portability", "MCP ecosystem", "capability vs. agent code"],
    diagram: `flowchart LR
  subgraph clients[Clients]
    CD[Claude Desktop]
    YA[Your agent]
    CR[Cursor]
  end
  subgraph servers[MCP servers]
    OWN[Your SQL server]
    FS[Filesystem]
    GH[GitHub]
  end
  CD <-->|MCP| servers
  YA <-->|MCP| servers
  CR <-->|MCP| servers`
  },

  {
    n: 10,
    kicker: "AGENT EVAL",
    icon: "clipboard-text",
    title: "Test the whole loop",
    goal: "Evaluate the agent end-to-end, not just individual prompts.",
    what: [
      "Prompt eval (Phase 3) checks single LLM calls. <strong>Agent eval</strong> checks the whole loop: did the agent pick the right tool? With the right arguments? Did the multi-step trajectory reach a correct answer? This is harder because you're testing <em>behavior</em>, not just output.",
      "A typical agent test case has: a task, a starting state, an expected <strong>trajectory</strong> (which tools should be called, with roughly what args), and a final-answer assertion. You evaluate on multiple dimensions: <strong>trajectory correctness</strong>, <strong>hallucination rate</strong>, <strong>refusal rate</strong> (refusing things it shouldn't, or failing to refuse things it should), <strong>cost per task</strong>, and <strong>latency</strong>.",
      "Tools: Promptfoo now supports agent eval. LangSmith, Arize Phoenix, and Braintrust have richer agent-specific dashboards. Whichever you use, the hardest part is the same as before: writing the test cases. A solid 30-case golden dataset is more valuable than any framework."
    ],
    plan: [
      "Write 10–20 agent test cases: a task + expected trajectory (which tools, what arguments) + final-answer assertion.",
      "Add behavioral assertions: \"must call the SQL tool\", \"must not hallucinate a price\", \"must refuse if asked outside scope\".",
      "Track dimensions: trajectory correctness, hallucination rate, refusal rate, $/task, p95 latency.",
      "Plug it into CI (GitHub Actions): fail the build if pass-rate drops below a threshold (say, 90%).",
      "Add a nightly run against a larger eval set so you catch slow drift across model updates."
    ],
    research: [
      "What's the difference between output evaluation and trajectory evaluation?",
      "Promptfoo agent assertions — show me a config that checks tool calls.",
      "How does LangSmith evaluate agents end-to-end?",
      "What pass-rate threshold should I require before shipping an agent change?",
      "How do I build a 'golden dataset' for agent eval — and how big should it be?"
    ],
    outcomes: [
      "You catch regressions before users do.",
      "Every prompt or model change has a measurable impact you can show in a PR.",
      "You can ship agent updates with confidence, not vibes.",
      "You've started a golden dataset of test cases — the real long-term moat for any LLM app."
    ],
    deliverable: { file: "agent_evals/", desc: "A regression suite that runs in CI and catches behavior drift across prompt, model, and tool changes." },
    concepts: ["trajectory eval", "behavior testing", "regression CI", "golden datasets"],
    diagram: `flowchart LR
  T[Test cases<br/>task + expected trajectory] --> E[Agent eval runner]
  E --> TR[Trajectory check<br/>right tools · right args]
  E --> HC[Hallucination check]
  E --> CC[Cost · latency]
  TR & HC & CC --> D[Pass/fail dashboard]
  D --> CI[CI gate]`
  },

  {
    n: 11,
    kicker: "MULTI-AGENT",
    icon: "users-three",
    title: "From one agent to a team",
    goal: "Decompose hard problems across specialized agents.",
    what: [
      "One agent with too many tools gets confused — it picks the wrong tool, drifts off-task on long jobs, blows the context window. <strong>Multi-agent</strong> means decomposing the problem across specialized agents that hand work to each other.",
      "Anthropic's <em>Building Effective AI Agents</em> codifies <strong>6 patterns</strong>: prompt chaining (sequential), routing (pick the right specialist), parallelization (fan-out), orchestrator-workers (a manager that delegates), evaluator-optimizer (one agent reviews another's work), and autonomous agents (long-running, goal-directed loops). Internalize these — they're the vocabulary for any multi-agent design.",
      "Frameworks: <strong>LangGraph</strong> (graph-based, explicit state, the most flexible), <strong>Strands</strong> (lighter, AWS-aligned, easier to start), <strong>OpenAI Swarm</strong> (peer-to-peer handoff, minimal). Pick one. They all express the same patterns differently.",
      "<strong>The honest caveat:</strong> multi-agent is overkill for most apps. A single well-prompted agent with good tools beats a 6-agent swarm 80% of the time. Reach for multi-agent when a single agent demonstrably fails — not because the architecture sounds cool."
    ],
    plan: [
      "Read Anthropic's <em>Building Effective AI Agents</em> end-to-end. Sketch a one-line example of each of the 6 patterns from your own domain.",
      "Pick LangGraph or Strands. Rebuild your Phase 4 agent as an <strong>orchestrator-workers</strong> setup: a planner agent + RAG agent + SQL agent, coordinated by an orchestrator.",
      "Try the <strong>swarm</strong> pattern: agents hand off based on capability with no central coordinator.",
      "Compare orchestration styles on the same task. Supervisor for clear hierarchy; peer-to-peer when routing is fuzzy.",
      "Be honest in writing: where did multi-agent <em>help</em>? Where did it just add latency and bugs? Save that note."
    ],
    research: [
      "Anthropic's 'Building Effective AI Agents' — what are the 6 patterns and when does each fit?",
      "LangGraph quickstart vs. Strands quickstart — which fits a small project?",
      "When does multi-agent help vs. hurt vs. a single agent with more tools?",
      "What is OpenAI's Swarm pattern? What's it good for?",
      "Compare AutoGen, CrewAI, LangGraph, Strands at a high level."
    ],
    outcomes: [
      "You can decompose a complex task across specialists with intent.",
      "You've internalized the 6 patterns and know when each fits.",
      "You've seen the real multi-agent failure modes (infinite handoffs, context blow-up, coordination overhead).",
      "You know when <em>not</em> to use multi-agent — usually a single agent with better tools wins."
    ],
    deliverable: { file: "swarm.py", desc: "A planner + researcher + SQL agent, coordinated by an orchestrator — with notes on what helped and what didn't." },
    concepts: ["orchestration", "handoffs", "the 6 patterns", "when multi-agent hurts"],
    diagram: `flowchart TD
  U[User task] --> O[Orchestrator]
  O --> P[Planner agent]
  O --> R[Researcher · RAG]
  O --> S[SQL agent]
  P -.-> O
  R -.-> O
  S -.-> O
  O --> A[Final answer]`
  },

  {
    n: 12,
    kicker: "HARNESS",
    icon: "stack",
    title: "The runtime around the model",
    goal: "Understand what production agent frameworks actually do for you.",
    what: [
      "The <strong>agent harness</strong> is everything around the model — tool dispatch, retry/backoff, context management, streaming output, interrupt handling, permission prompts, session persistence, pre/post-tool hooks. Frameworks like LangGraph, Strands, and Claude Code <em>are</em> harnesses.",
      "Understanding what a harness provides (and what you've been doing manually) is the difference between \"I wrote an agent\" and \"I have a production agent system.\" Most of the engineering complexity in agentic apps lives in the harness, not the model.",
      "The final exercise: compare your hand-rolled agent loop side-by-side with a real harness like Claude Code or LangGraph. What did they reinvent? What's worth borrowing? What did you do better because you understood the underlying problem?"
    ],
    plan: [
      "Make a feature comparison matrix: tool dispatch, retries, streaming, hooks, permissions, session persistence, observability. Fill in: your hand-rolled loop, LangGraph, Strands, Claude Code.",
      "Pick one feature your loop is missing (most commonly: streaming, or pre/post-tool hooks). Add it.",
      "Optional: build a minimal harness — agent loop with pluggable hooks (<code>before_tool</code>, <code>after_tool</code>, <code>on_error</code>), a permission system, and session state.",
      "Write a short doc: when to use a heavy framework vs. when to build your own. What does Claude Code's harness give you that you'd otherwise reinvent?"
    ],
    research: [
      "What does an agent 'harness' actually do? Make me a checklist.",
      "Claude Code architecture deep-dives — what's in the harness?",
      "LangGraph internals — how does its state management work?",
      "What permission models are used in agentic systems? (allow-all, prompt-per-action, scoped, etc.)",
      "When should you build your own harness vs. adopt a framework?"
    ],
    outcomes: [
      "You understand the production complexity that lives <em>outside</em> the model.",
      "You can evaluate any new agent framework in 30 minutes — you know what to look for.",
      "You can decide build-vs-buy on agent infra with clarity.",
      "You see Claude Code (and similar tools) as a harness running a model — demystified."
    ],
    deliverable: { file: "harness.md", desc: "A feature comparison + writeup of harnesses you've used, plus one feature added to your own loop." },
    concepts: ["the model vs. the system around it", "production complexity", "build vs. buy"],
    diagram: `flowchart TB
  YC[Your code · agent definition] --> H
  subgraph H[Agent harness]
    direction LR
    TD[Tool dispatch]
    RT[Retry / backoff]
    CM[Context mgmt]
    HK[Hooks · pre · post · error]
    PR[Permissions]
    SS[Session state]
    ST[Streaming]
  end
  H <--> M[LLM API]`
  }
];

window.NEXT_STEPS = [
  {
    n: 1,
    when: "NOW",
    title: "Build your own thing",
    lede: "The phases gave you skills. You need a project to own — something with a real user (even if that user is you). Pick one, ship it.",
    items: [
      { t: "A personal assistant",            d: "an agent over your own notes, calendar, and email." },
      { t: "A tool for one person you know",  d: "a friend's small business workflow; your sibling's hobby; your parents' recipe vault." },
      { t: "A clone with a twist",            d: "pick a tool you already use daily and remake a smarter version with agents." }
    ]
  },
  {
    n: 2,
    when: "WEEKLY",
    title: "Stay in the loop",
    lede: "This field moves weekly. Don't try to read everything — pick 2 or 3 of these and stick with them.",
    items: [
      { t: "Anthropic Engineering blog",  d: "patterns from people running real production agents." },
      { t: "Simon Willison's blog",       d: "daily-ish, opinionated — the best 'what's new this week' filter." },
      { t: "Latent Space podcast",        d: "honest interviews with people actually building." },
      { t: "AI Snake Oil",                d: "calibrated takes on what AI can and can't actually do." },
      { t: "A community Discord",         d: "Anthropic's, MCP's, or r/LocalLLaMA — pick one, lurk, then ask questions." }
    ]
  },
  {
    n: 3,
    when: "LATER",
    title: "Go deeper, when you're ready",
    lede: "After you've shipped something of your own, pick ONE of these to dive into. Don't try to learn them all at once — you don't need to.",
    items: [
      { t: "Fine-tuning",                    d: "for when prompting and RAG hit a real ceiling." },
      { t: "Advanced RAG",                   d: "reranking, hybrid search, query rewriting, multi-hop." },
      { t: "Voice & vision agents",          d: "multimodal opens up product categories text can't touch." },
      { t: "Code agents",                    d: "Claude Code internals, SWE-bench style problems." },
      { t: "Browser & computer-use agents",  d: "agents that click and type on real UIs." },
      { t: "Alignment & safety",             d: "why agents fail in subtle ways, and how to catch it." }
    ]
  }
];

window.PLAN_TIPS = [
  { k: "Don't hand-code — direct an AI", v: "You don't need to know how to program. Tell a coding assistant (Claude Code, Cursor, ChatGPT) what each phase should build, run what it gives you, then ask it to explain anything you don't follow. The skill you're building is judgment, not typing." },
  { k: "Don't skip ahead", v: "Each phase depends on the one before it. Memory without observability is hard to debug. Multi-agent without eval is chaos." },
  { k: "Ship the artifact", v: "If you didn't run it end-to-end, you don't understand it." },
  { k: "Keep one running codebase", v: "Don't start a new repo per phase — extend the same one. The point is watching complexity accrete." },
  { k: "Pause to write", v: "After each phase, write 5 bullets on what surprised you. That's where the real learning compounds." }
];
