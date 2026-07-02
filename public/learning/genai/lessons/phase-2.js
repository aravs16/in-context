// Phase 2 lesson content. Block types are rendered by LessonBlock in app.jsx.
window.PHASE_LESSONS = window.PHASE_LESSONS || {};
window.PHASE_LESSONS[2] = [
    {
      id: "intuition",
      label: "Intuition",
      blocks: [
        { t: "p", html: "Phase 1 ended on a warning: the model predicts what's <em>likely</em>, not what's <em>true</em>. Here's where that bites, before any jargon. Ask a model about something private — your company's internal rules, a document only your team has — and it can't help; it was never trained on your stuff. Worse, it'll often <strong>make something up</strong> that sounds right. That's a <strong>hallucination</strong>." },
        { t: "p", html: "Let's prove it on a company the model can't possibly know — because we made it up:" },
        { t: "tryit", steps: [
          { say: "Paste this into ChatGPT or Claude:", prompt: "What is the parental leave policy at Zentara Logistics?", then: "It tells you it has no information on that company — because <strong>Zentara Logistics is invented</strong>, so it's nowhere in the model's training." },
          { say: "Now paste this instead:", prompt: "Zentara Logistics gives every employee 18 weeks of fully paid parental leave, plus a phased return to work.\n\nWhat is the parental leave policy at Zentara Logistics?", then: "Same model, same question — now it answers <strong>\"18 weeks of fully paid parental leave.\"</strong> That one pasted paragraph is the entire idea of this phase." }
        ]},
        { t: "p", html: "The paragraph is everything: hand the model the right text and it answers perfectly; leave it out and it guesses. Now make the problem real. Zentara's shared drive holds about <strong>100 documents</strong> — a 40-page HR handbook, an expense policy, a security guide, onboarding checklists, years of meeting notes. Somewhere in that pile sits the one paragraph about parental leave. So the real job is this: <strong>given a question, find the one right paragraph out of a huge pile of documents, automatically.</strong>" },
        { t: "callout", kind: "key", title: "Why you can't just paste everything", html: "You can't shove <em>all</em> your documents into every question — they won't fit, and almost all of it is irrelevant. The whole phase is about <strong>finding the few paragraphs that matter</strong> and pasting only those. The next section is the trick that makes it possible." },
        { t: "p", html: "For now, picture the whole thing as one <strong>magic box</strong> — call it a <strong>retriever</strong>. It somehow reaches into all 100 documents, pulls out the single right paragraph, and hands it to the model along with your question:" },
        { t: "diagram", mermaid: "flowchart LR\n  D[(\"100s of docs\")] --> R{{\"Retriever  ?\"}}\n  Q[\"Your question\"] --> R\n  R -->|\"the one right paragraph\"| M[\"Question + paragraph\"]\n  M --> L[\"LLM\"]\n  L --> A[\"Correct answer\"]" },
        { t: "p", html: "That retriever is the <em>only</em> mystery here. Everything else — question in, the right paragraph out, the model reads it and answers — you already understand. The rest of this phase is <strong>opening that box</strong> and building what's inside. Keep this picture in mind; we'll fill it in piece by piece." }
      ]
    },
    {
      id: "vectors",
      label: "Words as points in space",
      blocks: [
        { t: "p", html: "Before we find paragraphs, here's the idea that makes it possible — and it's simpler than it sounds. Picture a sheet of graph paper. Your job: place every word on it, giving each one an <strong>(x, y) coordinate</strong>, so that words with <em>similar meaning</em> land close together." },
        { t: "p", html: "So <em>cat</em>, <em>kitten</em>, and <em>dog</em> cluster in one corner; <em>invoice</em>, <em>payment</em>, and <em>tax</em> in another; <em>ocean</em>, <em>wave</em>, and <em>beach</em> in a third — like this:" },
        { t: "vectorspace", points: [
          { label: "cat", x: 1.6, y: 7.2, g: 0 }, { label: "kitten", x: 2.7, y: 8.2, g: 0 }, { label: "dog", x: 1.0, y: 6.0, g: 0 }, { label: "puppy", x: 2.5, y: 5.8, g: 0 },
          { label: "invoice", x: 7.0, y: 7.9, g: 1 }, { label: "payment", x: 8.0, y: 7.0, g: 1 }, { label: "tax", x: 7.2, y: 6.0, g: 1 },
          { label: "ocean", x: 2.2, y: 2.6, g: 2 }, { label: "wave", x: 1.1, y: 3.5, g: 2 }, { label: "beach", x: 3.3, y: 1.9, g: 2 }
        ]},
        { t: "p", html: "You'd lose your mind doing this by hand for every word. The good news: <strong>there's a special kind of model — an embedding model — that does exactly this, automatically.</strong> Give it a word and it hands back coordinates. Those coordinates are called an <strong>embedding</strong>, or a <strong>vector</strong>. Think of it as a street address for meaning: an address tells you where a building sits in a city, an embedding tells you where a piece of text sits on a <strong>map of meaning</strong>. (Real ones use hundreds of dimensions, not two — but the picture is identical.)" },
        { t: "p", html: "Now the payoff. Give it a <em>new</em> word, drop it onto the same map, and measure the <strong>distance</strong> to every existing point. The nearest points are the nearest in meaning:" },
        { t: "vectorspace",
          points: [
            { label: "cat", x: 1.6, y: 7.2, g: 0 }, { label: "kitten", x: 2.7, y: 8.2, g: 0 }, { label: "dog", x: 1.0, y: 6.0, g: 0 }, { label: "puppy", x: 2.5, y: 5.8, g: 0 },
            { label: "invoice", x: 7.0, y: 7.9, g: 1 }, { label: "payment", x: 8.0, y: 7.0, g: 1 }, { label: "tax", x: 7.2, y: 6.0, g: 1 },
            { label: "ocean", x: 2.2, y: 2.6, g: 2 }, { label: "wave", x: 1.1, y: 3.5, g: 2 }, { label: "beach", x: 3.3, y: 1.9, g: 2 }
          ],
          query: { label: "lion", x: 1.9, y: 6.6, nearest: 3 }
        },
        { t: "p", html: "One name to file away now, because you'll see it in real code: in practice that \"how close\" measurement is usually a number called <strong>cosine similarity</strong> — a single score for <em>how close in meaning two points are</em>, where <strong>1 means pointing in exactly the same direction</strong> (same meaning) and around <strong>0 means unrelated</strong>. The tools compute it for you; the ruler-distance-between-dots picture you already have is the same idea." },
        { t: "p", html: "So far we've placed single words. Here's the leap that makes search possible: the embedding model doesn't care whether you hand it one word, a whole sentence, or a full paragraph — <strong>it's all just text</strong>. It reads the <em>meaning</em> of the whole thing and gives it <strong>one point</strong> on the map." },
        { t: "p", html: "So the sentence <em>\"employees get 18 weeks of paid parental leave\"</em> becomes a single point. And it lands near other text about <em>the same thing</em> — close to <em>\"our maternity and paternity policy\"</em>, and far away from <em>\"how to reset your wifi password.\"</em> What decides where it goes is the <strong>meaning</strong>, not the exact words." },
        { t: "h", text: "Why a question lands next to its answer" },
        { t: "p", html: "Now the piece that trips people up. A <strong>question</strong> is also just text — so it gets a point too, on the very same map. And a question <em>about</em> parental leave is about the <strong>same thing</strong> as the paragraph that answers it. Same topic, same neighborhood." },
        { t: "p", html: "So the question <em>\"how much parental leave do I get?\"</em> lands right next to the paragraph <em>\"employees get 18 weeks of paid parental leave\"</em> — <strong>not because the words match</strong> (they barely do), but because the two are <em>about</em> the same thing. That's the whole reason this works." },
        { t: "p", html: "Picture Zentara's HR documents as points — each dot is one paragraph — and drop the question onto the same map. It falls next to the paragraph that answers it:" },
        { t: "vectorspace",
          points: [
            { label: "leave policy", x: 2.4, y: 7.8, g: 0 }, { label: "vacation days", x: 3.4, y: 5.6, g: 0 },
            { label: "expense caps", x: 7.6, y: 7.2, g: 1 }, { label: "wifi setup", x: 7.8, y: 2.8, g: 2 }
          ],
          query: { label: "parental leave?", x: 1.2, y: 6.6, nearest: 1 }
        },
        { t: "p", html: "And here's what those cosine-similarity scores look like with real values. Score Zentara's question <em>\"how much parental leave do I get?\"</em> against three pieces of its documents:" },
        { t: "list", items: [
          "<em>\"Parental leave: employees receive 18 weeks of fully paid leave, plus a phased return to work.\"</em> → <strong>0.89</strong> — nearly the same direction. This is the match.",
          "<em>\"Expenses over $50 require a receipt and manager approval.\"</em> → <strong>0.28</strong> — both smell like workplace policy, but that's all they share.",
          "<em>\"To reset the office wifi, hold the router button for ten seconds.\"</em> → <strong>0.09</strong> — basically unrelated."
        ]},
        { t: "p", html: "That's the entire move. To find the paragraph that answers a question, you don't read anything — you <strong>turn the question into a point, score every paragraph-point by closeness, and grab the nearest ones.</strong> This is <strong>retrieval</strong>: searching by meaning instead of by matching keywords." },
        { t: "h", text: "Where the vectors live: a vector database" },
        { t: "p", html: "One catch: with 100,000 paragraphs, measuring the distance to all of them for every question would be slow. A <strong>vector database</strong> (FAISS, Qdrant, Pinecone, pgvector) is built for exactly this — it stores millions of these vectors and returns the nearest ones in milliseconds. You hand it a question's vector; it hands back the closest paragraphs." },
        { t: "callout", kind: "key", title: "The one idea under all of RAG", html: "An <strong>embedding</strong> turns any text into a point in space, placed by meaning, so similar meanings sit close. A <strong>vector database</strong> stores those points and finds the nearest ones fast. <em>Search-by-meaning</em> is the engine under everything that follows." },
        { t: "p", html: "Remember the mystery <strong>retriever</strong> box from a moment ago? You can already open it. Inside, it does exactly what you just learned — <strong>embed the question into a point, then grab the nearest paragraph-points</strong>:" },
        { t: "diagram", mermaid: "flowchart LR\n  Q[\"Your question\"] --> E[\"embed\"]\n  E --> N[\"find nearest\"]\n  D[(\"docs, as points\")] -.-> N\n  N -->|\"nearest paragraph\"| M[\"Question + paragraph\"]\n  M --> L[\"LLM\"] --> A[\"Answer\"]" },
        { t: "p", html: "So the retriever isn't magic — it's just <em>embed + find nearest</em>. But we've been glossing over one detail, and it's big enough to deserve its own section: <strong>which piece of text gets its own point?</strong>" }
      ]
    },
    {
      id: "the-chunk",
      label: "The chunk — unit of everything",
      blocks: [
        { t: "p", html: "We just said every paragraph becomes a point on the map. But who decided it's <em>paragraphs</em>? Zentara's HR manual is 40 pages. Should the <em>whole manual</em> get one point? Each paragraph? Each sentence? Somebody has to choose — and the choice matters more than it looks." },
        { t: "p", html: "Embed a <strong>whole document</strong> and its point blurs together dozens of unrelated topics — a question about parental leave might match a document that's mostly about expense reports, just because leave gets one paragraph in it. Embed <strong>single sentences</strong> and you lose the surrounding context that made an answer make sense. There's a middle ground, and it has a name: a <strong>chunk</strong> — a small piece of a document, usually a paragraph or two." },
        { t: "p", html: "Here's why this little word is the most important one in the phase. The chunk is <strong>the unit everything else works on</strong> — every stage of the system handles one chunk at a time:" },
        { t: "diagram", mermaid: "flowchart TD\n  CH{{\"one chunk\"}} --> A[\"embedded →<br/>one point on the map\"]\n  CH --> B[\"stored →<br/>one row in the vector DB\"]\n  CH --> C[\"found →<br/>one search result\"]\n  CH --> D[\"pasted →<br/>one block of text the model reads\"]" },
        { t: "callout", kind: "key", title: "The unit of everything", html: "One chunk = one point on the map = one row in the vector database = one search result = one block of text pasted into the prompt. <strong>Get the chunk right and the rest of RAG mostly takes care of itself; get it wrong and nothing downstream can save you.</strong> That's why a later section spends real time on how to cut them." },
        { t: "p", html: "Now you have the whole plan, in one line: <strong>split</strong> your documents into chunks, <strong>embed</strong> each one into a point, and <strong>store</strong> them — done once, ahead of time. Then, every time a question comes in, <strong>embed</strong> it too, and <strong>grab the nearest chunks.</strong> Two separate paths. Let's build them." }
      ]
    },
    {
      id: "ingestion",
      label: "Path 1 · Ingestion",
      blocks: [
        { t: "p", html: "Time to build the first path for real. Zentara has <strong>100 HR documents</strong>, and an employee will eventually ask <em>\"what's the parental leave policy?\"</em> — but this path runs <em>before</em> that ever happens." },
        { t: "list", items: [
          "<strong>Ingestion</strong> — done <em>once, ahead of time</em>: get your documents ready to be searched.",
          "<strong>Query</strong> — done <em>every time someone asks</em>: find the right text and answer."
        ]},
        { t: "p", html: "Take the first path. Before anyone asks anything, you prepare the documents in three moves — <strong>split, embed, store</strong>. Split each document into small <strong>chunks</strong> (a few paragraphs each). Run every chunk through the <strong>embedding model</strong> to turn it into a <strong>vector</strong> — its point in space. Drop every vector into the <strong>vector database</strong>. Watch a document split into chunks and land in storage:" },
        { t: "ingestflow", doc: "100s of docs", chunkCount: 3 },
        { t: "p", html: "Put real numbers on it for Zentara: <strong>100 documents</strong> go in; the splitter turns them into roughly <strong>2,000 chunks</strong> (the 40-page HR manual alone yields about 180); the embedding model turns each chunk into a vector; and the vector DB ends up holding 2,000 points — a <strong>searchable map of everything Zentara knows</strong>, each paragraph placed by meaning." },
        { t: "callout", kind: "tip", title: "Ingestion is the slow, one-time part", html: "You only re-run it when the documents change — add a new policy doc, embed just that one. Once it's done, the hard work is over and answering questions is fast." }
      ]
    },
    {
      id: "query",
      label: "Path 2 · Query",
      blocks: [
        { t: "p", html: "The documents are prepped, so the second path is quick. When <em>\"what's the parental leave policy?\"</em> comes in, you do four moves — <strong>embed, search, retrieve, answer</strong>." },
        { t: "p", html: "<strong>Embed</strong> the question into a vector, using the <em>exact same</em> embedding model so it lands in the same space as the chunks. <strong>Search</strong> the vector DB for the nearest chunk vectors. <strong>Retrieve</strong> those few chunks, <strong>paste</strong> them in front of the question, and let the model <strong>answer</strong> using only that text. Watch the question search, match, and get answered:" },
        { t: "queryflow", question: "“parental leave?”", nearestLabel: "leave policy", chunkPreview: "“18 weeks paid…”", answer: "18 weeks paid ✓" },
        { t: "p", html: "On the example: the question embeds to a point; the nearest chunk is the HR-handbook paragraph that says <em>\"18 weeks paid\"</em>; that chunk gets pasted in with the question; the model reads it and answers correctly, <strong>citing where it came from</strong>. (In practice you pull the nearest 3–5 chunks, not just one, to be safe.)" },
        { t: "p", html: "The word <em>paste</em> is meant literally, by the way. You never have to write any of this yourself — your coding assistant will — but here is the actual text the model ends up receiving for Zentara's question. It's just Phase 1's \"send the model some text\", with the retrieved chunks stacked on top:" },
        { t: "code", label: "read, don't type — the exact text the model receives", code: "Context:\n[1] Parental leave: employees receive 18 weeks of fully paid\n    leave, plus a phased return to work.\n[2] Vacation days: full-time employees accrue 20 days per year.\n[3] Public holidays: Zentara observes 11 public holidays.\n\nQuestion: how much parental leave do I get?\n\nAnswer using ONLY the context above, citing chunks by number.\nIf the answer is not in the context, say you don't know." },
        { t: "p", html: "No magic left: the model reads chunk [1] and answers <em>\"18 weeks of fully paid leave [1]\"</em> — the same trick as the pasted paragraph in the very first section, just automated." },
        { t: "callout", kind: "warn", title: "Why it must be the SAME embedding model", html: "Each embedding model draws its <strong>own</strong> map of meaning — its own coordinate system, laid out differently. Two models are like <strong>two different maps of the same city</strong>: both are fine maps, but a coordinate read off one points at nothing meaningful on the other. Embed your chunks with model A and your questions with model B, and the question lands somewhere <em>random</em> relative to the chunks — not slightly less accurate, <strong>broken outright</strong>. One map. Same model on both paths, always." },
        { t: "callout", kind: "key", title: "That's RAG", html: "<strong>RAG — retrieval-augmented generation.</strong> Ingestion (once): <strong>split → embed → store</strong>. Query (every time): <strong>embed → search → retrieve → answer</strong>. Using the same embedding model on both sides is what makes the question and the right paragraph land near each other." },
        { t: "callout", kind: "tip", title: "When is RAG the right tool?", html: "Use <strong>RAG</strong> when the knowledge is large, changes often, or needs citations. If everything fits in the context window and you ask rarely, just paste it all — simpler. And <strong>fine-tuning</strong> is for changing the model's <em>style</em>, not for adding facts." }
      ]
    },
    {
      id: "chunking",
      label: "Chunking",
      blocks: [
        { t: "p", html: "Back up to the very first step of ingestion — <strong>splitting each document into chunks</strong>. It sounds like boring plumbing, but it quietly decides whether RAG works at all. Here's why it matters so much." },
        { t: "p", html: "Remember the unit-of-everything rule: each chunk becomes <strong>one point</strong> in the vector space, and retrieval hands the model <strong>whole chunks</strong>. So it's what gets embedded, what gets searched, and what gets pasted into the prompt. Get the chunk wrong and there's nothing the model can do to save it." },
        { t: "p", html: "The classic failure is cutting a document in the wrong place, so the answer gets torn in half:" },
        { t: "compare",
          question: "Where does the answer to \"how much parental leave?\" end up?",
          left: {
            tag: "Bad split — cut mid-thought",
            answer: "Chunk A ends: \"…parental leave is one of our newer benefits, introduced in\"   ·   Chunk B starts: \"2024. Employees receive 18 weeks of paid leave…\"",
            verdict: "Answer torn in two",
            note: "Neither chunk holds the full answer, so retrieval grabs half of it — or misses entirely."
          },
          right: {
            tag: "Good split — whole idea kept together",
            answer: "One chunk: \"Parental leave: employees receive 18 weeks of fully paid leave, plus a phased return to work.\"",
            verdict: "Answer intact",
            note: "One clean chunk holds the complete answer — exactly what retrieval should find."
          }
        },
        { t: "p", html: "So the real skill is cutting at <em>sensible</em> boundaries — the end of a paragraph or a section — instead of blindly every N characters. There are three common ways to do it, from crudest to smartest:" },
        { t: "list", ordered: true, items: [
          "<strong>Fixed-size</strong> — just cut every N characters (say every 500), ignoring where sentences or paragraphs end. Dead simple, but it happily slices through the middle of a sentence. A fine place to <em>start</em>, not to finish.",
          "<strong>Recursive</strong> — try the biggest natural boundary first (the blank line between paragraphs); if a piece is still too big, split it on sentences, then on words. It keeps whole ideas together. This is the one you'll reach for most.",
          "<strong>Semantic</strong> — split wherever the <em>meaning</em> shifts: embed the sentences and cut where neighbouring ones stop being similar. The best chunks, but it costs extra work up front."
        ]},
        { t: "p", html: "Start with the simplest thing that works — fixed-size, but with a little <strong>overlap</strong>, where each chunk repeats the last sentence or two of the one before it. The overlap is a safety net: if the answer happens to land right on a boundary, the repeated text means it still shows up whole in one of the chunks. For scale: Zentara's 40-page manual is roughly 90,000 characters, so at 500 characters per chunk that's about 180 chunks." },
        { t: "p", html: "Here's what the naive version looks like. Like every code block in this course, you're not expected to write or even parse it — your assistant does that — it's just here so you can see how little code the crude version is:" },
        { t: "code", label: "read, don't type — the naive chunker (start here, then improve)", code: "def chunk(text, size=500, overlap=50):\n    chunks, start = [], 0\n    while start < len(text):\n        end = start + size\n        chunks.append(text[start:end])\n        start = end - overlap   # step back a little so chunks overlap\n    return chunks" },
        { t: "callout", kind: "warn", title: "The trade-off you'll actually feel", html: "Chunks too <strong>big</strong> → each point covers many topics, so retrieval returns a wall of mostly-irrelevant text and the real answer gets diluted. Too <strong>small</strong> → you lose the surrounding context that made a sentence meaningful. Good starting point: <strong>~300–500 characters</strong> for dense docs, larger for flowing prose — then let your <strong>Phase 3 evals</strong> tell you what actually works for your content." }
      ]
    },
    {
      id: "full-pipeline",
      label: "The full pipeline",
      blocks: [
        { t: "p", html: "You've now seen every piece — chunks, embeddings, the vector database, search, and the prompt. Time to put the whole thing in one picture. Here's the complete <strong>RAG pipeline</strong>:" },
        { t: "diagram", mermaid: "flowchart LR\n  subgraph prep[\"Prep the docs · done once\"]\n    D[\"100s of docs\"] --> C[\"split into chunks\"]\n    C --> EM[\"embed each\"]\n    EM --> V[(\"vector DB\")]\n  end\n  subgraph ask[\"Answer a question · every time\"]\n    Q[\"Question\"] --> EQ[\"embed\"]\n    EQ --> SR[\"search nearest\"]\n    SR --> MP[\"Question + top chunks\"]\n    MP --> LL[\"LLM\"]\n    LL --> AN[\"Answer\"]\n  end\n  V -.-> SR" },
        { t: "p", html: "Read it as the same two paths from before, and walk Zentara's running example through it one last time:" },
        { t: "steps", items: [
          "<strong>Weeks ago (once):</strong> 100 documents → split into ~2,000 chunks → each embedded → 2,000 points stored in the vector DB.",
          "<strong>Today:</strong> an employee asks <em>\"how much parental leave do I get?\"</em>",
          "The question is embedded — with the <strong>same</strong> embedding model — into a point on the same map.",
          "The vector DB returns the 4 nearest chunks; the top one (similarity ~0.89) is <em>\"Parental leave: employees receive 18 weeks of fully paid leave…\"</em>",
          "Those chunks + the question become one prompt; the model answers: <em>\"18 weeks of fully paid leave, plus a phased return to work [1].\"</em>"
        ]},
        { t: "callout", kind: "key", title: "The mystery box, solved", html: "Remember the <strong>retriever</strong> from the very start of this phase? It was the <em>embed → search → vector DB</em> part all along. You've now built every box in this diagram — and that's the whole of RAG." }
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
        { t: "p", html: "One thing in the sample below surprises people: it talks to <strong>two different companies</strong>. An OpenAI <em>embedding model</em> turns text into points, and Claude — a <em>chat model</em> — writes the final answer. That's not a mistake: embedding models and chat models are two different kinds of product, each does exactly one job, and <strong>mixing vendors like this is completely normal</strong>. The only hard rule is the one you already know — the same embedding model on both paths." },
        { t: "code", label: "rag.py — what good output looks like (read, don't type)", code: "# rag.py — pass a query, get a grounded answer with citations\nimport faiss, numpy as np\nfrom openai import OpenAI\nfrom anthropic import Anthropic\n\noai, claude = OpenAI(), Anthropic()\n\ndef embed(text):\n    r = oai.embeddings.create(\n        model=\"text-embedding-3-small\", input=text)\n    return r.data[0].embedding\n\ndef build_index(chunks):\n    vecs = np.array([embed(c) for c in chunks]).astype(\"float32\")\n    faiss.normalize_L2(vecs)\n    idx = faiss.IndexFlatIP(vecs.shape[1])\n    idx.add(vecs)\n    return idx\n\ndef answer(question, chunks, index, k=4):\n    q = np.array([embed(question)]).astype(\"float32\")\n    faiss.normalize_L2(q)\n    scores, ids = index.search(q, k)\n    hits = [chunks[i] for i in ids[0]]\n    context = \"\\n\\n\".join(f\"[{n+1}] {h}\" for n, h in enumerate(hits))\n    msg = claude.messages.create(\n        model=\"claude-sonnet-4-6\",\n        max_tokens=600,\n        messages=[{\"role\": \"user\",\n                   \"content\": f\"Context:\\n{context}\\n\\nQuestion: {question}\"}])\n    return msg.content[0].text, hits" },
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
          "<strong>Retrieved nothing relevant</strong> — query and docs use different vocabulary. Try a better embedding model, or <strong>query rewriting</strong> — having a model rephrase the question in the words your documents actually use, <em>before</em> embedding it (an employee asks \"time off for a new baby?\", the rewrite says \"parental leave policy\").",
          "<strong>Retrieved it but the model ignored it</strong> — context too long, or the instruction to \"use only the context\" was weak.",
          "<strong>Confident hallucination</strong> — no \"say you don't know\" escape hatch in the prompt."
        ]},
        { t: "callout", kind: "tip", title: "Evaluate retrieval and answers separately", html: "First check <strong>retrieval</strong>: for each test question, is the <strong>gold chunk</strong> — the chunk that actually contains the correct answer, which you identified by hand ahead of time — in the top-K results? (Pure counting, no LLM needed.) Only once retrieval is good, judge <strong>answer</strong> quality. Phase 3 turns this into a real eval harness." },
        { t: "p", html: "<strong>What you'll have when you're done:</strong> you can answer questions over your own documents; you've felt how chunk size moves quality more than the model does; you can explain embeddings as \"vibes-as-vectors\" to a friend; and you have a reusable <code>rag.py</code> ready for Phase 4." }
      ]
    },
    {
      id: "recap",
      label: "What you should know",
      blocks: [
        { t: "recap", items: [
          "<strong>RAG</strong> = find the right text at question time and paste it into the prompt. \"Search + paste.\"",
          "An <strong>embedding</strong> places text as a point in space by meaning — similar meanings sit close; you find matches by <strong>distance</strong> (in practice, <strong>cosine similarity</strong>: 1 = same direction, ~0 = unrelated).",
          "A <strong>vector database</strong> stores those points and returns the nearest chunks fast; you pull the nearest few (<strong>K</strong>).",
          "A <strong>chunk</strong> is the unit of everything: one chunk = one point = one search result = one block pasted into the prompt. <strong>Chunking</strong> affects quality more than almost anything.",
          "Use the <strong>same embedding model</strong> for chunks and questions — different models are different maps, and coordinates from one mean nothing on another.",
          "Tell the model to use <strong>only the provided context</strong>, and to <strong>cite</strong> the chunks by number.",
          "When an answer is wrong, suspect <strong>retrieval</strong> first. You built <code>rag.py</code>, ready for Phase 4."
        ]},
        { t: "quiz", items: [
          { q: "In one phrase, what is RAG?", options: ["Retraining the model on your data", "Find relevant text and paste it into the prompt", "A faster model"], answer: 1, explain: "RAG retrieves relevant text at question time and hands it to the model — no retraining." },
          { q: "Two texts with similar meaning have embeddings that are ___.", options: ["Far apart", "Close together", "Exactly equal"], answer: 1, explain: "Embeddings place similar meanings near each other; you find matches by measuring distance." },
          { q: "Zentara's chunks were embedded with embedding model A. Which model must embed the incoming questions?", options: ["Model A — the exact same one", "Any embedding model — they're interchangeable", "A bigger, newer model for better accuracy"], answer: 0, explain: "Each embedding model draws its own map of meaning. A question embedded on a different map lands somewhere random relative to the chunks — retrieval breaks outright, it doesn't just get a bit worse." },
          { q: "Which chunking strategy tries the paragraph boundary first, then falls back to sentences, then words?", options: ["Fixed-size", "Recursive", "Semantic"], answer: 1, explain: "Recursive splitting works down through natural boundaries to keep whole ideas together — it's the one you'll reach for most. Fixed-size cuts blindly every N characters; semantic cuts where the meaning shifts." },
          { q: "The score for how close two embeddings are in meaning — where 1 means pointing in the same direction — is called cosine ___. (one word)", answer: "similarity", explain: "Cosine similarity is the standard \"how close in meaning\" number: 1 = same direction (same meaning), near 0 = unrelated." },
          { q: "A RAG answer is wrong. What should you suspect first? (one word)", answer: "retrieval", explain: "Most RAG failures are bad retrieval — wrong or missing chunks — not the model." }
        ]}
      ]
    }
];
