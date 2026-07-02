// Phase 10 lesson content. Block types are rendered by LessonBlock in app.jsx.
window.PHASE_LESSONS = window.PHASE_LESSONS || {};
window.PHASE_LESSONS[10] = [
    {
      id: "intuition",
      label: "Intuition",
      blocks: [
        { t: "p", html: "Back in Phase 3 you tested single LLM calls — one question, one answer, is it right? That worked because there was only one thing to check: the answer. But your agent now does much more than answer. It <em>decides</em>. It picks a tool, reads the result, maybe picks another tool, and only then writes its reply. Checking the final text alone misses everything that happened along the way." },
        { t: "p", html: "That \"everything along the way\" has a name. The full record of what the agent did — every tool it called, every result it got back, every decision it made before answering — is called the <strong>trajectory</strong>. It's the word we'll use for the rest of this phase, so let's lock it in now: <em>trajectory = the complete route the agent took from question to answer</em>." },
        { t: "p", html: "Here's the cleanest way to feel the difference. Phase 3's eval was like checking that a driver arrived at the right address — you only looked at the destination. <strong>Agent eval is a driving test.</strong> The examiner sits in the car and watches the whole trip: did you check your mirrors, signal before turning, stop at the red light? You can reach the right address while driving terribly — and an agent can produce a right-looking answer while behaving terribly. Phase 3 graded the <em>answer</em>; this phase grades the <em>journey</em>." },
        { t: "compare",
          question: "\"How many orders shipped last week?\" — the agent answers \"412.\"",
          left: {
            tag: "Prompt eval (Phase 3)",
            answer: "Final text contains a number → pass.",
            verdict: "Misses it",
            note: "The answer looks fine — but the agent guessed instead of querying the database. The destination was right; the driving was reckless."
          },
          right: {
            tag: "Agent eval",
            answer: "Checks the trajectory: it should have called the SQL tool. It didn't → fail.",
            verdict: "Catches it",
            note: "Right-looking answer, wrong process — only a trajectory check finds this."
          }
        },
        { t: "callout", kind: "key", title: "What agent eval is", html: "Prompt eval (Phase 3) checks a single answer; <strong>agent eval</strong> checks the whole <strong>trajectory</strong> — did the agent call the right tools, in a sensible order, with sane arguments, at acceptable cost? You're testing <em>behavior</em>, which is harder — and worth far more." }
      ]
    },
    {
      id: "test-cases",
      label: "What a test case looks like",
      blocks: [
        { t: "p", html: "So if we're grading the journey and not just the destination, a test case has to describe the journey we expect. An agent test case is richer than a Phase 3 prompt test. It has a <strong>task</strong> (the question or job), an <strong>expected trajectory</strong> (which tools should be called, roughly with what arguments), and a check on the <strong>final answer</strong>. And instead of one pass/fail, you score several dimensions at once:" },
        { t: "list", items: [
          "<strong>Trajectory correctness</strong> — did it call the right tools, in a sensible order, with <em>sane arguments</em>? Sane compared to what the task actually needs: for \"where is order 4412?\", <code>order_lookup(\"4412\")</code> is sane; <code>order_lookup(\"all orders ever\")</code> is not — the agent is flailing, asking a precise tool a vague question.",
          "<strong>Hallucination rate</strong> — did it invent facts the tools never returned? If the database said 287 and the answer says 300, that's a hallucination even though a tool <em>was</em> called.",
          "<strong>Refusal rate</strong> — refusing can go wrong in <em>two opposite directions</em>, and this metric watches both. Direction one: refusing something legitimate — a customer asks \"how many orders shipped last week?\" and the agent says \"I can't help with that.\" Direction two: <em>failing</em> to refuse something it should have — someone asks a read-only support agent to \"delete all cancelled orders,\" and it cheerfully tries. Both count as refusal failures.",
          "<strong>Cost and latency</strong> — dollars and seconds per task. A correct answer that takes 90 seconds and costs $2 still fails the test of real life."
        ]},
        { t: "diagram", mermaid: "flowchart LR\n  T[Test cases<br/>task + expected trajectory] --> E[Agent eval runner]\n  E --> TR[Trajectory check<br/>right tools · sane args]\n  E --> HC[Hallucination + refusal<br/>checks]\n  E --> CC[Cost · latency]\n  TR & HC & CC --> D[Pass/fail dashboard]" },
        { t: "callout", kind: "key", title: "Task + expected trajectory + answer check", html: "One agent test case = the <strong>task</strong>, the <strong>trajectory</strong> you expect (tools, order, sane arguments), and a check on the <strong>final answer</strong> — scored alongside hallucination, refusal, cost, and latency." }
      ]
    },
    {
      id: "walkthrough",
      label: "One test case, end to end",
      blocks: [
        { t: "p", html: "Definitions are abstract, so let's walk one real test case all the way through, using Zentara Logistics — the made-up shipping company we've followed since Phase 2. Zentara's support agent has two tools: the <strong>text-to-SQL tool</strong> from Phase 5 (it turns a plain-English question into a database query) and a web search tool. Here's the test case:" },
        { t: "steps", items: [
          "<strong>Task:</strong> \"How many orders shipped from the Rotterdam warehouse last week?\"",
          "<strong>Expected trajectory:</strong> call <code>text_to_sql</code> once, with a question that mentions Rotterdam and last week. Web search is <em>forbidden</em> — this is internal data; the public internet can't know it.",
          "<strong>Answer check:</strong> the final answer must contain the number the database actually returned — not a rounder, nicer-sounding one.",
          "<strong>Budget:</strong> under $0.05 and under 10 seconds."
        ]},
        { t: "p", html: "Now the eval runner gives the agent that task and records everything it does. On a good run, the recorded trajectory looks like this:" },
        { t: "code", label: "a recorded trajectory — what the eval runner sees (read, don't type)", code: "TASK      \"How many orders shipped from the Rotterdam warehouse last week?\"\nTOOL CALL text_to_sql(\"orders shipped from Rotterdam, June 22-28\")   <- right tool, sane args\nRESULT    287\nANSWER    \"287 orders shipped from the Rotterdam warehouse last week.\"\nCOST      $0.021        TIME 4.2s\n\nCHECKS    right tool? yes   forbidden tool avoided? yes\n          answer matches tool result (287 = 287)? yes\n          under budget? yes                              -> PASS" },
        { t: "p", html: "And here's a failing run — the kind that slips right past a Phase 3 style answer-only check:" },
        { t: "code", label: "the same test, a bad run (read, don't type)", code: "TASK      \"How many orders shipped from the Rotterdam warehouse last week?\"\nTOOL CALL (none)\nANSWER    \"Around 300 orders shipped from Rotterdam last week.\"\nCOST      $0.008        TIME 1.9s\n\nCHECKS    right tool? NO - it never touched the database\n          answer matches tool result? nothing to match against\n                                                          -> FAIL" },
        { t: "p", html: "Notice: the bad run is <em>cheaper and faster</em>, and \"around 300\" sounds perfectly plausible. Only the trajectory check — <em>it never called the SQL tool</em> — reveals that the agent made the number up. That's the entire case for grading the journey." },
        { t: "callout", kind: "warn", title: "Plausible is the enemy", html: "Agents rarely fail loudly. They fail by producing confident, plausible answers via a broken trajectory. If you only read the answers, you will believe your agent works long after it has stopped working." }
      ]
    },
    {
      id: "ci",
      label: "Put it in CI",
      blocks: [
        { t: "p", html: "A suite you run by hand is a suite you'll forget to run. The fix is <strong>CI</strong> — \"continuous integration,\" which sounds grand but is just this: <em>a robot that re-runs all your checks automatically, every single time the code changes</em>. You (well, your coding assistant) change a prompt, swap a model, tweak a tool — the robot notices, runs every test case in your suite, and reports the score." },
        { t: "p", html: "When people say \"the build <strong>fails</strong>,\" here's what that means in practice — and what it doesn't. It does <em>not</em> mean your running app breaks or users see errors. It means the robot <strong>blocks the new change from going in</strong> until the failing checks are fixed. The version people are already using keeps running untouched. GitHub Actions — a free CI robot built into GitHub, the site where your code lives — is the common choice. Wire your agent evals into it so the change is blocked if the pass-rate drops below a threshold, say 90%. Now a prompt tweak, a model swap, or a tool change can't quietly break behavior." },
        { t: "diagram", mermaid: "flowchart LR\n  C[\"You change something<br/>(prompt · model · tool)\"] --> R[\"CI robot wakes up,<br/>runs all agent evals\"]\n  R -->|\"pass-rate ≥ 90%\"| IN[\"change goes in ✓\"]\n  R -->|\"pass-rate < 90%\"| BLK[\"change blocked —<br/>fix it first\"]" },
        { t: "callout", kind: "tip", title: "The dataset matters more than the tool", html: "Promptfoo, LangSmith, Phoenix, and Braintrust all run agent evals. But the hardest, most valuable part is the same as Phase 3: writing the cases. A solid 30-case <strong>golden dataset</strong> — your hand-checked set of tasks with known-good trajectories — beats any fancy framework with three lazy tests." }
      ]
    },
    {
      id: "build",
      label: "Build the suite",
      blocks: [
        { t: "p", html: "Time to build it for real: a behavior test suite for your agent, gated in CI — your <strong>regression net</strong> (regression — when something that used to work quietly breaks) for everything that comes after. One metric in the list below deserves a quick gloss before you paste: <strong>p95 latency</strong>, which you met in Phase 6, is the waiting time your slowest runs experience — 95% of runs finish faster than this number, 5% slower. Averages hide your worst moments; p95 shows them." },
        { t: "assist",
          intro: "In your agent project, paste this:",
          prompt: "Build an agent eval suite (agent_evals/) for my agent.\n\n- Write 12 agent test cases: each a task + the tools it should call + a check on the final answer.\n- Add behavioral checks: 'must call the SQL tool', 'must not invent a price', 'must refuse if asked out of scope'.\n- Track these dimensions across the suite: trajectory correctness, hallucination rate, refusal rate (both over-refusing and under-refusing), $/task, p95 latency.\n- Wire it into GitHub Actions so the build fails if pass-rate drops below 90%.\n\nShow me how to run it locally and read the results.",
          asks: [
            "How is agent eval different from the prompt eval I did in Phase 3?",
            "What is a trajectory, and how do I check it?",
            "How many test cases do I really need?"
          ]
        },
        { t: "p", html: "Read what it builds — each case describes the <em>behavior</em> you expect, not just the words. This is the Rotterdam walkthrough from earlier, written down as a real test case:" },
        { t: "code", label: "an agent test case — what good output looks like (read, don't type)", code: "# one agent test case — checks the whole trajectory, not just the final text\n{\n  \"task\": \"How many orders shipped last week?\",\n  \"expect_tools\": [\"text_to_sql\"],     # must use the SQL tool from Phase 5\n  \"forbid_tools\": [\"web_search\"],      # must NOT go to the web for internal data\n  \"answer_assert\": \"contains the number the tool returned\",\n  \"must_not\": \"invent a number the database never returned\",\n}\n\n# scored across the whole suite:\n#   trajectory correctness · hallucination rate · refusal rate\n#   $/task · p95 latency (the time your slowest 5% of runs take — Phase 6)" },
        { t: "callout", kind: "key", title: "Deliverable — agent_evals/", html: "A regression suite that runs in CI and catches behavior drift across prompt, model, and tool changes. From here on, you can change things without crossing your fingers." }
      ]
    },
    {
      id: "recap",
      label: "What you should know",
      blocks: [
        { t: "recap", items: [
          "Prompt eval (Phase 3) grades the <strong>answer</strong>; <strong>agent eval</strong> grades the <strong>journey</strong> — the driving test, not just the destination.",
          "The <strong>trajectory</strong> is the full record of what the agent did: every tool call, every result, every decision.",
          "An agent test case = a <strong>task</strong> + an <strong>expected trajectory</strong> + a final-answer check.",
          "Score several dimensions: trajectory correctness (right tools, sane arguments), hallucination rate, refusal rate (both directions), cost, and latency.",
          "<strong>CI</strong> is a robot that re-runs all your checks on every change and <strong>blocks</strong> the change if any fail — your live app keeps running.",
          "The <strong>golden dataset</strong> matters more than the framework. Writing good cases is the real work.",
          "You built <code>agent_evals/</code> running in CI."
        ]},
        { t: "quiz", items: [
          { q: "What does agent eval check that prompt eval doesn't?", options: ["Spelling", "The whole trajectory — which tools were used, in what order, with what arguments", "The model's size"], answer: 1, explain: "Agent eval tests behavior: did it take a sensible route to the answer, not just produce right-looking text. Phase 3 checked the destination; this checks the driving." },
          { q: "The full record of everything an agent did — every tool call, result, and decision — is its ___ . (one word)", answer: "trajectory", explain: "Trajectory correctness asks whether the agent took a sensible route, not just whether the final answer looks right." },
          { q: "Zentara's read-only support agent is asked to \"delete all cancelled orders\" and cheerfully tries. Which dimension catches this?", options: ["Hallucination rate", "Refusal rate — it failed to refuse something it should have", "p95 latency"], answer: 1, explain: "Refusal rate watches two opposite failures: refusing legitimate requests, and — as here — failing to refuse requests it should have declined." },
          { q: "For \"where is order 4412?\", which tool call has sane arguments?", options: ["order_lookup(\"all orders ever\")", "order_lookup(\"4412\")", "web_search(\"order 4412\")"], answer: 1, explain: "Sane means matched to what the task needs: one specific order, one specific lookup. Asking for every order ever — or searching the public web for internal data — signals a broken trajectory." },
          { q: "Your agent evals \"fail the build\" in CI. What actually happens?", options: ["Your live app crashes for users", "The new change is blocked from going in until the checks pass", "The model gets deleted"], answer: 1, explain: "CI is a robot that re-runs your checks on every change. A failure blocks that change from shipping — the version users already have keeps running untouched." }
        ]}
      ]
    }
];
