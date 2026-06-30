// Per-phase lesson content for the full-screen LessonModal.
//
// Shape:  window.PHASE_LESSONS = { <phase.n>: [ subtopic, ... ] }
//   subtopic = { id, label, blocks: [ block, ... ] }
//   block.t  = "p" | "h" | "callout" | "code" | "diagram" | "list" | "steps"
//     p       { t:"p", html }                      inline HTML allowed (strong/em/code/a)
//     h       { t:"h", text }                       sub-heading inside a page
//     callout { t:"callout", kind?, title?, html }  kind: "tip" | "warn" | "key"
//     code    { t:"code", label?, code }            code rendered verbatim (auto-escaped)
//     diagram { t:"diagram", mermaid }              rendered via the Mermaid component
//     list    { t:"list", ordered?, items:[html] }
//     steps   { t:"steps", items:[html] }           numbered, styled like the pane "plan"
//
// A phase with an entry here opens the full-screen LessonModal; phases without
// one fall back to the original right-side Pane. Add more phases the same way.

window.PHASE_LESSONS = {
  1: [
    {
      id: "intuition",
      label: "Intuition",
      blocks: [
        { t: "p", html: "Forget the hype for a minute. You've already used a tiny language model today — your phone's keyboard. You type a few words and it guesses the next one:" },
        { t: "predict", label: "your phone suggesting the next word", prefix: "See you ", candidates: [
          { tok: "soon", p: 0.34 }, { tok: "later", p: 0.27 }, { tok: "tomorrow", p: 0.19 }, { tok: "there", p: 0.12 }, { tok: "then", p: 0.08 }
        ]},
        { t: "p", html: "That's the whole trick — just small. Now scale it up almost beyond imagination. Instead of your recent texts, train it on <strong>most of the text humans have ever written</strong>: books, Wikipedia, code, forums, documentation. To predict the next word <em>that</em> well, it has to soak up grammar, facts, reasoning patterns, coding style, the shape of an argument." },
        { t: "p", html: "Push it far enough and something strange happens: \"just guess the next word\" becomes good enough to <strong>write an essay, fix a bug in your code, or explain quantum tunneling</strong> — because for each of those, producing the right next word, over and over, <em>is</em> the task." },
        { t: "callout", kind: "key", title: "The one-line intuition", html: "An LLM is <strong>autocomplete that read the internet</strong> — a next-word guesser scaled up until the guessing turned into something that feels like intelligence. Not a database, not a search engine, not a mind." },
        { t: "h", text: "Two things to hold onto" },
        { t: "p", html: "<strong>1. It's a tool, not a being.</strong> It has no memory of you between requests, no goals, no awareness. Each time, it's text in, text out, in isolation — the \"conversation\" is an illusion you create by re-sending the history every time. That's why it can't \"remember\" yesterday unless you remind it." },
        { t: "p", html: "<strong>2. It predicts what's <em>likely</em>, not what's <em>true</em>.</strong> It completes text the way the internet would, not the way reality is. Usually those line up; when they don't, you get a fluent, confident, wrong answer — a <strong>hallucination</strong>. Fixing that is the whole point of Phase 2." },
        { t: "p", html: "Keep <em>\"autocomplete that read the internet\"</em> in your head. Everything else in this course — prompts, tools, memory, agents — is scaffolding built around that single trick." }
      ]
    },
    {
      id: "what-is-llm",
      label: "What is an LLM?",
      blocks: [
        { t: "p", html: "So what is it underneath? A <strong>math function</strong> — the <code>f(x)</code> kind from school: put something in, get something out, and the same input always gives the same output. Here's the whole thing, end to end:" },
        { t: "pipeline", stages: [
          { kind: "text", label: "your words", value: "The capital of France is" },
          { kind: "num", label: "turned into numbers", value: "464, 3139,\n295, 6181, 318" },
          { kind: "fn", label: "the math function", value: "billions of\nlearned numbers" },
          { kind: "num", label: "numbers out", value: "Paris  93%\nLyon  3%\nNice  2%" },
          { kind: "text", label: "back to a word", value: "Paris" }
        ]},
        { t: "p", html: "Read it left to right. Computers only do math, so your <strong>words are turned into numbers</strong> first. Those numbers run through the function — and here's the crux: the function is <strong>billions of numbers it <em>learned</em> by reading text</strong>, not rules a human wrote. Out come more numbers — <strong>a score for every possible next word</strong> — and the top one is turned back into text." },
        { t: "p", html: "Notice it never \"looks up\" Paris in a database. It learned that across everything it read, <em>Paris</em> is overwhelmingly the most likely word after that phrase. To an LLM, <strong>knowledge is just very confident prediction</strong> — which is also why shaky knowledge comes out as a confident-sounding guess." },
        { t: "callout", kind: "key", title: "The whole thing", html: "An LLM is a <strong>math function with billions of learned numbers inside</strong>. Words in → numbers → function → numbers → a word out. Everything in this course is built on that one pass." },
        { t: "p", html: "That trained function has a name: a <strong>model</strong>. It's the word you'll see all over this course (<em>\"which model?\"</em>, <em>\"Claude is a model\"</em>) — and now you know exactly what it means: a big math function full of numbers learned from text." },
        { t: "p", html: "One detail for later: the function itself is perfectly repeatable — same words in, same scores out. The only randomness comes <em>after</em>, when something picks <em>which</em> high-scoring word to use. That dial is <strong>temperature</strong>, and it's coming up." }
      ]
    },
    {
      id: "prediction-loop",
      label: "The prediction loop",
      blocks: [
        { t: "p", html: "One prediction gives you one word. To get a whole sentence, you do the obvious thing: <strong>append the predicted word and ask again.</strong> Predict, append, predict, append — a loop, feeding the model its own output." },
        { t: "genloop", steps: [
          { add: "The",  candidates: [{ tok: "The", p: 0.55 }, { tok: "A", p: 0.18 }, { tok: "My", p: 0.12 }, { tok: "It", p: 0.08 }] },
          { add: " cat",  candidates: [{ tok: "cat", p: 0.42 }, { tok: "dog", p: 0.2 }, { tok: "sun", p: 0.12 }, { tok: "man", p: 0.09 }] },
          { add: " sat",  candidates: [{ tok: "sat", p: 0.48 }, { tok: "lay", p: 0.18 }, { tok: "jumped", p: 0.12 }, { tok: "is", p: 0.08 }] },
          { add: " on",   candidates: [{ tok: "on", p: 0.62 }, { tok: "near", p: 0.12 }, { tok: "by", p: 0.09 }, { tok: "upon", p: 0.06 }] },
          { add: " the",  candidates: [{ tok: "the", p: 0.71 }, { tok: "a", p: 0.14 }, { tok: "my", p: 0.06 }, { tok: "its", p: 0.04 }] },
          { add: " mat",  candidates: [{ tok: "mat", p: 0.39 }, { tok: "floor", p: 0.19 }, { tok: "couch", p: 0.14 }, { tok: "roof", p: 0.08 }] },
          { add: ".",     candidates: [{ tok: ".", p: 0.68 }, { tok: "!", p: 0.1 }, { tok: ",", p: 0.08 }, { tok: "…", p: 0.05 }] }
        ]},
        { t: "p", html: "This is <strong>autoregressive generation</strong>. The model never plans the whole sentence — it just keeps answering \"what's next?\" one piece at a time. It stops when it predicts a special <em>end-of-text</em> token (or you cap the length)." },
        { t: "callout", kind: "tip", title: "Word vs token", html: "The loop actually runs on <strong>tokens</strong>, not words. A token is a chunk of text — often ~4 characters or a word-piece. <code>cat</code> is one token; <code>windowsill</code> might be two. When people talk about cost and context limits, they're counting tokens." },
        { t: "p", html: "How does it choose among the likely words? Always grab the single most likely one and you get safe, predictable text; allow a little randomness and you get creativity. That dial is called <strong>temperature</strong> — you'll meet it in a moment." }
      ]
    },
    {
      id: "what-is-a-prompt",
      label: "What is a prompt?",
      blocks: [
        { t: "p", html: "Here's the part that reframes everything. If the model only ever <em>continues text</em>, then a <strong>prompt is just the text you give it to continue.</strong> You're arranging the opening so that the most likely continuation is the answer you want." },
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
        { t: "p", html: "In practice a prompt has two layers. The <strong>system prompt</strong> sets persona and rules for the whole conversation (<em>\"You are a terse senior engineer\"</em>); the <strong>user message</strong> is the specific ask. Both are just text placed in front of the model's prediction." },
        { t: "callout", kind: "key", title: "What \"prompting\" really is", html: "Prompting isn't magic words. It's <strong>arranging the text so your desired answer becomes the most likely continuation.</strong> That's the entire skill — and the rest of this course is increasingly clever ways to set up that text (with your data, with tools, with memory)." }
      ]
    },
    {
      id: "just-an-api",
      label: "Reaching the model",
      blocks: [
        { t: "p", html: "So where does the \"API\" everyone mentions fit in? The model is enormous — it runs on a company's powerful computers, not your laptop, so you can't run it yourself. The <strong>API is simply how you reach that model over the internet</strong>: you send it the input text, it sends back the output. Same model — you're just talking to it across the web instead of running it on your own computer." },
        { t: "p", html: "The input is a list of <strong>messages</strong> and the output is the generated message. That's the entire interface you build on for the rest of the course." },
        { t: "diagram", mermaid: "sequenceDiagram\n  participant You as Your script\n  participant API as LLM API\n  You->>API: messages = [system, user]\n  Note right of API: model · temperature · max_tokens\n  API-->>You: assistant message\n  Note left of You: tokens · latency · $" },
        { t: "code", label: "the whole thing, in Python", code: "from anthropic import Anthropic\n\nclient = Anthropic()  # reads ANTHROPIC_API_KEY from your environment\n\nmsg = client.messages.create(\n    model=\"claude-sonnet-4-6\",\n    max_tokens=512,\n    system=\"You are a terse senior engineer.\",\n    messages=[{\"role\": \"user\", \"content\": \"Explain a hash map in two sentences.\"}])\n\nprint(msg.content[0].text)" },
        { t: "callout", kind: "tip", title: "The messages format", html: "Every turn is <code>{\"role\": ..., \"content\": ...}</code> with role <code>user</code> or <code>assistant</code>. The <strong>system</strong> prompt rides alongside as its own field. A multi-turn chat is just this list growing — you resend the whole history every time, because the model <strong>has no memory</strong>: each request starts fresh. The \"memory\" is you, re-sending the transcript." }
      ]
    },
    {
      id: "knobs",
      label: "The three knobs",
      blocks: [
        { t: "p", html: "Same model, same prompt — three settings still swing the output hard. Learn what each does by feel before you build anything." },
        { t: "list", items: [
          "<strong>System prompt</strong> — the standing instructions and persona. The single biggest lever on behavior. <em>\"You are a terse senior engineer\"</em> produces a completely different reply than the default.",
          "<strong>Temperature</strong> — how much randomness in the next-token pick. <code>0</code> = always the top token (repeatable, good for facts/code); higher = more varied (good for brainstorming).",
          "<strong>Max tokens</strong> — a hard cap on how long the reply can be. Too low and answers get cut off mid-sentence."
        ]},
        { t: "p", html: "Temperature is easiest to <em>see</em> — it reshapes that next-word distribution from earlier. Low temperature sharpens it to one winner; high temperature flattens it so more words are in play:" },
        { t: "predict", label: "temperature ≈ 0  (greedy / repeatable)", prefix: "The cat sat on the ", candidates: [
          { tok: "mat", p: 0.97 }, { tok: "floor", p: 0.02 }, { tok: "couch", p: 0.01 }
        ]},
        { t: "predict", label: "temperature ≈ 0.9  (varied / creative)", prefix: "The cat sat on the ", candidates: [
          { tok: "mat", p: 0.31 }, { tok: "floor", p: 0.24 }, { tok: "couch", p: 0.2 }, { tok: "roof", p: 0.14 }, { tok: "warm", p: 0.11 }
        ]},
        { t: "callout", kind: "warn", title: "Default to low for anything that must be right", html: "If you're extracting data, writing code, or answering factual questions, use a low temperature. Save the high settings for ideation. A \"creative\" temperature on a SQL generator just gives you creative bugs." }
      ]
    },
    {
      id: "picking-a-model",
      label: "Picking a model",
      blocks: [
        { t: "p", html: "Models aren't interchangeable — choosing one is a real engineering decision along a <strong>speed ↔ quality ↔ cost</strong> triangle." },
        { t: "list", items: [
          "<strong>Small & cheap</strong> (Claude Haiku, GPT-4o-mini) — fast and inexpensive, less capable. Great for classification, extraction, high-volume simple calls.",
          "<strong>Frontier</strong> (Claude Sonnet / Opus, GPT-4o) — smarter, slower, can cost ~30× more per token. Worth it for hard reasoning, code, and agents.",
          "<strong>The move</strong> — start on a strong model to prove the task is even possible, then drop to the smallest model that still passes."
        ]},
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
    }
  ],
  2: [
    {
      id: "intuition",
      label: "Intuition",
      blocks: [
        { t: "p", html: "Before any jargon, the core idea. Ask a model a question about something it was never trained on — your data, your company, something private or brand-new — and it will often answer anyway: fluently, confidently, and <strong>wrong</strong>. That made-up answer is a <strong>hallucination</strong>." },
        { t: "p", html: "Now watch what happens when you hand the model <em>one relevant paragraph</em> alongside the same question:" },
        { t: "compare",
          question: "Which of our customers are still on the legacy billing plan?",
          left: {
            tag: "Question alone",
            answer: "Customers on the legacy plan include Acme Corp, Globex, and Initech, who were grandfathered in before the 2023 pricing change.",
            verdict: "Hallucinated",
            note: "Fluent, specific, and entirely invented — the model has never seen your customer list."
          },
          right: {
            tag: "Question + one paragraph",
            context: "billing_plans.md — \"As of June 2026, three accounts remain on the legacy 'Starter-2021' plan: Northwind Traders, Contoso, and Fabrikam. Every other account migrated to usage-based billing.\"",
            answer: "Three accounts are still on the legacy plan: Northwind Traders, Contoso, and Fabrikam.",
            verdict: "Correct",
            note: "Same model, same question — now grounded in a paragraph you handed it."
          }
        },
        { t: "p", html: "Notice what changed: <strong>nothing about the model, and nothing about the question.</strong> The only difference is that one paragraph. That paragraph is the whole game — give the model the right context and it answers correctly; withhold it and it guesses." },
        { t: "callout", kind: "key", title: "So the real problem", html: "You can't just paste <em>all</em> your documents into every prompt — they won't fit in the context window, and you'd pay for thousands of irrelevant tokens on every call. The real question is: <strong>given a question, how do you find the one right paragraph out of thousands of documents — automatically, in milliseconds?</strong>" },
        { t: "p", html: "Imagine a system that does exactly that. You give it a question; it reaches into a pile of documents and hands back just the paragraph that answers it. You staple that paragraph to the question, and let the model write the final answer:" },
        { t: "diagram", mermaid: "flowchart LR\n  Q([Your question]) --> R{{Retriever}}\n  DB[(Thousands of docs)] --> R\n  R -->|the one right paragraph| M[Question + paragraph]\n  M --> L[LLM]\n  L --> A([Grounded answer])" },
        { t: "p", html: "That \"retriever\" in the middle is the only missing piece — and building it is what the rest of this phase is about. The technique has a name: <strong>RAG</strong>, retrieval-augmented generation." }
      ]
    },
    {
      id: "why-rag",
      label: "Why RAG",
      blocks: [
        { t: "p", html: "<strong>RAG (Retrieval-Augmented Generation)</strong> is the standard way to give an LLM access to information it was never trained on — your company's docs, your personal notes, a PDF published yesterday. You don't retrain the model. You <em>retrieve</em> the relevant text at question time and hand it to the model as context." },
        { t: "p", html: "The pipeline splits cleanly into two phases. <strong>Index time</strong> (done once, ahead of time): break documents into <strong>chunks</strong>, turn each chunk into an <strong>embedding</strong> (a vector that captures meaning), and store them. <strong>Query time</strong> (done per question): embed the question, find the nearest chunks, and stuff them into the prompt." },
        { t: "diagram", mermaid: "flowchart LR\n  subgraph idx[Index time]\n    D[Docs] --> C[Chunks]\n    C --> E[Embeddings]\n    E --> V[(FAISS)]\n  end\n  subgraph qry[Query time]\n    Q[Question] --> QE[Embed]\n    QE --> S[Top-K search]\n    S --> P[Prompt + context]\n    P --> L[LLM]\n    L --> A[Answer]\n  end\n  V -.-> S" },
        { t: "h", text: "When to reach for RAG" },
        { t: "list", items: [
          "<strong>RAG</strong> — the knowledge is large, changes often, or needs citations. Default choice for \"answer over my documents.\"",
          "<strong>Long context</strong> — the whole corpus fits in the context window and you query it rarely. Simpler, but you pay for every token on every call.",
          "<strong>Fine-tuning</strong> — you want to change <em>behaviour or style</em>, not inject facts. Fine-tuning teaches form, not knowledge."
        ]},
        { t: "callout", kind: "key", title: "The one-sentence model", html: "RAG is just <strong>search + paste</strong>: find the right paragraphs, paste them into the prompt, ask the question. Everything else is making that search good." }
      ]
    },
    {
      id: "embeddings",
      label: "Embeddings",
      blocks: [
        { t: "p", html: "An <strong>embedding</strong> turns a piece of text into a list of numbers — a vector — positioned so that texts with similar <em>meaning</em> land near each other. \"cat\" and \"kitten\" end up close; \"cat\" and \"tax law\" end up far apart. Think of it as <em>vibes-as-vectors</em>." },
        { t: "p", html: "\"Near\" is measured by <strong>cosine similarity</strong> — the angle between two vectors. Same direction = 1.0 (identical meaning), perpendicular = 0.0 (unrelated). Because it ignores length and only cares about direction, it compares meaning rather than text size." },
        { t: "code", label: "embed + compare", code: "from openai import OpenAI\nimport numpy as np\n\nclient = OpenAI()\n\ndef embed(text):\n    r = client.embeddings.create(\n        model=\"text-embedding-3-small\", input=text)\n    return r.data[0].embedding\n\ndef cosine(a, b):\n    a, b = np.array(a), np.array(b)\n    return a @ b / (np.linalg.norm(a) * np.linalg.norm(b))\n\nprint(cosine(embed(\"cat\"), embed(\"kitten\")))   # ~0.86\nprint(cosine(embed(\"cat\"), embed(\"tax law\")))  # ~0.11" },
        { t: "callout", kind: "tip", title: "Picking a model", html: "<code>text-embedding-3-small</code> (OpenAI, 1536 dims) is cheap and strong enough to start. <strong>Voyage</strong> models often win on technical/code corpora. Whatever you pick, embed your <em>documents</em> and your <em>queries</em> with the <strong>same model</strong> — vectors from different models aren't comparable." }
      ]
    },
    {
      id: "chunking",
      label: "Chunking",
      blocks: [
        { t: "p", html: "Chunking is how you split documents before embedding — and it is <strong>the single biggest lever on RAG quality</strong>. Most RAG failures are not the model's fault; they're bad chunks. If the right answer is split across two chunks, or buried in a chunk full of unrelated text, retrieval can't save you." },
        { t: "h", text: "Three strategies, increasing in smarts" },
        { t: "list", ordered: true, items: [
          "<strong>Fixed-size</strong> — every N characters with a little overlap. Dead simple, ignores structure. The right place to start.",
          "<strong>Recursive</strong> — split on the biggest natural boundary first (paragraph), fall back to sentence, then words, until chunks fit. Respects structure; the workhorse default.",
          "<strong>Semantic</strong> — split where the <em>meaning</em> shifts (embed sentences, cut where similarity drops). Best chunks, most expensive to compute."
        ]},
        { t: "code", label: "naive fixed-size chunker — start here", code: "def chunk(text, size=500, overlap=50):\n    chunks, start = [], 0\n    while start < len(text):\n        end = start + size\n        chunks.append(text[start:end])\n        start = end - overlap   # overlap keeps ideas from being cut in half\n    return chunks" },
        { t: "callout", kind: "warn", title: "The failure you'll actually hit", html: "Chunks too <strong>big</strong> → retrieval returns a wall of mostly-irrelevant text and the answer gets diluted. Too <strong>small</strong> → you lose the surrounding context that made the sentence meaningful. Tune size to your content: ~300–500 chars for dense technical docs, larger for flowing prose." }
      ]
    },
    {
      id: "vector-search",
      label: "Vector search",
      blocks: [
        { t: "p", html: "Once every chunk is a vector, retrieval is a <strong>nearest-neighbour search</strong>: embed the question, then find the K chunks whose vectors point most in the same direction. <strong>FAISS</strong> does this in-memory with zero infrastructure — perfect for a corpus of dozens to thousands of chunks." },
        { t: "code", label: "FAISS: build index + search", code: "import faiss, numpy as np\n\n# normalize + inner product == cosine similarity\nvecs = np.array([embed(c) for c in chunks]).astype(\"float32\")\nfaiss.normalize_L2(vecs)\nindex = faiss.IndexFlatIP(vecs.shape[1])\nindex.add(vecs)\n\ndef search(query, k=4):\n    q = np.array([embed(query)]).astype(\"float32\")\n    faiss.normalize_L2(q)\n    scores, ids = index.search(q, k)\n    return [(chunks[i], float(s)) for i, s in zip(ids[0], scores[0])]" },
        { t: "p", html: "<strong>K</strong> is the number of chunks you retrieve. Too low and you miss the answer; too high and you flood the prompt with noise (and burn tokens). Start at <code>k=4</code> and tune. <code>IndexFlatIP</code> does an exact search — once you outgrow a few hundred thousand vectors, swap in an approximate index (<code>IndexIVFFlat</code>, HNSW) to trade a little accuracy for speed." },
        { t: "callout", kind: "tip", title: "Metadata filtering", html: "Real corpora need filters: \"only docs from 2024,\" \"only this product.\" Store metadata alongside each vector and filter <em>before</em> (or after) the similarity search. This is where a real vector DB (Qdrant, pgvector, Pinecone) starts to earn its keep over raw FAISS." }
      ]
    },
    {
      id: "assemble",
      label: "Assembling the prompt",
      blocks: [
        { t: "p", html: "Retrieval gives you the right chunks; now you assemble them into a prompt. Two rules carry most of the quality: <strong>tell the model to use only the provided context</strong> (so it doesn't hallucinate from training data), and <strong>number the chunks</strong> so it can cite them." },
        { t: "code", label: "prompt template with citations", code: "PROMPT = \"\"\"Answer the question using ONLY the context below.\nIf the answer isn't in the context, say you don't know.\n\nContext:\n{context}\n\nQuestion: {question}\"\"\"\n\ndef build_prompt(question, hits):\n    context = \"\\n\\n---\\n\\n\".join(\n        f\"[{i+1}] {text}\" for i, (text, score) in enumerate(hits))\n    return PROMPT.format(context=context, question=question)" },
        { t: "callout", kind: "warn", title: "Mind the context window", html: "Retrieved chunks + the question + the model's reply all share one finite budget. <code>k=8</code> chunks of 500 chars is fine; <code>k=50</code> will blow the window and balloon cost. Retrieve tightly, and if you need breadth, summarize chunks before stuffing them." },
        { t: "p", html: "Because each chunk is numbered, the model can answer with <em>\"...as described in [2] and [4].\"</em> Keep the chunk → source mapping around so you can turn those markers into real links back to the document. Grounded answers <strong>with citations</strong> are what make RAG trustworthy." }
      ]
    },
    {
      id: "build",
      label: "Build rag.py",
      blocks: [
        { t: "p", html: "Time to build the deliverable: a single module you pass a query and get back a grounded answer plus the chunks it used. As always, you <strong>describe it to your assistant</strong> and run the result — this is the thing Phase 4's agent will call as a tool." },
        { t: "assist",
          intro: "Point your coding assistant at a folder of your own documents and paste this:",
          prompt: "Build a Python module called rag.py that does retrieval-augmented generation over a folder of my text and markdown files.\n\n- Load the files and split them into ~500-character chunks with a little overlap.\n- Embed each chunk and build an in-memory FAISS index.\n- Expose answer(question): embed the question, retrieve the top 4 chunks, and ask Claude to answer using ONLY those chunks, citing them by number.\n- If the answer isn't in the chunks, it should say it doesn't know.\n\nShow me how to install the dependencies (anthropic, an embeddings provider, faiss-cpu), point it at my docs folder, and run it on a sample question with its sources.",
          asks: [
            "What is an embedding, and why does cosine similarity measure 'similar meaning'?",
            "When should I use fixed-size vs. recursive vs. semantic chunking?",
            "How do I evaluate retrieval quality separately from answer quality?"
          ]
        },
        { t: "p", html: "Then read what it built — here's the shape of it and the moving parts:" },
        { t: "steps", items: [
          "Pick a small corpus you actually care about (10–50 docs): blog posts, a product manual, your notes, a few PDFs.",
          "Convert everything to plain text (<code>pdfplumber</code> or <code>pypdf</code> for PDFs).",
          "Chunk naively (fixed-size ~500 / overlap ~50), embed each chunk, build the FAISS index.",
          "Write the query path: embed question → top-K search → numbered context → call the LLM.",
          "Iterate on chunking and K against the <em>same</em> 5 hard questions until answers are solid."
        ]},
        { t: "code", label: "rag.py — what good output looks like (read, don't type)", code: "# rag.py — pass a query, get a grounded answer with citations\nimport faiss, numpy as np\nfrom openai import OpenAI\nfrom anthropic import Anthropic\n\noai, claude = OpenAI(), Anthropic()\n\ndef embed(text):\n    r = oai.embeddings.create(\n        model=\"text-embedding-3-small\", input=text)\n    return r.data[0].embedding\n\ndef build_index(chunks):\n    vecs = np.array([embed(c) for c in chunks]).astype(\"float32\")\n    faiss.normalize_L2(vecs)\n    idx = faiss.IndexFlatIP(vecs.shape[1])\n    idx.add(vecs)\n    return idx\n\ndef answer(question, chunks, index, k=4):\n    q = np.array([embed(question)]).astype(\"float32\")\n    faiss.normalize_L2(q)\n    scores, ids = index.search(q, k)\n    hits = [chunks[i] for i in ids[0]]\n    context = \"\\n\\n\".join(f\"[{n+1}] {h}\" for n, h in enumerate(hits))\n    msg = claude.messages.create(\n        model=\"claude-opus-4-8\",\n        max_tokens=600,\n        messages=[{\"role\": \"user\",\n                   \"content\": f\"Context:\\n{context}\\n\\nQuestion: {question}\"}])\n    return msg.content[0].text, hits" },
        { t: "callout", kind: "key", title: "Deliverable — rag.py", html: "Pass a query, get an answer grounded in your docs, with citations to the retrieved chunks. Keep it importable: Phase 4 wires <code>answer()</code> in as a tool the agent can call." }
      ]
    },
    {
      id: "pitfalls",
      label: "Pitfalls & evaluation",
      blocks: [
        { t: "p", html: "When RAG gives a bad answer, the instinct is to blame the model. It's almost always retrieval. Separate the two so you know which to fix." },
        { t: "h", text: "The usual suspects" },
        { t: "list", items: [
          "<strong>Right info, wrong chunk</strong> — the answer existed but got split or buried. Fix chunking, not the prompt.",
          "<strong>Retrieved nothing relevant</strong> — query and docs use different vocabulary. Try a better embedding model or query rewriting.",
          "<strong>Retrieved it but the model ignored it</strong> — context too long, or the instruction to \"use only the context\" was weak.",
          "<strong>Confident hallucination</strong> — no \"say you don't know\" escape hatch in the prompt."
        ]},
        { t: "callout", kind: "tip", title: "Evaluate retrieval and answers separately", html: "First check <strong>retrieval</strong>: for each test question, is the gold chunk in the top-K? (precision/recall on chunks, no LLM needed). Only once retrieval is good, judge <strong>answer</strong> quality. Phase 3 turns this into a real eval harness." },
        { t: "p", html: "<strong>What you'll have when you're done:</strong> you can answer questions over your own documents; you've felt how chunk size moves quality more than the model does; you can explain embeddings as \"vibes-as-vectors\" to a friend; and you have a reusable <code>rag.py</code> ready for Phase 4." }
      ]
    }
  ]
};
