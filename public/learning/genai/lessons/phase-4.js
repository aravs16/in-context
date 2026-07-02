// Phase 4 lesson content. Block types are rendered by LessonBlock in app.jsx.
window.PHASE_LESSONS = window.PHASE_LESSONS || {};
window.PHASE_LESSONS[4] = [
    {
      id: "intuition",
      label: "Intuition",
      blocks: [
        { t: "p", html: "Everything so far has the model <em>talking</em> — it reads text and writes text back. But it can't <em>do</em> anything: it can't look something up, run a calculation, or check today's date. Ask a plain model <code>8,347 × 219</code> and it'll hand you a confident, wrong number." },
        { t: "p", html: "The obvious fix: give it a calculator. But here's the part almost everyone gets backwards at first — <strong>the model itself never touches the calculator.</strong> Remember Phase 1: an LLM is a math function, reached over an API, running on someone else's computers. It has no hands, no internet connection, no ability to run code. All it can ever do is send back <em>more text</em>." },
        { t: "p", html: "Here's a picture worth keeping for the rest of the course: the LLM is a <strong>brain in a jar</strong>. Brilliant, endlessly well-read — but sealed behind glass. It can hear you and talk back, and that is the entire list of things it can do. To get anything done in the real world, it needs a pair of <strong>hands outside the jar</strong>: something that listens for “please press the calculator buttons for me,” actually presses them, and reads the display back through the glass. This whole phase is about building those hands." },
        { t: "p", html: "So what does “give it a calculator” actually look like? Just one small round trip:" },
        { t: "diagram", mermaid: "flowchart LR\n  A[\"the LLM is told:<br/>a calculator(a, b, op) tool exists\"] --> B[\"the LLM replies:<br/>a=8347 · b=219 · op=×\"]\n  B --> C[\"the real multiplication<br/>happens elsewhere: 1,828,993\"]\n  C --> D[\"the LLM reads that,<br/>answers: 1,828,993 ✓\"]" },
        { t: "p", html: "Notice what the LLM actually contributed: not the answer 1,828,993 — just the <strong>numbers and the operator</strong>, <code>a=8347, b=219, op=×</code>. That's still just a prediction, the same next-word mechanism from Phase 1 — it's predicting <em>which tool-call text</em> comes next, not computing anything. The real multiplication happens somewhere else entirely, which is exactly what the rest of this phase is about." },
        { t: "compare",
          question: "What's 8,347 × 219?",
          left: {
            tag: "LLM alone",
            answer: "\"About 1,824,000.\" (A confident guess — and wrong.)",
            verdict: "Guesses",
            note: "It predicts a plausible-looking number. It never actually multiplies anything — it can't."
          },
          right: {
            tag: "LLM + a harness",
            answer: "The LLM replies with text: \"call calculator(8347, 219)\". Something else — code running on your side — actually runs the multiplication and gets 1,828,993. The LLM reads that back and answers.",
            verdict: "Delegates, then answers",
            note: "The model never touched the calculator. It only ever said what it wanted done."
          }
        },
        { t: "callout", kind: "key", title: "The critical correction", html: "The LLM <strong>never executes a tool.</strong> It can only reply with text saying <em>which</em> tool it wants and <em>what</em> arguments to use. Something else has to actually run it and report back — code that runs on your side, called the <strong>harness</strong>. (And no, you won't be writing that code by hand — your coding assistant writes it for you, in the Build section.) Get this backwards and nothing else in this phase will make sense." }
      ]
    },
    {
      id: "the-harness",
      label: "The harness",
      blocks: [
        { t: "p", html: "In the intuition we left the LLM as a brain in a jar, asking for a pair of hands. The <strong>harness</strong> is those hands. Concretely, it's just a program: it holds the real tool functions (an actual calculator, an actual web search), sends the LLM a request, reads what it replies, and — when the LLM asks for a tool — is the one that actually runs it." },
        { t: "p", html: "And here's <em>where</em> those hands live: <strong>on your side</strong>. The harness runs wherever you run your program — your laptop today, maybe a server you control later. The model, meanwhile, stays exactly where it's been since Phase 1: behind the API, on the provider's computers. Two different machines, talking over the internet. Nothing about the model moved; you just put smarter code on your end of the line." },
        { t: "p", html: "One more detail that trips people up: the LLM never sees your real function. It only ever sees a <strong>description</strong> — the tool's name, what it does, and what arguments it takes. That description is what you hand the model as plain text; the actual working code never leaves your side. It stays inside the harness." },
        { t: "diagram", mermaid: "flowchart LR\n  subgraph H[\"the harness — code on your machine\"]\n    LOOP[\"the loop\"]\n    RT[\"the real tool functions\"]\n    LOOP -->|\"3 · runs it directly\"| RT\n    RT -->|\"4 · result\"| LOOP\n  end\n  LOOP -->|\"1 · question + tool descriptions\"| LLM[\"the LLM<br/>(behind the API)\"]\n  LLM -->|\"2 · call this tool, with these args\"| LOOP\n  LOOP -->|\"5 · tool result\"| LLM\n  LLM -->|\"6 · final answer\"| U[\"you\"]" },
        { t: "steps", items: [
          "<strong>The loop sends the question, plus every tool's description,</strong> to the LLM. Still just text in.",
          "<strong>The LLM replies with a tool call</strong> — the name of a tool and the arguments to use. Not real code, just text saying what it wants.",
          "<strong>The loop runs the real function directly</strong> — inside the harness, on your machine, no LLM involved. This is the one step the model can never do itself.",
          "<strong>The real function returns its result</strong> back to the loop — a plain value, like a number or a string.",
          "<strong>The loop sends that result to the LLM</strong> as a new message, appended to the conversation so far.",
          "<strong>The LLM reads the result and answers</strong> — or, if it needs more, asks for another tool and the loop repeats from step 2."
        ]},
        { t: "p", html: "Step 3 said “the loop runs the real function” — but what actually counts as a tool here? Almost anything. A <strong>tool</strong> isn't one specific kind of thing; it's just some real action your code can perform, wrapped up with a name and a description so the LLM knows it's available." },
        { t: "list", items: [
          "<strong>A plain function</strong> — <code>calculator(a, b)</code>: pure code, no network, just arithmetic.",
          "<strong>A call to an external API</strong> — <code>get_weather(city)</code>: reaches out to a weather service over the internet and returns whatever it says.",
          "<strong>A database query</strong> — <code>run_sql(query)</code>: runs SQL against your company's database and returns the rows. (This is exactly Phase 5's tool.)",
          "<strong>A file read</strong> — <code>read_file(path)</code>: opens a file sitting on your machine and returns its text.",
          "<strong>One of your own systems</strong> — <code>search_docs(query)</code>: runs the RAG pipeline you built in Phase 2.",
          "<strong>A real-world side effect</strong> — <code>send_email(to, subject, body)</code>, <code>create_calendar_event(...)</code>: doesn't just return information, it actually changes something."
        ]},
        { t: "callout", kind: "warn", title: "The LLM can't tell the difference", html: "From the model's side, every tool looks identical — a name, a description, some arguments. Whether calling it means doing harmless arithmetic or sending a real email to a real customer is entirely up to what <em>your</em> code does when the harness runs it. Guard the risky ones accordingly (more on this in Phase 7)." },
        { t: "callout", kind: "tip", title: "Same shape as Phase 1's loop", html: "This is still the predict-and-continue loop from Phase 1. The only difference: some of the \"words\" the model can produce are tool calls instead of plain text — and now there's a harness in the middle, carrying messages back and forth and doing the actual work." }
      ]
    },
    {
      id: "agent-loop",
      label: "The agent loop",
      blocks: [
        { t: "p", html: "Put all of that on repeat and you get the full <strong>agent loop</strong>. Watch it happen, start to finish, on the calculator example:" },
        { t: "agentloopflow", question: "8,347 × 219?", toolName: "calculator", toolCall: "calculator(8347, 219)", toolResult: "1,828,993", finalAnswer: "1,828,993 ✓" },
        { t: "p", html: "Notice the harness does <em>all</em> the moving — it carries the question to the LLM, carries the decision back, runs the real tool, carries the result back, and finally carries the answer out. The LLM only ever sits in one place and decides." },
        { t: "steps", items: [
          "The harness sends the LLM the question, plus the list of available tools.",
          "The LLM replies with <strong>either</strong> one or more tool calls (each a name + arguments) <strong>or</strong> a final answer — nothing else is possible.",
          "If it's tool calls: the harness runs each <strong>real</strong> function and sends every result back to the LLM as a new message. Back to step 2.",
          "If it's a final answer: the harness hands it back to you. Loop over."
        ]},
        { t: "p", html: "Did you catch “one <em>or more</em>”? The model can ask for several tools in a single reply when they don't depend on each other. Ask <em>“which is warmer today, Boston or Seattle?”</em> and it may request <code>get_weather(\"Boston\")</code> <strong>and</strong> <code>get_weather(\"Seattle\")</code> in the same turn — the harness simply runs both and sends both results back together. When one call <em>depends</em> on another's result, though, it has to go one round at a time — you'll see exactly that in the next section." },
        { t: "callout", kind: "tip", title: "Always cap the loop", html: "Cap it at some number of rounds (say, 10) so a confused agent that keeps asking for tools can't spin forever. Enforcing that cap is entirely the harness's job — the model has no concept of \"too many rounds.\"" },
        { t: "callout", kind: "tip", title: "Workflow vs agent", html: "In a <strong>workflow</strong>, <em>you</em> hard-code the order of steps. In an <strong>agent</strong>, the <em>model</em> decides the order — the harness just carries out whatever it asks for. Agents handle surprises a fixed script can't — but they also fail in ways a fixed script can't. Reach for an agent only when you genuinely can't lay out the steps ahead of time." }
      ]
    },
    {
      id: "chained-loop",
      label: "Two tools, one question",
      blocks: [
        { t: "p", html: "One round trip is enough for a calculator. Real questions usually aren't that polite. Here's one from Zentara Logistics — our made-up shipping company — that <em>no single tool</em> can answer: <em>“Where is order #4817 right now?”</em>" },
        { t: "p", html: "The harness has two tools on offer: <code>lookup_order(order_id)</code> — fetches an order's status and which truck it's on — and <code>get_truck_location(truck_id)</code> — returns a truck's live GPS position. Neither alone gets you there. Watch the loop chain them:" },
        { t: "steps", items: [
          "The harness sends the question plus both tool descriptions to the LLM.",
          "The LLM replies: <em>call</em> <code>lookup_order(order_id=\"4817\")</code>. (It can't check the truck yet — it doesn't know which truck.)",
          "The harness runs the real lookup and gets back: <code>status: in transit, truck: T-42</code>. It sends that to the LLM as a new message.",
          "The LLM reads it. That's a clue, not an answer — <em>T-42</em> is a truck id, not a location. So it replies: <em>call</em> <code>get_truck_location(truck_id=\"T-42\")</code>.",
          "The harness runs it and gets back: <code>on I-80 near Omaha, ETA Thursday 2pm</code>. Sends that to the LLM too.",
          "The LLM now has everything, and replies with a final answer: <em>“Order #4817 is in transit on truck T-42, currently on I-80 near Omaha — expected delivery Thursday around 2pm.”</em>"
        ]},
        { t: "p", html: "Two things to notice. First, the second tool call <strong>used the first one's result</strong> — the model couldn't have asked for T-42's location before learning the truck was T-42. That's why chained calls go one round at a time, unlike the two-cities weather example. Second, <strong>nobody scripted that order</strong>. There's no line of code anywhere saying “first look up the order, then check the truck.” The model read each result and decided what it needed next." },
        { t: "callout", kind: "key", title: "This is what \"agent\" actually means", html: "The model plans the route — which tool, with what arguments, based on what it just learned — and the harness does every step of the actual walking. Decision-making and doing are split across two machines: the model behind the API decides; your code at home does." }
      ]
    },
    {
      id: "tool-descriptions",
      label: "Describing your tools",
      blocks: [
        { t: "p", html: "In the Zentara example, how did the model know <code>lookup_order</code> even existed, or what to pass it? Only from its <strong>description</strong>. That's why the single biggest thing that makes or breaks an agent isn't the model — it's how you describe your tools to it. A tool description is really just another prompt: it's the <em>only</em> information the LLM has when deciding whether to reach for that tool." },
        { t: "p", html: "Good news: a good description follows one simple rule. Every time, it answers three questions:" },
        { t: "steps", items: [
          "<strong>What</strong> the tool does — one plain sentence.",
          "<strong>When</strong> to use it — the kinds of questions it's for (and, if it's easily confused with another tool, when <em>not</em> to).",
          "<strong>What each argument means</strong> — so the model fills them in instead of making them up."
        ]},
        { t: "p", html: "Watch the rule pass and fail on the same tool:" },
        { t: "compare",
          question: "A tool that looks things up in your company docs",
          left: {
            tag: "Vague description",
            answer: "\"search — searches stuff.\"",
            verdict: "Agent fails",
            note: "Answers none of the three questions — so the model uses it for everything, or never, and invents arguments."
          },
          right: {
            tag: "Clear description",
            answer: "\"search_docs(query): search the internal HR and policy documents. Use for questions about benefits, leave, or company rules. query = the topic to look up, in plain English.\"",
            verdict: "Agent works",
            note: "What it does ✓ when to use it ✓ what the argument means ✓ — all three, in two sentences."
          }
        },
        { t: "callout", kind: "warn", title: "This is the #1 cause of agent failure", html: "Vague tool descriptions make the model pick the wrong tool or make up arguments. Spend your effort writing clear <strong>what / when / arguments</strong> descriptions — it helps more than a bigger model." }
      ]
    },
    {
      id: "build",
      label: "Build the agent",
      blocks: [
        { t: "p", html: "Time to build <code>agent.py</code> — a harness that routes each question to the right tool: your Phase 2 RAG for document questions, a web search for current events, a calculator for math. You'll have the loop written plainly (no framework yet) so you can see every moving part." },
        { t: "assist",
          intro: "In your project (with rag.py handy), paste this into your assistant:",
          prompt: "Build agent.py: a harness that lets an LLM call tools and decide what to do, without ever letting the model run code itself.\n\n- Define 3 tools as plain Python functions with clear docstrings that say what the tool does, when to use it, and what each argument means: search_docs (wraps my rag.py answer()), web_search (use Tavily or Brave), and calculator.\n- Send the model the question plus the tool descriptions, then run the loop: while it replies with tool calls (it may ask for more than one at once — run them all), YOUR code runs the real functions and feeds the results back as a new message; when it replies in plain text, that's the final answer. Cap it at 10 rounds.\n- Show me how to set up the API keys and run it on a few questions that each need a different tool.\n\nThen explain, step by step, who does what in that loop — the model vs. my code.",
          asks: [
            "Why can't the LLM just run the tool itself?",
            "What exactly does the model see for each tool — the code, or something else?",
            "Why does the description of a tool matter so much?"
          ]
        },
        { t: "p", html: "Read what it builds. The heart of it is the loop — the harness keeps running tools until the model stops asking for them. (The sample below uses Anthropic's SDK, the course default. If you picked OpenAI back in Phase 1, your assistant will produce the equivalent — the names differ, the shape of the loop is identical.)" },
        { t: "code", label: "agent.py — what good output looks like (read, don't type)", code: "# agent.py — the harness: carries messages, runs tools, never lets the model touch either\nfrom anthropic import Anthropic\nclient = Anthropic()\n\nTOOLS = [search_docs_def, web_search_def, calculator_def]  # descriptions only — name + schema\n\ndef run(question):\n    messages = [{\"role\": \"user\", \"content\": question}]\n    for _ in range(10):                       # the harness caps the loop\n        reply = client.messages.create(\n            model=\"claude-sonnet-4-6\", max_tokens=1024,\n            tools=TOOLS, messages=messages)\n        messages.append({\"role\": \"assistant\", \"content\": reply.content})\n        calls = [b for b in reply.content if b.type == \"tool_use\"]\n        if not calls:                         # no tool call -> this IS the final answer\n            return reply.content[0].text\n        results = [\n            {\"type\": \"tool_result\", \"tool_use_id\": c.id,\n             \"content\": run_tool(c.name, c.input)}   # the harness runs it — never the model\n            for c in calls\n        ]\n        messages.append({\"role\": \"user\", \"content\": results})\n    return \"Stopped: too many tool calls.\"" },
        { t: "callout", kind: "tip", title: "Spot the plural", html: "See the variable <code>calls</code>? Plural on purpose. That's the several-tools-at-once case from the agent-loop section: if the model asks for two tools in one reply, the harness runs each real function and sends <em>all</em> the results back together." },
        { t: "callout", kind: "key", title: "Deliverable — agent.py", html: "A harness that routes each question to the right tool — RAG, web search, or calculator — runs it for real, and loops until the model can answer. Phase 5 hands it one more tool: your database." }
      ]
    },
    {
      id: "recap",
      label: "What you should know",
      blocks: [
        { t: "recap", items: [
          "An <strong>agent</strong> is an LLM that can ask for <strong>tools</strong> and decide what to do next — but it never runs them itself. Brain in a jar; the harness is its hands.",
          "The <strong>harness</strong> is code on <em>your</em> side — your laptop or your server — while the model stays behind the API from Phase 1. It carries messages to and from the LLM and is the only thing that ever actually runs a tool.",
          "The LLM only ever sees a tool's <strong>description</strong> (name, purpose, arguments) — never the real function.",
          "The <strong>agent loop</strong>: harness sends question + tools → LLM replies with one <em>or more</em> tool calls, or a final answer → harness runs them all and reports back → repeat, always capped.",
          "Tool calls can <strong>chain</strong>: the model picks its next call based on the last result (look up the order → then locate that truck) — nobody scripts the sequence.",
          "A good tool description answers three things: <strong>what</strong> it does, <strong>when</strong> to use it, <strong>what the arguments mean</strong>. Vague descriptions are the #1 cause of agent failure.",
          "<strong>Workflow</strong> = you decide the steps; <strong>agent</strong> = the model decides, and the harness carries it out.",
          "You built <code>agent.py</code> — a harness that routes to RAG, web search, or a calculator."
        ]},
        { t: "quiz", items: [
          { q: "When the model decides to use a tool, who actually runs it?", options: ["The model, on its own servers", "The harness — your code", "The tool runs itself"], answer: 1, explain: "The LLM only ever replies with which tool it wants and what arguments — the harness is the only thing that actually executes it." },
          { q: "Where does the harness run?", options: ["On the LLM provider's computers, next to the model", "On your side — your laptop or a server you control", "Inside the model, as part of its learned numbers"], answer: 1, explain: "The harness is your program, running on your machine. The model stays where Phase 1 put it: behind the API, on the provider's computers." },
          { q: "What does the LLM see for each available tool?", options: ["The real function's source code", "Only a description — name, purpose, and arguments", "Nothing until it's called"], answer: 1, explain: "The model only ever sees a plain-text description. The real, working code never leaves the harness." },
          { q: "The model replies asking for two tool calls in a single turn. What happens?", options: ["That's an error — only one tool call per turn is allowed", "The harness runs both real functions and sends both results back", "The model runs one of them itself to save time"], answer: 1, explain: "Independent calls can arrive together in one reply — the harness runs each of them and returns all the results. (Calls that depend on each other's results still go one round at a time.)" },
          { q: "In the Zentara example, why couldn't the model ask for the truck's location in its very first reply?", options: ["Trucks can't be located by an LLM", "It didn't yet know which truck — that came from the first tool's result", "The harness only allows one tool per question"], answer: 1, explain: "Chained calls depend on earlier results: only after lookup_order returned \"truck T-42\" could the model ask get_truck_location for T-42. The model plans the next step from what it just learned." },
          { q: "A good tool description says what the tool does, when to use it, and what its ___ mean. (one word)", answer: "arguments", explain: "What / when / arguments — the three-part rule. Descriptions that skip any of the three make the model pick wrong tools or invent inputs." },
          { q: "The code that carries messages to the model and runs tools on its behalf is called the ___ . (one word)", answer: "harness", explain: "The harness is the machinery around the model — you'll see this word again, much expanded, in Phase 12." }
        ]}
      ]
    }
];
