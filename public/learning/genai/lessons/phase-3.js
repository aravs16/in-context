// Phase 3 lesson content. Block types are rendered by LessonBlock in app.jsx.
window.PHASE_LESSONS = window.PHASE_LESSONS || {};
window.PHASE_LESSONS[3] = [
    {
      id: "intuition",
      label: "Intuition",
      blocks: [
        { t: "p", html: "You just built <code>rag.py</code> in Phase 2. How do you know it's any good? Probably the same way everyone starts: you ran a few questions, read the answers, and thought \"yeah, looks fine.\" That feeling is exactly what this phase fixes." },
        { t: "p", html: "Reading a handful of outputs hides two things. You only ever see the cases you happened to try — and when you tweak a prompt or swap a model, you have no way to tell whether you just made it better or quietly broke it." },
        { t: "p", html: "The fix borrows a name from ordinary software: a <strong>test suite</strong>. Don't let the term put you off — a <strong>test case</strong> is just a question you already know the right answer to, written down together with that answer. A <strong>test suite</strong> is a saved list of those, kept in a plain file, that you can run over and over. No code needed to understand it: it's a quiz you wrote for your own app, with the answer key attached." },
        { t: "compare",
          question: "You change one line of your prompt. Did it help?",
          left: {
            tag: "By eye",
            answer: "You skim 3 answers — \"looks good, ship it.\"",
            verdict: "Blind",
            note: "You only checked the cases you thought of, and you can't compare this run to the last one."
          },
          right: {
            tag: "With a test suite",
            answer: "You re-run the same 50 saved questions — \"pass rate fell from 92% to 61%; the change broke the ambiguous ones.\"",
            verdict: "Measured",
            note: "Same cases every time, so you can actually tell better from worse — with a number."
          }
        },
        { t: "callout", kind: "key", title: "The whole shift", html: "Stop asking <em>\"does this output look good?\"</em> and start asking <em>\"what percent of my test cases pass?\"</em> That number is something you can track, compare across changes, and push up over time." }
      ]
    },
    {
      id: "what-is-eval",
      label: "What an eval is",
      blocks: [
        { t: "p", html: "An <strong>eval</strong> is that test suite idea, applied to your LLM app: a list of cases, each with a <strong>question</strong> and a <strong>check</strong> for whether the answer is acceptable. You run the whole list and get a score." },
        { t: "p", html: "Make it concrete. For your Phase 2 RAG bot, one test case might be: the question <em>\"what's our refund window?\"</em> with the check <em>\"the answer must contain '30 days'.\"</em> Write 30–50 of these — easy ones and tricky ones — run them all, and you get a single number: <strong>this version passed 44 of 50</strong>. Tweak a prompt, re-run, and you can see at a glance whether that number went up or down." },
        { t: "p", html: "There's one thing we glossed over: what does the check actually compare the answer <em>to</em>? And what really runs when you hit \"go\" on 50 test cases? That's next." },
        { t: "callout", kind: "tip", title: "Offline vs online", html: "You're building <strong>offline</strong> eval — a fixed set of cases you run yourself, like a test suite. Later, <strong>online</strong> eval watches real users in <strong>production</strong> — the software word for when your app is live and real people, not just you, are using it. Start offline; it catches most breakage before it ever reaches a user." }
      ]
    },
    {
      id: "golden-dataset",
      label: "The golden dataset",
      blocks: [
        { t: "p", html: "Every test case needs two things: a <strong>question</strong>, and what the <strong>right answer actually looks like</strong> — written by a human, once, ahead of time. That whole collection of question-and-right-answer pairs has a name: your <strong>golden dataset</strong>. \"Golden\" just means: this is the ground truth everything else gets checked against. (If the word rings a bell — Phase 2's pitfalls section talked about checking whether the <em>gold chunk</em> made it into retrieval — it's the same use of the word: gold = the known-correct reference.)" },
        { t: "p", html: "A few rows from Zentara's golden dataset might look like this:" },
        { t: "code", label: "golden_dataset.csv (a few rows)", code: "question                                reference answer\n--------------------------------------  ------------------\nwhat's our refund window?                30 days\ndo you ship internationally?             No, US only\nwhat's the parental leave policy?        18 weeks paid\nwho won the 2049 World Cup?              (trap — not in the docs;\n                                          should say it doesn't know)" },
        { t: "p", html: "You write the <strong>reference answer</strong> yourself, from what you already know is true — you never ask the model to grade its own homework. This is also, honestly, the tedious part: writing 30–50 of these well is most of the real work in eval." },
        { t: "h", text: "What makes a golden dataset good" },
        { t: "list", items: [
          "<strong>Easy factual rows</strong> — one clear question, one clear answer (<em>\"what's our refund window?\"</em> → <em>\"30 days\"</em>). If these ever fail, something is badly broken.",
          "<strong>Tricky rows</strong> — ambiguous phrasing, or an answer buried deep in one document. These are the rows that actually move when you change chunking or prompts.",
          "<strong>Trap rows</strong> — questions your documents don't answer at all (<em>\"who won the 2049 World Cup?\"</em>). The right behaviour is <em>\"I don't know\"</em>; a confident made-up answer must count as a fail.",
          "<strong>Real phrasing</strong> — write questions the way an employee would actually type them (<em>\"how long do I get off for a new baby?\"</em>), not the tidy way the documents phrase them."
        ]},
        { t: "callout", kind: "tip", title: "Steal from reality", html: "The best rows aren't invented at a desk. Every time someone asks your bot a question and gets a bad answer, that question — with the answer it <em>should</em> have given — becomes a new row. Your golden dataset grows out of real failures." },
        { t: "p", html: "So you have a file of questions and reference answers. What actually happens when you press \"go\"? Let's run one row all the way through." }
      ]
    },
    {
      id: "run-the-eval",
      label: "Running the eval",
      blocks: [
        { t: "p", html: "An eval run is the same short trip, repeated for <em>every row</em> of the golden dataset. Here's one full trip, on the course's running example — Zentara's leave-policy question:" },
        { t: "steps", items: [
          "<strong>Grab one row.</strong> Question: <em>\"what's the parental leave policy?\"</em> Reference answer: <em>\"18 weeks paid.\"</em> Check: the answer must contain <em>\"18 weeks.\"</em>",
          "<strong>Run the question through your real system.</strong> The eval calls the exact <code>rag.py</code> you built in Phase 2 — no special test mode — and collects the <strong>actual answer</strong>: <em>\"Zentara offers 18 weeks of fully paid parental leave, plus a phased return to work.\"</em>",
          "<strong>Apply the check.</strong> Does the actual answer contain <em>\"18 weeks\"</em>? It does — the extra wording around it doesn't matter.",
          "<strong>Record the verdict.</strong> ✓ pass. One tally on the scoreboard; on to the next row."
        ]},
        { t: "p", html: "Now a row that <em>fails</em> — and why the fail is the whole point. Question: <em>\"do you ship internationally?\"</em> Reference answer: <em>\"No, US only.\"</em> Your system answers: <em>\"Yes — Zentara ships to over 40 countries worldwide.\"</em> The check looks for <em>\"US only\"</em>, doesn't find it → ✗ fail. That answer is a confident hallucination — Phase 2's worst pitfall — and you would almost certainly have missed it by skimming three outputs. The scoreboard just caught it for you." },
        { t: "p", html: "Every row takes the same trip. As one picture:" },
        { t: "diagram", mermaid: "flowchart LR\n  subgraph row[\"one row of the golden dataset\"]\n    Q[\"question\"]\n    E[\"reference answer\"]\n  end\n  Q --> SYS[\"your system<br/>rag.py\"]\n  SYS --> ACT[\"actual answer\"]\n  ACT --> CHK{\"check:<br/>close enough?\"}\n  E --> CHK\n  CHK -->|\"yes\"| PASS[\"✓ pass\"]\n  CHK -->|\"no\"| FAIL[\"✗ fail\"]\n  PASS --> T[\"tally across every row<br/>→ pass rate\"]\n  FAIL --> T" },
        { t: "p", html: "That's one row at a time. Here's a whole run — Zentara test questions flowing through your RAG system, each actual answer compared against its golden answer, the scoreboard filling as verdicts land:" },
        { t: "evalflow" },
        { t: "p", html: "Final score: 3 of 4 — a 75% pass rate. And notice which part of the screen matters most: the ✗. A passing row only confirms what you hoped; the failing row <em>names</em> the exact question, the exact wrong answer, and the reference it missed. That's your to-do list, for free, on every run." },
        { t: "callout", kind: "key", title: "The whole mechanism, in one line", html: "For every row in your golden dataset: run the question through your real system, compare the actual answer to the golden reference answer, tally pass or fail. The score you get out is your eval." },
        { t: "p", html: "The one blank left: how does the check decide \"close enough,\" when two correct answers can be worded completely differently? That's not one-size-fits-all — there are a few kinds of checks, from strict to fuzzy." }
      ]
    },
    {
      id: "checks",
      label: "Kinds of checks",
      blocks: [
        { t: "p", html: "So how does that comparison actually decide match-or-no-match? Three kinds of checks, from strict to fuzzy — each shown on one Zentara test case:" },
        { t: "list", ordered: true, items: [
          "<strong>Exact match</strong> — the answer must equal one specific value, character for character. Example: <em>\"how many days is the refund window?\"</em> → the answer must be exactly <em>\"30\"</em>. Good for a yes/no or a single number.",
          "<strong>Contains</strong> — the answer must include a key word or phrase; anything around it is fine. Example: <em>\"what's the parental leave policy?\"</em> → the answer must contain <em>\"18 weeks\"</em>, however it's worded.",
          "<strong>LLM-as-judge</strong> — a <em>second, separate</em> model (never the one being tested — no one grades their own homework) reads the answer and grades it against a rubric. Example: <em>\"summarize our onboarding policy\"</em> → the judge is asked <em>\"is this accurate and grounded in the retrieved docs, with no invented facts — yes or no?\"</em> For open-ended answers where there's no single right string."
        ]},
        { t: "p", html: "See how the choice matters on one question — <em>\"is our office open on Saturdays?\"</em> An <strong>exact-match</strong> check that demands the answer be literally <em>\"No.\"</em> is too strict: the model might say <em>\"No, we're closed on weekends,\"</em> which is correct but fails. A <strong>contains</strong> check for the word <em>\"closed\"</em> is more forgiving and still catches wrong answers. And for something open-ended like <em>\"summarize our weekend hours,\"</em> there's no single right wording, so only an <strong>LLM-as-judge</strong> will do." },
        { t: "callout", kind: "tip", title: "Rule of thumb", html: "Use the <strong>strictest</strong> check you can get away with. Exact match where a single answer exists, contains where a key fact must appear, and save the LLM judge for genuinely open-ended answers — it's the most powerful and the most expensive." },
        { t: "callout", kind: "warn", title: "LLM-as-judge is handy, not free or perfect", html: "Every judged test costs an extra model call, and the judge can be wrong or biased — it tends to favour longer, more confident-sounding answers. Use it only for the fuzzy cases; use exact or contains wherever a real check exists." }
      ]
    },
    {
      id: "build",
      label: "Build the eval",
      blocks: [
        { t: "p", html: "Time to wrap a real test suite around the <code>rag.py</code> you built in Phase 2. You'll use <strong>Promptfoo</strong>, the popular open-source eval tool: you describe your test cases and a few model setups in one file, and it runs them all into a side-by-side table. As always — your assistant builds it, you run it." },
        { t: "assist",
          intro: "Open your Phase 2 project and paste this into your assistant:",
          prompt: "Set up Promptfoo to evaluate the RAG pipeline in my rag.py.\n\n- Write 12 test cases: a mix of easy factual questions (clear answer) and hard ones (ambiguous, or not answerable from my docs).\n- Use 'contains' checks for the factual ones, and an 'llm-rubric' (LLM-as-judge) check for the open-ended ones.\n- Compare 3 setups: Sonnet with my current chunking, Haiku with my current chunking, and Sonnet with bigger chunks.\n- Show me how to install promptfoo, run the eval, and open the results table.\n\nThen explain how to read the table and pick a winner.",
          asks: [
            "Why isn't reading a few outputs enough to know it works?",
            "What's the difference between a 'contains' check and an 'llm-rubric' check?",
            "How many test cases do I actually need, and how do I write good ones?"
          ]
        },
        { t: "p", html: "Read what it generates. The config is one file: a list of <strong>setups</strong> to compare, and a list of <strong>test cases</strong>, each with a check. The same test cases run through every setup, so you get a fair side-by-side:" },
        { t: "diagram", mermaid: "flowchart LR\n  T[Test cases<br/>question + check] --> P[run the eval]\n  M1[Sonnet + small chunks] --> P\n  M2[Sonnet + big chunks] --> P\n  M3[Haiku + small chunks] --> P\n  P --> R[Comparison table<br/>pass-rate · speed · cost]\n  R --> W[Pick a winner]" },
        { t: "p", html: "One thing before you look at the file: it's written in <strong>YAML</strong>. This isn't code — it's a settings file, like a structured shopping list: labeled sections, indented items, nothing that executes. You can read it top to bottom like a form your assistant filled in." },
        { t: "code", label: "promptfooconfig.yaml — what good output looks like (read, don't type)", code: "# run the same test cases across several setups\nproviders:   # a \"provider\" = one setup being tested (a model + your pipeline)\n  - file://rag_provider.py   # a \"wrapper\" — a small connector script your\n                             # assistant writes so promptfoo can call\n                             # your rag.py's answer()\n\ntests:\n  - vars: { question: \"What is our refund window?\" }\n    assert:\n      - type: contains\n        value: \"30 days\"\n\n  - vars: { question: \"Summarize our onboarding policy.\" }\n    assert:\n      - type: llm-rubric\n        value: \"Accurate and grounded in the retrieved docs; no invented facts.\"\n\n  - vars: { question: \"Who won the 2049 World Cup?\" }   # the trap row\n    assert:\n      - type: llm-rubric\n        value: \"Says it doesn't know, or that it's not in the documents.\"" },
        { t: "callout", kind: "key", title: "Deliverable — promptfooconfig.yaml", html: "A results table that shows which model + chunking + prompt combo wins on <em>your</em> questions. Re-run it every time you change anything — it's your safety net for the rest of the course." }
      ]
    },
    {
      id: "recap",
      label: "What you should know",
      blocks: [
        { t: "recap", items: [
          "\"Looks good\" is a feeling, not a measurement. An <strong>eval</strong> runs a fixed set of <strong>test cases</strong> — questions you already know the right answers to — and scores every change.",
          "The <strong>golden dataset</strong> is your ground truth: question + human-written <strong>reference answer</strong> pairs — easy rows, tricky rows, and trap rows the docs can't answer.",
          "An eval run, per row: question → your <strong>real system</strong> → <strong>actual answer</strong> → a <strong>check</strong> compares it to the reference answer → ✓/✗ → tally into a pass rate.",
          "There are three kinds of checks: <strong>exact match</strong>, <strong>contains</strong>, and <strong>LLM-as-judge</strong> (a second model, for open-ended answers). Use the strictest one that fits.",
          "<strong>LLM-as-judge</strong> costs an extra call and can be biased — prefer exact or contains when you can.",
          "You're doing <strong>offline</strong> eval (a test suite you run); <strong>online</strong> eval (real users, in production) comes later.",
          "Pick a winner on <strong>pass-rate, cost, and speed</strong> together — and keep the suite as your regression net: Phase 4 adds tools to your bot, and this eval is how you'll know the changes didn't break the answers."
        ]},
        { t: "quiz", items: [
          { q: "Why isn't reading a few outputs and saying \"looks good\" enough?", options: ["LLMs are always wrong", "You only see the cases you tried, and you can't tell if a change helped or broke things", "Reading is slower than running code"], answer: 1, explain: "Eyeballing misses the cases you didn't think of, and gives you no number to compare one run against the next." },
          { q: "In the golden dataset, who writes the reference answers?", options: ["The model being tested, so it knows what to aim for", "You — a human — from facts you already know are true", "Promptfoo generates them automatically"], answer: 1, explain: "The reference answer is the ground truth, written by a human ahead of time. The model never grades its own homework." },
          { q: "During an eval run, what does the check actually compare?", options: ["Your question against the documents", "The actual answer from your real system against that row's reference answer", "Two different models' answers to each other"], answer: 1, explain: "Each row's question runs through your real system; the check compares the actual answer it produced to the golden reference answer, then records pass or fail." },
          { q: "Which check fits an open-ended answer that has no single correct wording?", options: ["Exact match", "Contains", "LLM-as-judge"], answer: 2, explain: "A rubric-based LLM judge grades fuzzy answers; exact and contains both need a known string to look for." },
          { q: "A test question has exactly one correct answer: the number 30. Which check do you reach for first?", options: ["LLM-as-judge — it's the most powerful", "Exact match — the strictest check that fits", "None — numbers can't be checked"], answer: 1, explain: "Rule of thumb: use the strictest check you can get away with. A single known value is exactly what exact match is for — save the judge for open-ended answers." },
          { q: "Running tests against a fixed dataset you control (not live users) is called ___ eval. (one word)", answer: "offline", explain: "Offline eval is your test suite; online eval measures real production traffic." }
        ]}
      ]
    }
];
