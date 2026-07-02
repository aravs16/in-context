// Phase 5 lesson content. Block types are rendered by LessonBlock in app.jsx.
window.PHASE_LESSONS = window.PHASE_LESSONS || {};
window.PHASE_LESSONS[5] = [
    {
      id: "intuition",
      label: "Intuition",
      blocks: [
        { t: "p", html: "Your Phase 4 agent can already search documents, browse the web, and do math. But think about where most of a company's answers actually live. At <strong>Zentara Logistics</strong> — our made-up shipping company — the answer to <em>\"how many customers signed up in May?\"</em> isn't written in any document. It sits in a <strong>database</strong>: neat rows and tables of customers, orders, and payments. Your Phase 2 RAG is great with prose, but this answer isn't in any paragraph — it has to be <em>counted</em>." },
        { t: "p", html: "Databases already have a precise language for exactly these questions: <strong>SQL</strong>. The only catch is that most people can't write it. So here's the idea — let the model write the SQL for you, from plain English." },
        { t: "compare",
          question: "How many customers signed up in May?",
          left: {
            tag: "RAG over your docs",
            answer: "\"I couldn't find that in the documents.\"",
            verdict: "Wrong tool",
            note: "The number isn't in any paragraph — it has to be computed from rows."
          },
          right: {
            tag: "Text-to-SQL",
            answer: "Writes SELECT COUNT(*) FROM customers WHERE month = 'May', runs it → 412.",
            verdict: "Exact",
            note: "It turned the question into a query the database can answer precisely."
          }
        },
        { t: "p", html: "Don't worry about reading that query — here it is, word for word: <code>SELECT COUNT(*)</code> means <em>\"count the rows\"</em>, <code>FROM customers</code> means <em>\"in the customers table\"</em>, and <code>WHERE month = 'May'</code> means <em>\"but only the rows where the month is May.\"</em> One line of SQL, one plain-English sentence: <em>count the customers who signed up in May</em>. And you'll never have to write these yourself — writing them is the model's whole job in this phase." },
        { t: "callout", kind: "key", title: "What text-to-SQL is", html: "<strong>Text-to-SQL</strong>: the model turns a plain-English question into a database query. Most internal <strong>BI tools</strong> (business intelligence — the dashboard apps full of charts that your finance team stares at all day) are exactly this: text-to-SQL with a chart drawn on top." }
      ]
    },
    {
      id: "how-it-works",
      label: "How it works",
      blocks: [
        { t: "p", html: "The flow is short. You give the model three things: the <strong>question</strong>, the <strong>schema</strong> — the database's table of contents: which tables exist and what columns each one has — and a few <strong>examples</strong>: two or three question→SQL pairs pasted into the prompt, so the model can see the pattern it should copy. The model writes a SQL query. Your code runs that query, hands the rows back, and the model turns them into a plain answer." },
        { t: "diagram", mermaid: "flowchart LR\n  Q[Question] --> P[Prompt + schema + examples]\n  P --> L[LLM writes SQL]\n  L --> V{Runs cleanly?}\n  V -->|error| R[Feed the error back]\n  R --> L\n  V -->|ok| D[(Database)]\n  D --> A[Rows → answer]" },
        { t: "callout", kind: "key", title: "This is Phase 4's loop wearing a new hat", html: "Look at who does what: the model <em>asks</em> (by writing SQL as text), the <strong>harness</strong> runs the query for real, and the result comes back as a new message. Same pattern as the calculator in Phase 4 — the LLM never touches the database itself. Text-to-SQL is just one more tool in your agent's toolbox." }
      ]
    },
    {
      id: "end-to-end",
      label: "One question, end to end",
      blocks: [
        { t: "p", html: "Let's watch one real question travel the whole pipeline. A Zentara manager asks: <em>\"Which three customers shipped the most packages in June?\"</em>" },
        { t: "steps", items: [
          "<strong>The harness builds the prompt</strong> — the manager's question, plus the schema (Zentara's table definitions), plus two example question→SQL pairs.",
          "<strong>The model writes the query</strong> — <code>SELECT customer_name, COUNT(*) AS shipments FROM orders WHERE ship_month = 'June' GROUP BY customer_name ORDER BY shipments DESC LIMIT 3</code>. In English: count the orders for each customer in June, sort biggest first, keep the top three.",
          "<strong>The harness runs it</strong> on a read-only connection. The database returns three rows: <code>Acme Foods · 1,204</code>, <code>Brightline Retail · 987</code>, <code>Corex Labs · 653</code>.",
          "<strong>The model reads those rows and answers</strong>: \"Your top three customers in June were Acme Foods (1,204 shipments), Brightline Retail (987), and Corex Labs (653).\""
        ]},
        { t: "p", html: "Notice who did what. The model wrote text twice — once as SQL, once as the friendly answer. The harness did all the actual running. And the number 1,204 came from the <em>database</em>, not from the model's memory — that's why it's exact instead of a plausible guess." }
      ]
    },
    {
      id: "hard-parts",
      label: "The three hard parts",
      blocks: [
        { t: "p", html: "That end-to-end run looked smooth. Writing the first query is easy — making it <em>reliable</em> comes down to three things:" },
        { t: "list", ordered: true, items: [
          "<strong>Schema grounding</strong> — the model can't query tables it doesn't know about. You paste your table definitions (the <code>CREATE TABLE</code> lines) into the prompt so it knows exactly what exists.",
          "<strong>Validation</strong> — generated SQL sometimes won't run (wrong column name, a typo). You actually run it and catch the error before trusting the result.",
          "<strong>Safety</strong> — never let generated SQL change your data. Use a <strong>read-only</strong> connection, block anything that isn't a <code>SELECT</code>, and add a <code>LIMIT</code> so one query can't pull a million rows."
        ]},
        { t: "p", html: "\"Schema\" has come up a few times now — here's what one actually looks like, so it stops being abstract. This is Zentara's orders table:" },
        { t: "code", label: "schema.sql — one table definition (read, don't type — you never have to write these yourself)", code: "CREATE TABLE orders (\n  id             INTEGER,   -- one row per shipment\n  customer_name  TEXT,      -- who sent it\n  ship_month     TEXT,      -- e.g. 'June'\n  weight_kg      REAL       -- package weight\n);" },
        { t: "p", html: "That's the whole trick: a table's name, its column names, and what type each column holds. Paste a few of these into the prompt and the model knows precisely what it's allowed to query — no more guessing whether the table is called <code>orders</code> or <code>shipments</code>." },
        { t: "callout", kind: "warn", title: "Treat generated SQL as untrusted", html: "A read-only connection, a row limit, and a SELECT-only rule are not optional — they're how you stop an LLM from accidentally wiping a table. Never run generated SQL with write access." },
        { t: "callout", kind: "warn", title: "LIMIT has a quiet failure mode", html: "A row limit protects you, but it's blunt: if a legitimate answer needed 500 rows and your cap is 100, the result gets <em>silently truncated</em> — the query \"works,\" the answer looks fine, and nobody notices it's incomplete. A good build flags it whenever the row count comes back exactly at the limit, so you know to look closer." }
      ]
    },
    {
      id: "repair",
      label: "The repair loop",
      blocks: [
        { t: "p", html: "What happens when the SQL doesn't run? You don't give up — you tell the model what broke. Send the database's error message back and ask it to fix the query. One retry catches most mistakes." },
        { t: "p", html: "Concretely: you ask <em>\"how many users signed up?\"</em> and the model writes <code>SELECT COUNT(*) FROM user</code>. The database throws <code>no such table: user</code> — the table is actually called <code>users</code>. You send that exact error back with the query, and the model returns <code>SELECT COUNT(*) FROM users</code>. It runs. Fixed." },
        { t: "p", html: "If this rhythm feels familiar, it should — it's Phase 4's agent loop again: the model asks, the harness runs, the result comes back as a new message. The only twist is that here the \"result\" is sometimes an error message — and that error is exactly the feedback the model needs to repair its own query. This \"try → if it fails, feed the error back → try again\" pattern is a <strong>repair loop</strong>, and you'll see it all over agent code. Cap it (one or two retries) so a truly broken query can't loop forever." },
        { t: "p", html: "And when the cap runs out? <strong>Stop, and show the error honestly</strong>: \"I couldn't answer this — the query failed with: <code>no such column: signup_date</code>.\" That feels like failure, but it's the right move. The one thing a data tool must never do is invent a plausible-looking number after the database refused to give a real one." },
        { t: "callout", kind: "key", title: "Fail honest, not confident", html: "A capped repair loop has exactly two exits: a query that ran, or an error shown to the user as-is. There is no third exit where the model \"just answers anyway\" — that would turn your exact tool back into a guessing machine." }
      ]
    },
    {
      id: "build",
      label: "Build it",
      blocks: [
        { t: "p", html: "Build <code>text_to_sql.py</code> against a small sample database, then wrap it as a tool and plug it into the <code>agent.py</code> from Phase 4 — now your agent can answer from documents <em>and</em> from data." },
        { t: "assist",
          intro: "Grab a small SQLite database — Chinook is a good free one (a practice database about a music store: bands, albums, customers, invoices), and SQLite itself is a tiny database that lives in a single file on your laptop, no setup needed. Then paste this:",
          prompt: "Build text_to_sql.py: turn a plain-English question into SQL and run it on my SQLite database.\n\n- Put the schema (the CREATE TABLE statements) and 2-3 example question→SQL pairs in the prompt.\n- Make it read-only: reject anything that isn't a SELECT, and add a LIMIT (and warn me when a result comes back exactly at the limit — it may be truncated).\n- Run the SQL; if it errors, send the error back to the model and let it fix the query once. If the fixed query also fails, stop and return the error message honestly — never answer from the model's memory.\n- Then wrap it as a tool and add it to my agent.py from Phase 4.\n\nShow me how to point it at a sample database (Chinook) and ask a few questions.",
          asks: [
            "Why do I have to put the database schema in the prompt?",
            "How do I stop the model from writing a query that deletes data?",
            "What is a repair loop, and why cap it?",
            "What happens if the repaired query fails too?"
          ]
        },
        { t: "p", html: "Read what it builds — the prompt carries the schema, and a small loop handles errors safely, with an honest exit when the one allowed repair also fails:" },
        { t: "code", label: "text_to_sql.py — what good output looks like (read, don't type)", code: "# text_to_sql.py — question in, answer from your database out\nimport sqlite3\nfrom anthropic import Anthropic\nclient = Anthropic()\n\nSCHEMA = open(\"schema.sql\").read()   # your CREATE TABLE statements\n\ndef to_sql(question):\n    prompt = f\"{SCHEMA}\\n\\nWrite ONE read-only SQL query (SELECT only) for:\\n{question}\"\n    return client.messages.create(\n        model=\"claude-sonnet-4-6\", max_tokens=400,\n        messages=[{\"role\": \"user\", \"content\": prompt}]).content[0].text.strip()\n\ndef ask(question, db=\"chinook.db\"):\n    sql = to_sql(question)\n    if not sql.lower().startswith(\"select\"):\n        return \"Refused: only read-only queries are allowed.\"\n    con = sqlite3.connect(f\"file:{db}?mode=ro\", uri=True)   # read-only connection\n    try:\n        return con.execute(sql + \" LIMIT 100\").fetchall()\n    except sqlite3.Error as e:\n        fixed = to_sql(f\"{question}\\n\\nThat query failed with: {e}. Fix it.\")  # repair, once\n        try:\n            return con.execute(fixed + \" LIMIT 100\").fetchall()\n        except sqlite3.Error as e2:                          # cap reached — fail honest\n            return f\"Query failed after one repair attempt: {e2}\"  # never invent data\n" },
        { t: "callout", kind: "key", title: "Deliverable — text_to_sql.py", html: "A schema-aware tool that writes SQL, runs it safely (read-only, limited), repairs itself once on error — and reports the error honestly if the repair fails too. Wired into your agent, it answers questions straight from your data." }
      ]
    },
    {
      id: "recap",
      label: "What you should know",
      blocks: [
        { t: "recap", items: [
          "<strong>Text-to-SQL</strong>: the model writes a database query from a plain-English question; you run it and return the rows.",
          "Use it for <em>counts and structured data</em> (rows and tables) — RAG is for prose.",
          "The prompt carries three things: the <strong>question</strong>, the <strong>schema</strong> (the database's table of contents), and a few <strong>example question→SQL pairs</strong>.",
          "Three hard parts: <strong>schema grounding</strong> (tell it your tables), <strong>validation</strong> (does it run?), and <strong>safety</strong> (read-only, limited).",
          "A <strong>repair loop</strong> feeds the database error back and asks for a fix — the same ask→run→result pattern as Phase 4's harness loop.",
          "When the retry cap is exhausted, <strong>show the error honestly</strong> — never invent data. And watch <code>LIMIT</code>: a result exactly at the limit may be silently truncated.",
          "Treat generated SQL as <strong>untrusted</strong>: read-only connection, row limit, SELECT only.",
          "You built <code>text_to_sql.py</code> and added it as a tool to your Phase 4 agent."
        ]},
        { t: "quiz", items: [
          { q: "Your question is \"how many orders shipped last week?\" Which fits best?", options: ["RAG over documents", "Text-to-SQL over the database", "A bigger model"], answer: 1, explain: "Counts over rows are a database job — text-to-SQL — not a prose-search (RAG) job." },
          { q: "Why must you put the database schema in the prompt?", options: ["To make the prompt longer", "So the model knows which tables and columns exist", "To slow it down"], answer: 1, explain: "Without the schema, the model guesses table and column names and writes queries that don't run." },
          { q: "In the text-to-SQL flow, who actually runs the query against the database?", options: ["The LLM, directly", "The harness — your code", "The database runs it on its own"], answer: 1, explain: "Same as Phase 4: the model only writes text (the SQL). The harness runs it and hands the rows back." },
          { q: "The repair loop is capped at one retry, and the fixed query fails too. What should the tool do?", options: ["Let the model answer from memory instead", "Stop and show the database error honestly", "Keep retrying until something runs"], answer: 1, explain: "A capped loop has two honest exits: a query that ran, or the error shown as-is. Inventing a number would turn your exact tool back into a guesser." },
          { q: "Your query has LIMIT 100 and the result comes back with exactly 100 rows. Why look twice?", options: ["100 rows always means an error", "The real answer may have had more rows — the LIMIT silently cut it off", "SQLite can't count past 100"], answer: 1, explain: "A result sitting exactly at the limit is the tell-tale sign of silent truncation — the query \"worked,\" but the answer may be incomplete." },
          { q: "Feeding an error back to the model and asking it to fix the query is called a ___ loop. (one word)", answer: "repair", explain: "A repair loop retries on failure — capped so a broken query can't spin forever." }
        ]}
      ]
    }
];
