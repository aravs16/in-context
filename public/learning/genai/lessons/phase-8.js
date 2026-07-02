// Phase 8 lesson content. Block types are rendered by LessonBlock in app.jsx.
window.PHASE_LESSONS = window.PHASE_LESSONS || {};
window.PHASE_LESSONS[8] = [
    {
      id: "intuition",
      label: "Intuition",
      blocks: [
        { t: "p", html: "Back in Phase 1 you learned the most jarring fact in this course: the model remembers <strong>nothing</strong> between calls. Every single API call starts from a blank slate, and the \"conversation\" is an illusion your code creates by re-sending the whole transcript every time. So how does a chatbot greet you by name, or pick up a project you mentioned last week? It doesn't. <em>You</em> build the memory around it, and feed the right bits back in each time." },
        { t: "p", html: "Here's the analogy that carries this whole phase. Imagine a brilliant assistant with total amnesia — sharp as anyone while you're talking, but the moment a conversation ends, it's gone. Their fix: a <strong>notebook</strong>. Before every reply, they re-read their notes. After every conversation, they jot down what mattered. Ask them next week and they answer instantly — not because they remember, but because they <em>read it back to themselves</em> a second ago. That notebook is what \"memory\" means for an agent: text it saves, then re-loads into the prompt." },
        { t: "p", html: "One word to pin down before the example: a <strong>session</strong> is one continuous conversation — from the moment you open the chat to the moment you close it. Within a session, your code holds the growing message list. Between sessions, only what got written to the notebook survives." },
        { t: "compare",
          question: "You (new session, next day): \"Where did we land on Zentara's refund workflow?\"",
          left: {
            tag: "No memory",
            answer: "\"I don't have any record of a previous conversation about a refund workflow.\"",
            verdict: "Forgets",
            note: "Each session starts blank; yesterday may as well never have happened."
          },
          right: {
            tag: "With memory",
            answer: "\"Last time we set it up so refunds under $50 auto-approve and bigger ones go to a human. You wanted to add email notifications next.\"",
            verdict: "Remembers",
            note: "Saved facts and a summary of the last session were loaded into the prompt before it answered."
          }
        },
        { t: "callout", kind: "key", title: "What memory really is", html: "The model is <strong>stateless</strong> — nothing carries over between calls. \"Memory\" is the notebook system <em>you</em> build around it: well-chosen text, saved after conversations and loaded back into the prompt. The skill of this phase is choosing what to write down and what to read back." }
      ]
    },
    {
      id: "two-tiers",
      label: "Two tiers",
      blocks: [
        { t: "p", html: "So the agent keeps a notebook. That notebook has two distinct parts — the page it's writing on <em>right now</em>, and the saved notes in the back. In agent terms, memory comes in <strong>two tiers</strong>:" },
        { t: "list", items: [
          "<strong>Short-term</strong> — the conversation <em>within</em> one session. This is just Phase 1's growing message list: you keep the messages and pass the last few turns into each new prompt. That's how the agent follows the thread of <em>this</em> chat. Nothing new to build — you've had this since Phase 1.",
          "<strong>Long-term</strong> — everything that should survive <em>across</em> sessions. Two kinds of notes live here. <strong>Saved facts</strong>: short, durable truths about the user — for Zentara's customer Maya, things like <em>\"prefers email over phone\"</em> and <em>\"manages the Atlanta warehouse.\"</em> And <strong>session summaries</strong>: a few-sentence recap written at the end of each conversation — <em>\"last week we set up their refund workflow.\"</em> Both get saved (a small database works fine — or the vector database from Phase 2, if you want to search memories by meaning) and loaded into the system prompt when a new session starts."
        ]},
        { t: "p", html: "Why both kinds? They answer different questions. A saved fact answers <em>\"who is this person?\"</em> — true today, true next month. A session summary answers <em>\"what were we doing?\"</em> — the story so far, one chapter per conversation. An agent that loads only facts knows Maya but forgets the project; one that loads only summaries knows the project but keeps asking how she'd like to be contacted." },
        { t: "diagram", mermaid: "flowchart TB\n  subgraph st[Short-term · this session]\n    H[Last N turns]\n  end\n  subgraph lt[Long-term · saved]\n    F[Saved facts]\n    S[Session summaries]\n  end\n  Q[New question] --> P[System prompt + loaded context]\n  F --> P\n  S --> P\n  H --> P\n  P --> AG[Agent]\n  AG --> R[Response]\n  AG -.summarize.-> S\n  AG -.extract.-> F" },
        { t: "p", html: "\"Loaded into the system prompt\" is a bit abstract — here's what it literally means. This is the actual text sent to the model, assembled from both tiers, before Maya's new question is even added:" },
        { t: "code", label: "the assembled system prompt — what actually gets sent (read, don't type)", code: "You are Zentara Logistics' support agent, talking to Maya.\n\nKnown facts (long-term):\n- Prefers email over phone\n- Manages the Atlanta warehouse\n\nLast session summary (long-term):\n- Set up her refund workflow: refunds under $50\n  auto-approve, larger ones go to a human.\n  She wants to add email notifications next.\n\nRecent messages (short-term, this session):\n- user: \"can we pick up where we left off?\"\n- assistant: \"Sure — ready to add those email\n  notifications to the refund workflow?\"" },
        { t: "p", html: "That's the whole trick, in full: just <strong>text, assembled from the notebook, pasted in front of the conversation.</strong> Nothing about the model changed — it's still the amnesiac from Phase 1. You just handed it the right reminders before it started predicting." },
        { t: "callout", kind: "tip", title: "The whole trick behind \"it remembers me\"", html: "At the start of a new session, load the user's saved facts and a short summary of last time into the system prompt. The agent picks up right where it left off — without remembering a thing." }
      ]
    },
    {
      id: "compaction",
      label: "When chats get long",
      blocks: [
        { t: "p", html: "Short-term memory has a catch. Remember from Phase 1 that the whole transcript is re-sent on <em>every</em> call — and the model can only read so much at once. That limit is its <strong>context window</strong>: the maximum amount of text one call can hold. A busy support chat can run to hundreds of turns; eventually the transcript simply won't fit. And even before it stops fitting, it hurts — every extra turn is re-sent (and paid for) on every single call." },
        { t: "p", html: "The fix is <strong>compaction</strong>. Think of the notebook again: when the page fills up, you don't copy every old line onto a fresh page — you write one condensed note at the top (\"so far we've…\") and keep going. Compaction does exactly that to a chat: <strong>summarize the oldest turns into a few sentences, replace them with that summary, and keep the recent turns word-for-word.</strong> You trade exact wording for room." },
        { t: "p", html: "Watch it happen — messages fill the window, and the oldest ones squeeze into a single summary card:" },
        { t: "compactflow" },
        { t: "h", text: "Before and after — what compaction actually does" },
        { t: "p", html: "Here's a real Zentara support session, six messages in and pushing the limit:" },
        { t: "code", label: "before compaction — 6 messages, window nearly full", code: "1  user:      \"A customer on order #4127 wants a refund —\n              the item arrived damaged.\"\n2  assistant: \"Got it. Order #4127 is $38, under the $50\n              auto-approve limit. Refund issued.\"\n3  user:      \"She asked if we can send a replacement\n              instead next time.\"\n4  assistant: \"Noted — I've marked replacement-first as\n              her preference.\"\n5  user:      \"New topic: what's our policy on late\n              international shipments?\"\n6  assistant: \"Zentara refunds shipping fees on international\n              orders that arrive more than 10 days late.\"" },
        { t: "p", html: "Compaction asks the model to summarize the oldest four messages, then swaps them out. This is what the list looks like afterwards:" },
        { t: "code", label: "after compaction — oldest 4 replaced by one summary", code: "★  [summary of msgs 1–4]:\n   \"Issued a $38 auto-approved refund for damaged\n   order #4127. Customer prefers a replacement over\n   a refund in future cases.\"\n\n5  user:      \"New topic: what's our policy on late\n              international shipments?\"\n6  assistant: \"Zentara refunds shipping fees on international\n              orders that arrive more than 10 days late.\"" },
        { t: "p", html: "Look at what survived and what didn't. The <em>facts</em> made it: the order number, the $38, the replacement preference — if message 7 asks \"what did we refund on #4127?\", the agent can still answer. The <em>exact wording</em> is gone. And the two most recent turns stayed untouched, word-for-word, because the current thread is where precision matters most." },
        { t: "callout", kind: "warn", title: "Compaction is lossy", html: "Whatever the summary drops, the agent has <em>truly</em> forgotten — there's no original to go back to inside the chat. That's why compaction targets the <strong>oldest</strong> turns and keeps recent ones verbatim: the further back a detail is, the less likely you need its exact wording." },
        { t: "p", html: "And here's the neat part: long-term memory is built with the very same move. At the end of a session, you ask the model to write the session summary (compaction's trick, applied to the whole chat) and to pull out durable facts (\"prefers email over phone\") to save. One habit, two payoffs: <strong>summarize to remember; extract to personalize.</strong>" },
        { t: "callout", kind: "key", title: "Compaction in one line", html: "<strong>Compaction</strong> = replace the oldest turns of a long chat with a short model-written summary, so the conversation keeps fitting in the context window. The gist stays; the space comes back." }
      ]
    },
    {
      id: "build",
      label: "Build memory",
      blocks: [
        { t: "p", html: "Time to give your agent its notebook: short-term within a session, long-term across sessions, and compaction for chats that run long." },
        { t: "assist",
          intro: "In your agent project, paste this:",
          prompt: "Add memory.py to my agent.\n\n- Short-term: keep each session's messages keyed by session_id, and pass the last N turns into every prompt.\n- Long-term: at session end, have the model extract durable facts about the user and save them in SQLite keyed by user_id, plus a few-sentence summary of the session. On a new session, load those facts and the last session's summary into the system prompt.\n- Compaction: when a session gets longer than N tokens, summarize the oldest turns and replace them with the summary, keeping recent turns verbatim.\n\nShow me it remembering something across two separate sessions, and show me a before/after of one compaction.",
          asks: [
            "Why does the model \"forget\" between calls?",
            "What's the difference between short-term and long-term memory here?",
            "What is compaction, and what information does it lose?"
          ]
        },
        { t: "p", html: "Read what it builds — the notebook routine in code: memory loaded into the prompt at the start of a session, written back at the end:" },
        { t: "code", label: "memory.py — what good output looks like (read, don't type)", code: "# memory.py — make a stateless model feel persistent\ndef build_prompt(user_id, session_id, question):\n    facts  = load_facts(user_id)            # long-term: saved facts\n    summary = last_summary(user_id)         # long-term: last session's recap\n    recent = last_turns(session_id, n=8)    # short-term: this session\n    system = f\"You are talking to {facts}. Last time: {summary}\"\n    if too_long(recent):\n        recent = compact(recent)            # summarize oldest turns to fit\n    return system, recent + [{\"role\": \"user\", \"content\": question}]\n\ndef end_session(user_id, session_id):\n    facts = extract_facts(history(session_id))   # ask the model what to remember\n    save_facts(user_id, facts)\n    save_summary(user_id, summarize(history(session_id)))" },
        { t: "callout", kind: "key", title: "Deliverable — memory.py", html: "The agent remembers across sessions, compacts long chats so they fit, and personalizes its replies — built entirely from saving and re-loading text around a model that still remembers nothing." }
      ]
    },
    {
      id: "recap",
      label: "What you should know",
      blocks: [
        { t: "recap", items: [
          "The model is <strong>stateless</strong> — Phase 1's blank slate never changed. <strong>Memory</strong> is the notebook you build around it: text saved after conversations and re-loaded into the prompt.",
          "A <strong>session</strong> is one continuous conversation, from opening the chat to closing it.",
          "<strong>Short-term</strong> memory = this session's recent turns, passed into each prompt.",
          "<strong>Long-term</strong> memory = two kinds of saved notes: <strong>facts</strong> about the user (\"prefers email over phone\") and <strong>session summaries</strong> (\"last week we set up their refund workflow\"), loaded at the start of new sessions.",
          "<strong>Compaction</strong> replaces the oldest turns of a long chat with a short summary so it keeps fitting the context window — the gist survives, the exact wording doesn't.",
          "One habit, two payoffs: <em>summarize to remember; extract to personalize</em>.",
          "You built <code>memory.py</code> — your agent now persists and personalizes across sessions."
        ]},
        { t: "quiz", items: [
          { q: "Why does an LLM \"forget\" between calls?", options: ["It deletes its training", "Each API call is stateless — it has no memory of past calls", "It runs out of tokens"], answer: 1, explain: "The model is stateless; \"memory\" is the text your code saves and re-sends around it — the notebook, not the brain." },
          { q: "Saving a user's name and preferences to use in future sessions is ___ memory.", options: ["short-term", "long-term", "no"], answer: 1, explain: "Long-term memory survives across sessions; short-term is just this session's recent turns." },
          { q: "\"Last week we set up their refund workflow,\" written at the end of a chat and loaded next time, is a…", options: ["short-term turn", "long-term session summary", "guardrail"], answer: 1, explain: "Session summaries are the second kind of long-term note, alongside saved facts — they answer \"what were we doing?\" while facts answer \"who is this person?\"" },
          { q: "When a chat gets compacted, what happens to the oldest messages?", options: ["They're deleted with nothing kept", "They're replaced by a short model-written summary that keeps the gist", "They're moved to a bigger model"], answer: 1, explain: "Compaction is lossy but not blind: the oldest turns become a few summary sentences (order #4127, $38, replacement preference…), while recent turns stay word-for-word." },
          { q: "Summarizing old turns so a long chat still fits the context window is called ___ . (one word)", answer: "compaction", explain: "Compaction trades the exact old turns for a summary to free up room — you watched msgs 1–4 squeeze into one summary card." }
        ]}
      ]
    }
];
