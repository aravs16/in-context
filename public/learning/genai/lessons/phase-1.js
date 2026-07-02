// Phase 1 lesson content. Block types are rendered by LessonBlock in app.jsx.
window.PHASE_LESSONS = window.PHASE_LESSONS || {};
window.PHASE_LESSONS[1] = [
    {
      id: "intuition",
      label: "Intuition",
      blocks: [
        { t: "p", html: "Forget the hype for a minute. You've already used a tiny language model today — your phone's keyboard. You type a few words and it guesses the next one:" },
        { t: "predict", label: "your phone suggesting the next word", prefix: "See you ", candidates: [
          { tok: "soon", p: 0.34 }, { tok: "later", p: 0.27 }, { tok: "tomorrow", p: 0.19 }, { tok: "there", p: 0.12 }, { tok: "then", p: 0.08 }
        ]},
        { t: "p", html: "That's the whole trick — just small. Your keyboard learned from the texts <em>you've</em> typed: a few years of messages, maybe a million words if you're chatty. Now scale that up — and \"scale\" here isn't an adjective, it's a number. Stack the three sizes next to each other:" },
        { t: "list", items: [
          "<strong>Every message you've ever typed</strong> — roughly a million words. That's your keyboard's entire education.",
          "<strong>All of English Wikipedia</strong> — about 4½ <em>billion</em> words. Thousands of times more than your texts.",
          "<strong>A frontier LLM's training data</strong> — <em>trillions</em> of words: millions of books, huge slices of the public web, mountains of code. To this thing, all of Wikipedia is a rounding error — and it's read roughly <strong>a million times more text than every message you've ever typed</strong>. Reading a book a day, you'd need tens of thousands of lifetimes to catch up."
        ]},
        { t: "p", html: "To predict the next word well across <em>all of that</em> — legal contracts, Python code, love poems, physics forums — the guesser can't get by on habits like your keyboard does. It has to soak up grammar, facts, reasoning patterns, coding style, the shape of an argument. Not because anyone taught it those things — because they're the only way to keep winning the guessing game at that scale." },
        { t: "p", html: "Push it far enough and something strange happens: \"just guess the next word\" becomes good enough to <strong>write an essay, fix a bug in your code, or explain quantum tunneling</strong> — because for each of those, producing the right next word, over and over, <em>is</em> the task." },
        { t: "callout", kind: "key", title: "The one-line intuition", html: "An LLM is <strong>autocomplete that read the internet</strong> — a next-word guesser scaled up until the guessing turned into something that feels like intelligence. Not a database, not a search engine, not a mind." },
        { t: "h", text: "Two things to hold onto" },
        { t: "p", html: "<strong>1. It's a tool, not a being.</strong> It has no memory of you between requests, no goals, no awareness. Each time, it's text in, text out, in isolation — the \"conversation\" is an illusion you create by re-sending the history every time. That's why it can't \"remember\" yesterday unless you remind it." },
        { t: "p", html: "<strong>2. It predicts what's <em>likely</em>, not what's <em>true</em>.</strong> It completes text the way the internet would, not the way reality is. Usually those line up; when they don't, you get a fluent, confident, wrong answer — a <strong>hallucination</strong>. Fixing that is the whole point of Phase 2." },
        { t: "p", html: "Keep <em>\"autocomplete that read the internet\"</em> in your head. Everything else in this course — prompts, tools, memory, agents — is just clever ways to use that one trick." }
      ]
    },
    {
      id: "what-is-llm",
      label: "What is an LLM?",
      blocks: [
        { t: "p", html: "We've got the gut feel — now let's be exact about what it is. An LLM is a <strong>math function</strong>: the <code>f(x)</code> kind from school, where you put something in and get something out, and the same input always gives the same output. Here's the whole thing, start to finish:" },
        { t: "pipeline", stages: [
          { kind: "text", label: "your words", value: "The capital of France is" },
          { kind: "num", label: "turned into numbers", value: "464, 3139,\n295, 6181, 318" },
          { kind: "fn", label: "the math function", value: "billions of\nlearned numbers" },
          { kind: "num", label: "numbers out", value: "Paris  93%\nLyon  3%\nNice  2%" },
          { kind: "text", label: "back to a word", value: "Paris" }
        ]},
        { t: "p", html: "Read it left to right. Computers only do math, so your <strong>words are turned into numbers</strong> first. Those numbers run through the function — and here's the important part: the function is <strong>billions of numbers it <em>learned</em> by reading text</strong>, not rules a human wrote. Out come more numbers — <strong>a score for every possible next word</strong> — and the top one is turned back into text." },
        { t: "p", html: "Notice it never \"looks up\" Paris in a database. It learned that across everything it read, <em>Paris</em> is overwhelmingly the most likely word after that phrase. To an LLM, <strong>knowledge is just very confident prediction</strong> — which is also why shaky knowledge comes out as a confident-sounding guess." },
        { t: "callout", kind: "key", title: "The whole thing", html: "An LLM is a <strong>math function with billions of learned numbers inside</strong>. Words in → numbers → function → numbers → a word out. Everything in this course is built on that one pass." },
        { t: "p", html: "That trained function has a name: a <strong>model</strong>. It's the word you'll see all over this course (<em>\"which model?\"</em>, <em>\"Claude is a model\"</em>) — and now you know exactly what it means: a big math function full of numbers learned from text." },
        { t: "p", html: "One thing to file away: the function part is perfectly repeatable — the same words in give the same scores out, every time. Any randomness you see happens <em>afterward</em>, in a separate step that picks <em>which</em> of the high-scoring words to actually use." },
        { t: "p", html: "But notice what this picture produces: exactly <strong>one word</strong>. A chatbot writes whole paragraphs. The gap between \"one word out\" and \"an essay out\" is closed by a single, almost embarrassingly simple trick — and that's the next section." }
      ]
    },
    {
      id: "prediction-loop",
      label: "The prediction loop",
      blocks: [
        { t: "p", html: "We just watched one prediction — one word out. To get a whole sentence, you do the obvious thing: <strong>append that word and ask again.</strong> Predict, append, predict, append — a loop, with the model reading its own growing text each time." },
        { t: "genloop", prompt: "the cat", steps: [
          { add: " sat",  candidates: [{ tok: "sat", p: 0.48 }, { tok: "lay", p: 0.18 }, { tok: "jumped", p: 0.12 }, { tok: "is", p: 0.08 }] },
          { add: " on",   candidates: [{ tok: "on", p: 0.62 }, { tok: "near", p: 0.12 }, { tok: "by", p: 0.09 }, { tok: "upon", p: 0.06 }] },
          { add: " the",  candidates: [{ tok: "the", p: 0.71 }, { tok: "a", p: 0.14 }, { tok: "my", p: 0.06 }, { tok: "its", p: 0.04 }] },
          { add: " mat",  candidates: [{ tok: "mat", p: 0.39 }, { tok: "floor", p: 0.19 }, { tok: "couch", p: 0.14 }, { tok: "roof", p: 0.08 }] },
          { add: ".",     candidates: [{ tok: ".", p: 0.68 }, { tok: "!", p: 0.1 }, { tok: ",", p: 0.08 }, { tok: "…", p: 0.05 }] }
        ]},
        { t: "p", html: "In picture form, the whole engine is three boxes — and one arrow that bends back on itself. That bent arrow is the entire idea: <strong>the output gets glued onto the input</strong>, and the model reads its own last word as part of the next question:" },
        { t: "diagram", mermaid: "flowchart LR\n  P[\"1 · Predict<br/>score every possible<br/>next word\"] --> A[\"2 · Append<br/>glue the winner onto<br/>the text so far\"] --> E{\"predicted<br/>end-of-text?\"}\n  E -->|\"no — go again\"| P\n  E -->|\"yes\"| S[\"stop — the reply<br/>is done\"]" },
        { t: "p", html: "This is <strong>autoregressive generation</strong> — <em>auto</em> because it feeds on its own output, <em>regressive</em> because each step looks back at everything so far. The model never plans the whole sentence — it just keeps answering \"what's next?\" one piece at a time. It stops when it predicts a special <em>end-of-text</em> token (or you cap the length)." },
        { t: "callout", kind: "tip", title: "Word vs token", html: "The loop actually runs on <strong>tokens</strong>, not words. A token is a chunk of text — often ~4 characters or a word-piece. <code>cat</code> is one token; <code>windowsill</code> might be two. When people talk about cost and context limits, they're counting tokens." },
        { t: "p", html: "How does it choose among the likely words? Always grab the single most likely one and you get safe, predictable text; allow a little randomness and you get creativity. That dial is called <strong>temperature</strong> — we'll get to it soon." }
      ]
    },
    {
      id: "what-is-a-prompt",
      label: "What is a prompt?",
      blocks: [
        { t: "p", html: "We just saw the model only ever continues text. So here's a simple way to think about a <strong>prompt</strong>: it's just the text you hand the model to continue. You set up the start so the most likely continuation is the answer you want." },
        { t: "p", html: "Type <code>The capital of France is</code> and the likeliest continuation is <em>Paris</em>. Type <code>Write a haiku about autumn:</code> and the likeliest continuation is a haiku. You're not commanding the model — you're <strong>steering its prediction</strong> by choosing the setup." },
        { t: "compare",
          question: "Goal: get the one git command to undo your last commit but keep the changes.",
          left: {
            tag: "Vague prompt — \"git undo help\"",
            answer: "A long tour of reset, revert, checkout, reflog… and you still have to figure out which one you meant.",
            verdict: "Vague → noise",
            note: "A loose setup has many plausible continuations, so you get a meandering one."
          },
          right: {
            tag: "Precise prompt — \"Single git command to undo the last commit but keep changes staged. One line, no prose.\"",
            answer: "git reset --soft HEAD~1",
            verdict: "Precise → exact",
            note: "A tight setup makes exactly one continuation overwhelmingly likely."
          }
        },
        { t: "tryit", steps: [
          { say: "Feel yourself steer a prediction. Paste this into ChatGPT or Claude:", prompt: "Complete this sentence with a single word: The capital of France is", then: "You get <strong>Paris</strong> — every time. You didn't \"ask a question\"; you built a text whose only likely continuation is that one word." },
          { say: "Now try the precise prompt from the comparison above:", prompt: "Single git command to undo the last commit but keep changes staged. One line, no prose.", then: "You get <code>git reset --soft HEAD~1</code> and nothing else. Every constraint you added — <em>single</em>, <em>one line</em>, <em>no prose</em> — killed off a whole family of rambling continuations." }
        ]},
        { t: "p", html: "In practice a prompt has two layers. The <strong>system prompt</strong> sets persona and rules for the whole conversation (<em>\"You are a terse senior engineer\"</em>); the <strong>user message</strong> is the specific ask. Both are just text placed in front of the model's prediction. (If you're wondering whether the system prompt \"sticks\" between messages — good instinct; the next section shows exactly how it travels.)" },
        { t: "callout", kind: "key", title: "What \"prompting\" really is", html: "Prompting isn't magic words. It's <strong>arranging the text so your desired answer becomes the most likely continuation.</strong> That's the entire skill — and the rest of this course is increasingly clever ways to set up that text (with your data, with tools, with memory)." }
      ]
    },
    {
      id: "just-an-api",
      label: "Reaching the model",
      blocks: [
        { t: "p", html: "We keep saying \"send the model some text\" — but where does it actually go? For the <strong>best</strong> models, not your laptop. Two reasons: they're <strong>enormous</strong> (far bigger than a laptop can comfortably handle), and the companies that built them <strong>don't hand out the model file</strong>, so you can't download Claude or GPT. Instead you reach them through an <strong>API</strong>: you send your text over the internet and it sends the answer back. Same model — you're just talking to it across the web instead of running it yourself." },
        { t: "callout", kind: "tip", title: "Wait — can't I run a model on my own computer?", html: "Yes, actually — just not the giant ones. There are smaller <strong>open</strong> models (Llama, Mistral, Gemma) you can download and run right on your laptop with a tool like <strong>Ollama</strong>, fully offline. They're less capable than frontier models like Claude, but they genuinely run on your machine. \"It only lives in the cloud\" isn't a hard rule — we just use an API here so you're always working with a top-tier model." },
        { t: "p", html: "The input is a list of <strong>messages</strong> and the output is the generated message. That's the entire interface you build on for the rest of the course." },
        { t: "diagram", mermaid: "sequenceDiagram\n  participant You as Your script\n  participant API as LLM API\n  You->>API: messages = [system, user]\n  Note right of API: model · temperature · max_tokens\n  API-->>You: assistant message\n  Note left of You: tokens · latency · $" },
        { t: "p", html: "Here's what that exchange looks like as real code — and this is the first code in the whole course, so let's be clear: <strong>you never have to write this yourself.</strong> Your coding assistant writes it for you in the Build section at the end of this phase. Don't parse the syntax; just notice the shape — a list of messages goes in, one message comes back out:" },
        { t: "code", label: "read, don't type — the whole thing, in Python", code: "from anthropic import Anthropic\n\nclient = Anthropic()  # reads ANTHROPIC_API_KEY from your environment\n\nmsg = client.messages.create(\n    model=\"claude-sonnet-4-6\",\n    max_tokens=512,\n    system=\"You are a terse senior engineer.\",\n    messages=[{\"role\": \"user\", \"content\": \"Explain a hash map in two sentences.\"}])\n\nprint(msg.content[0].text)" },
        { t: "p", html: "Three lines are worth spotting, because they're the three ideas you already know: <code>model</code> picks <em>which</em> model answers, <code>system</code> is the system prompt from last section, and <code>messages</code> is the conversation so far. Everything else — <code>Anthropic()</code>, <code>.content[0].text</code> — is plumbing that unpacks the envelope the reply arrives in. Plumbing is your assistant's job, not yours." },
        { t: "callout", kind: "tip", title: "The messages format", html: "Every turn is <code>{\"role\": ..., \"content\": ...}</code> with role <code>user</code> or <code>assistant</code>. The <strong>system</strong> prompt rides alongside as its own field. A multi-turn chat is just this list growing — you resend the whole history every time, because the model <strong>has no memory</strong>: each request starts fresh. The \"memory\" is you, re-sending the transcript." }
      ]
    },
    {
      id: "knobs",
      label: "The three knobs",
      blocks: [
        { t: "p", html: "So far you've sent the model some text and gotten a reply. But every request carries a few <strong>settings</strong> too — small dials that change how the model answers, even when your text is exactly the same. Three of them matter most. Here's what each one does." },
        { t: "list", items: [
          "<strong>System prompt</strong> — the rules and personality you set for the whole chat. It's the biggest influence on how the model behaves. <em>\"You are a terse senior engineer\"</em> produces a completely different reply than the default.",
          "<strong>Temperature</strong> — how much randomness in the next-token pick. <code>0</code> = always the top token (repeatable, good for facts/code); higher = more varied (good for brainstorming).",
          "<strong>Max tokens</strong> — a hard cap on how long the reply can be. Too low and answers get cut off mid-sentence."
        ]},
        { t: "p", html: "Temperature is the easiest one to <em>see</em>. It reshapes those next-word scores from earlier: a low temperature narrows them to one clear winner; a high temperature flattens them so more words are in play:" },
        { t: "predict", label: "temperature ≈ 0  (greedy / repeatable)", prefix: "The cat sat on the ", candidates: [
          { tok: "mat", p: 0.97 }, { tok: "floor", p: 0.02 }, { tok: "couch", p: 0.01 }
        ]},
        { t: "predict", label: "temperature ≈ 0.9  (varied / creative)", prefix: "The cat sat on the ", candidates: [
          { tok: "mat", p: 0.31 }, { tok: "floor", p: 0.24 }, { tok: "couch", p: 0.2 }, { tok: "roof", p: 0.14 }, { tok: "warm", p: 0.11 }
        ]},
        { t: "callout", kind: "warn", title: "Default to low for anything that must be right", html: "If you're extracting data, writing code, or answering factual questions, use a low temperature. Save the high settings for brainstorming. A \"creative\" temperature on a SQL generator just gives you creative bugs." },
        { t: "p", html: "One choice rides on every request that's bigger than any of these three dials — and we've been quietly defaulting it this whole time. That's next." }
      ]
    },
    {
      id: "picking-a-model",
      label: "Picking a model",
      blocks: [
        { t: "p", html: "That bigger choice is <strong>which model</strong> to use — the <code>model=</code> line in every request. They're not all the same, and no model is best at everything. Picture a triangle with a corner for each thing you care about: <strong>speed</strong>, <strong>quality</strong>, <strong>cost</strong>. Every model lives somewhere on that triangle, and moving toward one corner means moving away from another:" },
        { t: "diagram", mermaid: "flowchart TD\n  Q[\"Quality<br/>how smart the answers are\"] --- S[\"Speed<br/>how fast they arrive\"]\n  S --- C[\"Cost<br/>price per token\"]\n  C --- Q\n  O([\"Opus / Sonnet live here:<br/>smartest, but slower and pricier\"]) -.-> Q\n  H([\"Haiku lives here:<br/>fast and cheap, less capable\"]) -.-> S" },
        { t: "p", html: "You can't have all three corners at once — a model that's the smartest <em>and</em> the fastest <em>and</em> the cheapest doesn't exist. So picking a model is really answering one question: <em>which corner does this task actually need?</em>" },
        { t: "list", items: [
          "<strong>Small & cheap</strong> (Claude Haiku, GPT-4o-mini) — fast and inexpensive, less capable. Great for classification, extraction, high-volume simple calls.",
          "<strong>Frontier</strong> (Claude Sonnet / Opus, GPT-4o) — smarter, slower, can cost ~30× more per token. Worth it for hard reasoning, code, and agents.",
          "<strong>The move</strong> — start on a strong model to prove the task is even possible, then drop to the smallest model that still passes."
        ]},
        { t: "compare",
          question: "Task: sort 10,000 support emails into \"billing\", \"technical\", or \"other\".",
          left: {
            tag: "Frontier model (Opus)",
            answer: "99% accurate — but about $40 and 20 minutes for the whole batch.",
            verdict: "Overkill",
            note: "You're paying frontier prices for a simple sorting job."
          },
          right: {
            tag: "Small model (Haiku)",
            answer: "98% accurate — about $1.50 and 2 minutes.",
            verdict: "Right fit",
            note: "Nearly the same accuracy for a fraction of the cost and time."
          }
        },
        { t: "p", html: "That's the whole game. For a simple, high-volume task, a small model is almost as good for a tiny fraction of the cost. For a genuinely hard reasoning task, the frontier model earns its price. The catch is knowing <em>which</em> task you've got — and you only really know by measuring." },
        { t: "callout", kind: "tip", title: "You can't pick blind", html: "\"Smallest model that still passes\" assumes you can measure <em>passes</em>. You can't eyeball that reliably — which is exactly why <strong>Phase 3</strong> builds an eval harness. For now, just feel the difference: run the same prompt on a small and a frontier model and compare quality, latency, and cost." }
      ]
    },
    {
      id: "build",
      label: "Build llm_chat.py",
      blocks: [
        { t: "p", html: "Time to build the deliverable — but you won't type it. You'll <strong>describe it to your coding assistant</strong> and run what it produces: a tiny command-line tool that takes a prompt (plus optional model, system, and temperature) and prints the reply. Every later phase builds on this file." },
        { t: "assist",
          intro: "Open Claude Code in an empty folder and paste this:",
          prompt: "Create a Python command-line tool called llm_chat.py.\n\n- It takes a prompt as a command-line argument and prints Claude's reply.\n- Add optional flags: --model (default a fast Claude model), --system (a system prompt), and --temperature.\n- Read the API key from a .env file using python-dotenv.\n- After the reply, also print the input and output token counts.\n\nThen show me how to install the dependencies and add my API key, and run it on a test prompt so I can see the output.",
          asks: [
            "Explain what temperature actually does, in one short paragraph.",
            "What is the messages format, and why is the API stateless?",
            "How can I estimate the token cost of a prompt before I send it?"
          ]
        },
        { t: "p", html: "Don't just run it — read it. Here's roughly what it'll produce, and what each part is doing:" },
        { t: "steps", items: [
          "Sign up for an API account (Anthropic or OpenAI), generate a key, and put it in a <code>.env</code> file. <strong>Never commit it.</strong>",
          "Install the SDK: <code>pip install anthropic python-dotenv</code>.",
          "Write a ~20-line script: read a prompt from the command line, send it, print the response.",
          "Add a <code>--model</code> flag and run the same prompt on a small vs. frontier model — note quality, latency, tokens, cost.",
          "Add <code>--system</code> and <code>--temperature</code> flags and feel how much a sharp system prompt changes everything."
        ]},
        { t: "code", label: "llm_chat.py — what good output looks like (read, don't type)", code: "# llm_chat.py — your first reusable LLM call\nimport sys, argparse\nfrom anthropic import Anthropic\n\nclient = Anthropic()  # ANTHROPIC_API_KEY from your .env\n\ndef chat(prompt, model=\"claude-sonnet-4-6\", system=None, temperature=1.0):\n    msg = client.messages.create(\n        model=model,\n        max_tokens=1024,\n        temperature=temperature,\n        system=system or \"You are a helpful assistant.\",\n        messages=[{\"role\": \"user\", \"content\": prompt}])\n    return msg.content[0].text, msg.usage\n\nif __name__ == \"__main__\":\n    ap = argparse.ArgumentParser()\n    ap.add_argument(\"prompt\")\n    ap.add_argument(\"--model\", default=\"claude-sonnet-4-6\")\n    ap.add_argument(\"--system\")\n    ap.add_argument(\"--temperature\", type=float, default=1.0)\n    a = ap.parse_args()\n    text, usage = chat(a.prompt, a.model, a.system, a.temperature)\n    print(text)\n    print(f\"\\n[{usage.input_tokens} in / {usage.output_tokens} out]\", file=sys.stderr)" },
        { t: "callout", kind: "key", title: "Deliverable — llm_chat.py", html: "A CLI that takes a prompt, optional model and system message, and returns a response. When you're done you can call any LLM from the terminal in under a minute, you've felt the speed/quality/cost triangle in real numbers, and you have the file <strong>Phase 2</strong> plugs its retrieval into." }
      ]
    },
    {
      id: "recap",
      label: "What you should know",
      blocks: [
        { t: "recap", items: [
          "An LLM is a <strong>math function</strong> with billions of learned numbers — words in, a score for every possible next word out.",
          "It writes by running that prediction in a <strong>loop</strong>, one word at a time.",
          "A <strong>prompt</strong> is just the text you give it to continue; you steer the answer by how you set that text up.",
          "You reach a big model over an <strong>API</strong>. It has <strong>no memory</strong> — you resend the whole conversation every call.",
          "Three settings shape the output — <strong>system prompt</strong>, <strong>temperature</strong>, <strong>max tokens</strong> — and it predicts what's <em>likely</em>, not what's <em>true</em> (a confident wrong answer is a <strong>hallucination</strong>).",
          "Every model sits somewhere on the <strong>speed / quality / cost triangle</strong> — you use the smallest model that still passes.",
          "You built <code>llm_chat.py</code>, the base every later phase extends."
        ]},
        { t: "quiz", items: [
          { q: "What does an LLM fundamentally do?", options: ["Look up answers in a database", "Predict the next word", "Run rules a programmer wrote"], answer: 1, explain: "Everything — chat, code, agents — is built on next-word prediction, run in a loop." },
          { q: "How does one prediction become a whole paragraph?", options: ["The model plans the full reply before writing", "Each predicted word is glued onto the text and the model predicts again", "The API stitches several models' answers together"], answer: 1, explain: "That's the predict → append → repeat loop — autoregressive generation. It stops at the end-of-text token." },
          { q: "What is a prompt, really?", options: ["A command the model is programmed to obey", "Text arranged so your desired answer becomes the most likely continuation", "A special keyword that unlocks better answers"], answer: 1, explain: "The model only ever continues text. Prompting is setting up the start so the continuation you want is the likeliest one." },
          { q: "Why do you resend the whole conversation on every API call?", options: ["To save money", "The model has no memory between calls", "It makes answers longer"], answer: 1, explain: "The model is stateless; the \"memory\" is you re-sending the transcript — system prompt included." },
          { q: "Which setting controls how random or creative the output is? (one word)", answer: "temperature", explain: "Low temperature is repeatable and safe; high is more varied. Keep it low for facts and code." },
          { q: "A model gives you a fluent, confident answer that turns out to be wrong. What's that called? (one word)", answer: "hallucination", explain: "It predicts what's likely, not what's true. Fixing this — by handing the model the right facts — is Phase 2." },
          { q: "You need to sort 50,000 short support emails into three folders. Which model do you reach for?", options: ["The frontier model — quality always wins", "A small fast model like Haiku — nearly the same accuracy at a fraction of the cost", "Whichever one has the highest temperature"], answer: 1, explain: "A simple high-volume task sits in the speed + cost corners of the triangle. Prove the task on a strong model if needed, then drop to the smallest model that still passes." }
        ]}
      ]
    }
];
