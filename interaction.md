# GenAI Learning Path — Student/Teacher Content Audit

Read-only simulated audit. A fresh "student" persona (total beginner, no coding/ML background) read every phase and subtopic; a "teacher" persona judged each confusion as either a real content gap (FIX NEEDED) or an intentional beginner-scope boundary (NOT A FIX — redirected to fundamentals). No content was changed.

## Phase 1: Talk to an LLM

### Intuition
**Student:** Okay, the phone-keyboard example actually landed for me — I've seen that "next word" suggestion bar a million times and never thought of it as a tiny AI. Saying an LLM is "autocomplete that read the internet" is the first sentence in this whole course that made me go "oh, I get it." But then it jumps to "push it far enough and this becomes good enough to write an essay, fix a bug, or explain quantum tunneling" and I don't feel the *how* of that jump — it just says "scale it up almost beyond imagination" without showing me what that scale actually looks like (like, how much bigger is "most of the text humans have ever written" than my last 100 texts?). Also this line stopped me: "the conversation is an illusion you create by re-sending the history every time" — I don't yet understand mechanically what "re-sending the history" even means, so it's a bit of a floating claim right now. And it name-drops "hallucination" and says fixing it is "the whole point of Phase 2" — I'll trust that, but I don't know yet why a fluent wrong answer would even happen.

**Teacher:** Good, the keyboard hook is supposed to be the on-ramp, glad it worked. On the scale jump: FIX NEEDED — in the "Intuition" section, add a concrete size comparison (e.g., "your keyboard learned from your texts; this learned from something like all of Wikipedia + millions of books + code repositories — roughly a million times more text") or a simple visual bar comparing the two, so "scale it up almost beyond imagination" isn't just an adjective. On "the conversation is an illusion" — NOT A FIX, redirected to fundamentals: hold that thought, it's fully explained two sections from now in "Reaching the model," where you'll see the actual messages list being resent. You're right to notice it's unexplained *here* — that's intentional sequencing, not a gap, so don't dig into it yet. On hallucination — same answer, it's a preview, not a teaching point yet; Phase 2 is where it gets real content. Stay with the one-line intuition for now: predicting likely text, not looking up true text.

### What is an LLM?
**Student:** This one made things click more precisely — "words in → numbers → function → numbers → word out" with the actual pipeline (464, 3139, 295... → Paris 93%, Lyon 3%, Nice 2%) is the clearest thing so far because I can see the shape of the whole process in one picture. But I'm stuck on where those specific numbers like "464" or "3139" come from — did someone assign every word a number? And it says the function is "billions of numbers it learned by reading text, not rules a human wrote" — learned *how*? Like, did someone sit there and tune billions of numbers by hand? That feels like the actual magic step and it's just asserted, not shown.

**Teacher:** The pipeline diagram doing its job is great to hear. On where the numbers like 464 come from — NOT A FIX — redirected to fundamentals: that's the tokenizer/vocabulary mapping, and it's implementation detail this course deliberately skips; all you need is "words get chopped into pieces and each piece has an ID number," which the very next section (Prediction loop) gives you via the word/token callout. Don't chase the exact ID assignment. On "how did it learn the numbers" — also NOT A FIX, redirected to fundamentals: training/fine-tuning a model from scratch is explicitly out of scope for this entire course (see NEXT_STEPS listing "Fine-tuning" as an optional advanced topic for much later). This course is about *using* an already-trained model over an API, not building one. The one thing to hold onto here is just: it's learned numbers, not hand-written rules — the "how" of learning is a different course.

### The prediction loop
**Student:** This was fun, actually — watching "the cat" get built up word by word with percentages at each step made the idea of "keeps answering what's-next one piece at a time" really concrete, more concrete than the last section honestly. The token vs. word callout is helpful too — I now get that "windowsill" might be two tokens, that's a good, specific example. One small thing: it says the model "reads its own growing text each time," and I understand that in words, but I don't have a picture of it — like an arrow diagram showing "output gets glued back onto input" would've made it stick even more, since right now I'm just trusting the sentence.

**Teacher:** This is the section I'd point to as the model for the rest of the course — a live example plus an immediate jargon payoff (token). Your ask for a visual is fair: FIX NEEDED — in "The prediction loop," add a small diagram (even a simple 3-box flowchart: "predict → append → repeat, until end-of-text") alongside the genloop demo, since right now the mechanism is described in prose only and a total beginner has to take the append-and-resend idea on faith. Everything else here is intentionally left as-is — you don't need more than what's here.

### What is a prompt?
**Student:** This clicked without much friction. The compare block — vague "git undo help" versus the precise one-liner that gets exactly `git reset --soft HEAD~1` — is a great side-by-side because I could actually feel why being specific matters, not just be told it matters. "Prompting is arranging the text so your desired answer becomes the most likely continuation" is a genuinely useful sentence I'll remember. My only question: it introduces "system prompt" and "user message" as two layers of a "conversation," but earlier the Intuition section said the conversation is an "illusion" and stateless — so is a system prompt something that persists automatically, or do I have to keep re-sending it too?

**Teacher:** Glad this landed cleanly, it's meant to be the payoff section. Your question about whether the system prompt persists automatically is a completely reasonable one to have right now — NOT A FIX — redirected to fundamentals: hold it one more section. "Reaching the model" shows the system field riding alongside the messages list, and the callout there says explicitly that you resend the whole history, system prompt included, every single call. That's the mechanical answer to exactly what you're asking. No need to solve it yourself yet — just notice the two "layers" (system vs. user) for now, the persistence mechanics come next.

### Reaching the model
**Student:** The API explanation makes sense — the models are too big for a laptop and the companies don't hand out the files, so you talk to them over the internet instead, got it. The Ollama aside about running smaller open models locally was interesting and I appreciated that it didn't ignore my "wait, can't I run this myself?" question. But then it drops an actual Python code block — `client.messages.create(model=..., max_tokens=512, system=..., messages=[...])` — and I genuinely don't know what half of this syntax means (what's `Anthropic()`, why is there a `.content[0].text`?). The course promised I don't need to code, but this is the first real code I've seen and there's no "don't worry about the syntax" note next to it like there is later in the Build section.

**Teacher:** Good catch, and this is a real inconsistency. FIX NEEDED — in "Reaching the model," add the same kind of reassurance the "Build llm_chat.py" section has (e.g., "you're not writing this — just notice the shape: messages in, one message out; the rest is plumbing your coding assistant will handle") right next to that first code block, since it's the first code example in the whole course and currently lands with zero scaffolding for a non-coder. On the Ollama tangent — NOT A FIX, redirected to fundamentals: it's fine that you found it interesting, but don't go set up Ollama or start comparing open-weight models right now; the callout already tells you why the course sticks to the API path, and that's the fundamental to hold onto here, not a self-hosting side quest.

### The three knobs
**Student:** This was clear and practical — system prompt, temperature, max tokens, three bullets, done. The two predict examples for "temperature ≈ 0" versus "temperature ≈ 0.9" on the same sentence ("the cat sat on the ___") made the abstract idea of "randomness" visibly concrete, since I could see the probability spread actually flatten out. The warning about not using high temperature for a SQL generator ("creative bugs") was a nice, memorable way to end it. No real confusion here — this section did what it was supposed to do.

**Teacher:** Good, no notes — this is the section other parts of the course should look more like. Moving on.

### Picking a model
**Student:** The Haiku-vs-Opus breakdown made sense, and the compare block (sorting 10,000 emails: $40/20min at 99% accuracy vs. $1.50/2min at 98%) is a great concrete number to hang the idea on. But the course's own goal for this whole phase said I'd "feel the speed/quality/cost triangle," and I don't think I actually saw a triangle or any visual — just one list and one comparison example. Also, the tip box admits "you can't eyeball that reliably" and punts measuring to Phase 3 — which I understand, but it left me a little unsatisfied right now, like I still don't know how *I'm* supposed to decide which model to use for my own real task today.

**Teacher:** You're right that the "speed/quality/cost triangle" language is used in the phase goal but never actually visualized in the lesson content itself. FIX NEEDED — in "Picking a model," add a small visual (even just three labeled corners: speed, quality, cost, with Haiku and Opus plotted at opposite ends) so the metaphor promised in the phase goal actually shows up somewhere the student sees. On feeling unsatisfied about not being able to decide today — NOT A FIX, redirected to fundamentals: that discomfort is intentional. The section's whole point is "you only really know by measuring," and the measuring tool is deliberately saved for Phase 3 so it gets full attention instead of a rushed mention here. For this phase, the fundamental to walk away with is just: small models are usually fine, frontier models cost a lot more, and eyeballing isn't reliable — not a definitive answer for your own project yet.

### Build llm_chat.py
**Student:** I liked that this section explicitly says "you won't type it — describe it to your coding assistant," because after seeing that intimidating code block two sections ago, this framing actually calmed me down. The ready-made prompt to paste into Claude Code is genuinely useful and I can see myself using it verbatim. The "read it, don't type it" callout right before the full code listing is exactly what I wished the earlier API section had. My only lingering question: the code prints "input and output token counts" — I know what a token is now from the prediction-loop section, but I don't know what I'm supposed to *do* with that number once I see it (is a big number bad? how many tokens is too many?).

**Teacher:** Good, this is the section that should set the tone for every code block in the course — "describe it, don't type it," reassurance included. Your question about what to do with the token count once you see it — NOT A FIX, redirected to fundamentals: that's intentionally left as a raw observation here. The point of this deliverable is just to *see* the number and feel that longer prompts/replies cost more; turning that into "how many tokens is too many" or actual cost tracking is Phase 6's job (Observability), which builds a whole dashboard around exactly this. For now, just notice the number exists after every call — don't try to build judgment about it yet.

### What you should know
**Student:** The recap bullets are a solid tight summary — I could tell you all six of those in my own words now, which feels like a good sign. On the quiz: question 1 (predict the next word) and question 2 (no memory between calls) both map directly to things I actually read and understood clearly, so those felt fair. Question 3 asking for "temperature" as a one-word answer also felt fair since the knobs section drilled that in with two side-by-side examples. Nothing in the quiz caught me off guard or tested something I didn't actually see taught.

**Teacher:** That's exactly the outcome this section is designed for — no surprises in the quiz because every question traces back to a section that taught it explicitly (prediction-loop → Q1, just-an-api → Q2, knobs → Q3). No fix needed here; this is the recap doing its job as a checkpoint, not introducing new material. If you're solid on all six bullets, you're ready for Phase 2.

---

## Phase 2: Give the LLM your data

### Intuition
**Student:** This clicked for me right away because of the Zentara Logistics trick — the model has literally never heard of this company, so when I ask about its parental leave policy it just doesn't know, but the second I paste one paragraph about "18 weeks of fully paid parental leave" in with my question, it suddenly answers correctly. That's a really convincing demo of what a "hallucination" is and why it happens. What I'm less clear on is the "retriever" — it's described as a "magic box" that "somehow reaches into all 100 documents, pulls out the single right paragraph" — but I have no idea *how* it does that yet, and the diagram just shows a box with a question mark in it. Is that intentional, or am I missing something? I also wonder: what happens if the model can't find a paragraph that fully answers the question — does it hallucinate again, or does it say "I don't know"?

**Teacher:** Good, that's exactly the reaction I want from this section — the Zentara demo is deliberately the whole hook, and if it landed, this section did its job. On the retriever being a black box with a question mark: NOT A FIX — redirected to fundamentals: that's intentional, not a gap. The text says outright "That retriever is the *only* mystery here... The rest of this phase is opening that box" — it's a deliberate cliffhanger, and it gets resolved piece by piece in "Words as points in space" and fully in "The full pipeline." Don't worry about how it works yet; just trust that it's a box that takes a question and a pile of docs and returns the right paragraph — that's the intuition to hold onto going into the next section. On your second question — what happens when the model can't find the right paragraph — NOT A FIX — redirected to fundamentals: that's directly covered later, in "Pitfalls & evaluation," under "Confident hallucination — no 'say you don't know' escape hatch in the prompt." Hold that question, it gets a real answer in a few sections.

### Words as points in space
**Student:** The graph-paper picture is genuinely the clearest explanation of embeddings I could imagine — cat/kitten/dog clustering together, invoice/payment/tax in another corner, and then dropping "lion" onto the map and it lands near the animals. I also finally get *why* a question can match an answer without sharing any words: "how much parental leave do I get?" lands next to "employees get 18 weeks of paid parental leave" because they're about the same *thing*, not because of matching words — that's a really important idea and I hadn't considered it before. My confusion is with the phrase "measure the distance" — is that just literally the ruler-distance between two dots on a 2D graph, like Pythagorean theorem? Because real embeddings apparently have "hundreds of dimensions, not two," and I can't picture what "distance" even means once you're past 3 dimensions. It's also not clear to me whether the vector database is doing something clever/different than "just measuring distance to everything," or if it's really just brute-force checking every point every time.

**Teacher:** The graph-paper analogy is the load-bearing metaphor of this whole phase, so I'm glad it landed cleanly — that was the goal. On "how do you measure distance in hundreds of dimensions" — NOT A FIX — redirected to fundamentals: the section explicitly says "the picture is identical," and that's a deliberate simplification for a total beginner. The actual math (cosine similarity, dot products, etc.) is intentionally out of scope here — you don't need to compute anything by hand, the embedding model and vector DB handle it. Push on the 2D intuition, not the N-dimensional math. That said — your instinct to ask "is there a name for this distance measure" is legitimate, and it exposes a real inconsistency: FIX NEEDED: the "vectors" subtopic never actually introduces the term "cosine similarity," but it later shows up unexplained in the `build` subtopic's assist "asks" list ("why does cosine similarity measure 'similar meaning'?"). Add one line in this subtopic — something like "in practice this distance is usually measured with something called cosine similarity, but the ruler-distance picture is the same idea" — so the term isn't dropped cold later. On the vector DB question — that's actually answered here, just easy to miss: the text says a vector DB "stores millions of these vectors and returns the nearest ones in milliseconds," implying it's optimized, not brute force. NOT A FIX, but worth re-reading that paragraph — the detail is there, you just want more mechanism than the course intends to give (how the fast-search trick works internally is a legitimately advanced topic this course doesn't cover).

### Path 1 · Ingestion
**Student:** This part is refreshingly concrete after all the conceptual stuff — split, embed, store, done once ahead of time, and I like that it's explicitly separated from "query," which happens "every time someone asks." The callout that ingestion is "the slow, one-time part" and you only "re-run it when the documents change" answered a question I was already forming (do you really re-embed all 100 documents every single time?), so that's good. One thing I wanted but didn't get: what format do the 100 HR documents actually start in — are they Word docs, PDFs, plain text files? It just says "split each document into small chunks" without saying what "document" means as a file on disk.

**Teacher:** Good catch on timing your own question against the text — that's exactly the kind of self-check I want. NOT A FIX — redirected to fundamentals: the file-format question is intentionally deferred, not missing. It's answered explicitly two subtopics later in "Build rag.py" — "Convert everything to plain text (use `pdfplumber` or `pypdf` for PDFs)." This subtopic is deliberately keeping the concept clean (split → embed → store) without file-format plumbing mixed in; that plumbing shows up once you're actually building the thing. Don't let it slow you down here.

### Path 2 · Query
**Student:** This is clear and mirrors the ingestion section nicely — embed, search, retrieve, answer — and the worked example (question embeds, nearest chunk is "18 weeks paid," gets pasted in, model answers "citing where it came from") ties it all together well. The callout says "using the same embedding model on both sides is what makes the question and the right paragraph land near each other," but I don't fully understand *why* that matters — what actually goes wrong if I embedded my documents with one embedding model and then embedded questions with a different one? Would it just be less accurate, or completely broken?

**Teacher:** This is a real gap, and a good one to have caught. FIX NEEDED: in the "query" subtopic (or back in the "vectors" callout), add one explanatory sentence for why mixing embedding models breaks retrieval — something like "different embedding models place text in entirely different, incompatible coordinate systems, so a question embedded with Model A and chunks embedded with Model B won't reliably land near each other at all — it's not a small accuracy hit, it can break retrieval outright." Right now the text just asserts the rule ("use the same model") without explaining the failure mode, which is exactly the kind of thing a curious beginner will ask about, as you just did.

### Chunking
**Student:** The bad-split-vs-good-split comparison is the best explanation in the whole phase so far — seeing the answer literally torn in half across two chunks ("…parental leave is one of our newer benefits, introduced in" / "2024. Employees receive 18 weeks…") made the whole problem obvious in a way words alone wouldn't have. The three strategies (fixed-size, recursive, semantic) are explained clearly, and the overlap "safety net" idea makes sense. But I got tripped up by the actual Python code block for the naive chunker — I don't code at all, and this course told me I don't need to, so seeing a `while` loop and `text[start:end]` slicing made me nervous that I was suddenly expected to understand syntax. It's not labeled as optional or "just for reference" the way a later code block is (I noticed the Build section explicitly says "read, don't type" on its code), so I wasn't sure if I was supposed to actually parse this one.

**Teacher:** The compare block doing the heavy lifting here is exactly the design intent, glad it worked. Your code-block observation is a real and specific inconsistency. FIX NEEDED: the code block in "chunking" (labeled "the naive chunker — start here, then improve") should carry the same "(read, don't type)" framing that the `build` subtopic's code block has, so a non-coder isn't left wondering whether they're expected to understand Python syntax. Right now the labeling is inconsistent between the two code blocks in the same phase, and that inconsistency is exactly what caused your hesitation — good catch.

### The full pipeline
**Student:** This section didn't teach me anything new, but it didn't need to — it's just satisfying to see the two paths (prep-once, answer-every-time) combined into one diagram, and I liked the callback: "Remember the retriever from the very start of this phase? It was the embed → search → vector DB part all along." That closed the loop nicely on the question I had way back in the Intuition section. Nothing confusing here, this was a clean synthesis step.

**Teacher:** Good, this subtopic exists purely to consolidate, and it sounds like it did exactly that — closing the loop on your earlier "what's inside the magic box" question is the intended payoff. No notes here.

### Build rag.py
**Student:** I like that this finally shows what the finished thing looks like, and the "describe it to your assistant" prompt is exactly the "you don't need to code" promise the course made — I paste the prompt, my assistant writes rag.py, I run it. But looking at the sample code, I got confused: it imports both `from openai import OpenAI` and `from anthropic import Anthropic`, and uses OpenAI just for `embed()` while using Claude (`claude.messages.create`) to generate the actual answer. Is it normal to mix two different companies' AI products together like that, or is that just a coincidence of this example? Also the model name in the code, `"claude-opus-4-8"`, doesn't match any Claude model name I've seen mentioned in Phase 1 (Haiku/Sonnet/Opus) — is that a real model or a placeholder? And separately, the "asks" list at the bottom includes "why does cosine similarity measure 'similar meaning'?" — but this is the first time I've seen the term "cosine similarity" anywhere in the lessons; it was always just called "distance" before.

**Teacher:** All three of these are worth addressing, and two are real gaps. FIX NEEDED: the code sample mixes an OpenAI embedding model with an Anthropic chat model with zero explanation, which is disorienting for a beginner who doesn't yet know that "embedding models" and "chat models" are different categories of product, often supplied by different vendors, and that mixing providers is completely normal in practice. Add one sentence near the code block clarifying that: e.g., "note this uses two separate model types — an embedding model (from any provider) to turn text into vectors, and a chat model like Claude to write the final answer — mixing vendors here is normal and common." FIX NEEDED: `"claude-opus-4-8"` isn't a real, recognizable model name and will confuse a student who just learned real model names in Phase 1 — swap it for an actual current model name so it doesn't read as a typo or a hallucinated example. On cosine similarity — this is the same gap flagged back in "Words as points in space": FIX NEEDED (same fix, second occurrence): either define "cosine similarity" briefly the first time distance is discussed (in the `vectors` subtopic) so it's not new vocabulary here, or drop the term from this "asks" list and stick with "distance," which is the term the course actually teaches.

### Pitfalls & evaluation
**Student:** The "usual suspects" list is really useful and matches problems I could imagine hitting — especially "right info, wrong chunk" (fix chunking, not the prompt) and "confident hallucination" (no escape hatch), both of which tie back cleanly to earlier sections. But "query rewriting" is mentioned as a fix for "retrieved nothing relevant" and I have no idea what that means — is that something my coding assistant does automatically, or something I'd have to ask for specifically? Also, the tip callout says "Phase 3 turns this into a real eval harness" for checking whether "the gold chunk is in the top-K" — I don't know what "gold chunk" means either, though I can guess from context it means "the correct one."

**Teacher:** Good instinct picking apart jargon that gets dropped without a definition. FIX NEEDED: "query rewriting" appears in the "usual suspects" list with zero explanation — add a short parenthetical, e.g., "query rewriting (rephrasing the question to use the same words your documents use before embedding it)" so it's not a completely opaque term. On "gold chunk" — that one's a smaller nit but same category: FIX NEEDED: briefly define "gold chunk" inline (e.g., "the chunk that actually contains the correct answer") the first time it's used, since "gold" as jargon for "known-correct reference answer" isn't something a total beginner would infer confidently. As for wanting the full eval harness explained right now — NOT A FIX — redirected to fundamentals: the text is explicit that "Phase 3 turns this into a real eval harness," so building and running actual retrieval-precision tests is intentionally out of scope here. In this phase, just take away the *categories* of failure (wrong chunk vs. no chunk vs. ignored chunk vs. hallucination) — the tooling to measure them rigorously is next phase's job.

### What you should know
**Student:** The recap list is a clean summary and matches everything I actually read — nothing new sneaks in. The quiz felt fair too: the RAG one-phrase question, the "similar meaning = embeddings close together" question, and "what should you suspect first when a RAG answer is wrong" (retrieval) are all things the lessons stated directly and repeated multiple times (the "Pitfalls" section even opens with "It's almost always retrieval"), so I didn't feel blindsided by anything. If anything I was expecting a question about chunking strategies given how much emphasis that section got, but I'm not complaining that it wasn't tested.

**Teacher:** Good, that's the bar I want the quiz held to — testing only what was actually taught, repeatedly and explicitly. Your observation that chunking (a section with a compare block, a code sample, a callout, and three named strategies) isn't quiz-tested at all is a fair miss, though not a correctness problem — NOT A FIX in the sense that nothing here is wrong, but worth flagging as a possible enhancement: consider adding a fourth quiz question distinguishing fixed-size/recursive/semantic chunking, since it's one of the most content-dense subtopics in the phase and currently gets no knowledge check at all.

---

## Phase 3: Stop guessing if it works

### Intuition
**Student:** Okay, this landed for me right away — I built `rag.py` in the last phase and honestly all I did was ask it two or three questions and go "yeah, seems right." The comparison block calling that "Blind" versus a test suite that shows "pass rate fell from 92% to 61%" is a great gut-punch, because I immediately see how I'd have shipped that regression without noticing. My one snag is the phrase "you re-run the same 50 saved questions" — saved *where*, and who wrote them? I have zero programming background, so when the callout says "start asking 'what percent of my test cases pass'" I don't yet know what a "test case" physically is — is it a spreadsheet row, a file, code? A little diagram showing "50 questions sitting in a file → run through my app → scorecard" would've made the abstraction click instantly instead of me just trusting the metaphor.

**Teacher:** You're reacting exactly the way I want at this stage — feel the pain of "blind" before I hand you the fix. The "where do the 50 questions come from" question is answered by name in the very next section (the golden dataset), so hold that thought — NOT A FIX — redirected to fundamentals: this section is deliberately just building the emotional case for measurement before introducing any mechanics; don't expect the "how" here. That said, you're right that a non-coder reading "test suite" and "test case" with no prior definition is guessing at the shape of the thing. FIX NEEDED: in the Intuition section, add a one-line plain-language gloss the first time "test suite"/"test case" appears (e.g., "a saved list of questions, kept in a plain file, that you run over and over") so it's not pure metaphor before the golden-dataset section unpacks it properly.

### What an eval is
**Student:** This made the abstract idea concrete — "the answer must contain '30 days'" as a check, and getting back "this version passed 44 of 50" is something I can actually picture running. What tripped me up is the very last line of the section admits it glossed over something: "what does the check actually compare the answer to?" — I appreciate the honesty, but for a second I felt like I'd missed something rather than that it was intentionally deferred. Also, the offline/online callout uses the word "production" without explaining it — I don't know if that means "the live app real customers use" or something more technical.

**Teacher:** Good catch on the self-aware "we glossed over" line — that's on purpose, it's there so you don't feel abandoned, and the golden-dataset section immediately answers it. NOT A FIX — redirected to fundamentals: that deferral is intentional pacing, not a gap; keep reading forward before worrying you missed something. The "production" word, though, you're right to flag — a total beginner has no reason to already know that term. FIX NEEDED: in the "Offline vs online" callout in the what-is-eval section, replace or gloss "production" with something like "the live app real users are actually using" so it doesn't assume prior software vocabulary.

### The golden dataset
**Student:** The CSV example with refund window / shipping / parental leave rows made this really tangible, and the diagram (question + reference answer → my system → actual answer → check → pass/fail → tally) is the clearest visual so far — more of these earlier would help. My confusion: the text says "you never ask the model to grade its own homework," which I read as "never let an LLM judge LLM answers" — but then the very next section is going to introduce "LLM-as-judge," which sounds like exactly that. Is that a contradiction, or is the judge a different model somehow? Separately, I found myself wondering how anyone writes hundreds of these reference answers for a real company with tons of features — is 30–50 really enough for something like Zentara's whole product?

**Teacher:** The "own homework" line and LLM-as-judge look like they clash, but they're not — the very next section spells out that LLM-as-judge means "a *second* model grades the answer," i.e., not the same model checking itself. NOT A FIX — redirected to fundamentals: that resolution is one section away, so keep going rather than assuming a contradiction; I'll trust the ordering here since it's answered immediately. Your scaling question — "is 30-50 really enough for a whole real product" — is a legitimate curiosity but it's outside this phase's job: we're teaching you to build your *first* regression net for the one RAG bot from Phase 2, not how eval scales across a company's whole surface area. NOT A FIX — redirected to fundamentals: focus on writing your own 30-50 well; dataset scaling for a mature product is a later-career concern, not a beginner-phase one.

### Kinds of checks
**Student:** The Saturday-hours example is the best teaching moment in the whole phase — seeing the same question broken by an exact-match check, saved by a contains check, and needing an LLM-judge for the open-ended version made the three categories genuinely distinct in my head, not just three bullet points. The one thing that nagged me: the warning callout says the judge "tends to favour longer, more confident-sounding answers" — that's an unsettling thing to just drop and move on from. How would I, someone with no ML background, ever notice or fix that in my own eval? It feels like a real problem you've told me about but not equipped me to deal with.

**Teacher:** I like that this section landed the way I intended — the same question through three lenses is meant to make the categories snap into place, and it sounds like it worked. Your question about detecting/fixing judge bias is a real and fair curiosity, but it's genuinely advanced territory — mitigating LLM-judge bias (calibration, multiple judges, position-swapping, etc.) is a topic for well past this course's beginner scope. NOT A FIX — redirected to fundamentals: for this phase, the goal is just knowing the tradeoff exists so you reach for exact/contains first and treat the judge as a last resort — not to engineer around its biases yet. That's intentionally left alone here.

### Build the eval
**Student:** I liked that this section explicitly says "your assistant builds it, you run it" — that's reassuring since I can't write YAML or Python myself. But then the code block just shows me a `promptfooconfig.yaml` file with no explanation of what YAML even is — is it code? A config file? Something else? Inside that same code block there's a line `providers: - file://rag_provider.py # a thin wrapper around your rag.py answer()` and I don't know what "provider" means here (I don't remember it being defined earlier in this phase) or what a "wrapper" is. The diagram at the top of this section helps me see the overall flow, but the actual file contents below it feel like they assume I already know how to read code.

**Teacher:** The "assistant builds it, you run it" framing is exactly the promise of this course, so I'm glad that landed — good. Your YAML and "wrapper" confusion are legitimate content gaps, though. FIX NEEDED: in the Build the eval section, add a one-sentence plain-language intro before the code block explaining that YAML is just a structured text format (like a list with indentation, no coding needed to read it) — right now it's shown with zero framing to an audience that's never seen it. FIX NEEDED: same section, gloss "provider" (a model + prompt setup you're comparing) and "wrapper" (a small script that connects your existing rag.py to promptfoo's expected format) inline the first time they appear in the code comment — the term "provider" is defined in the phase's opening overview text but never re-anchored inside this actual lesson block, so a reader going subtopic-by-subtopic can hit it cold.

### What you should know
**Student:** The five recap bullets map cleanly onto everything I actually read — nothing here felt new or surprising, which is a relief after a phase with this many new terms. For the quiz: question 1 (why isn't eyeballing enough) and question 2 (which check fits open-ended answers) both felt fair and directly traceable to things I was explicitly taught. Question 3, the fill-in-the-blank for "offline," felt slightly different in style from the multiple-choice ones, but the content itself — offline vs. online — was clearly explained in its own callout earlier, so I don't think it's an unfair test, just a different question format than what came before it.

**Teacher:** Good, that's the outcome I want — a recap and quiz that feel like confirmation, not a pop quiz on things never taught. Nothing here needs correcting: NOT A FIX — redirected to fundamentals: the format mismatch you noticed (fill-in-the-blank vs. multiple choice) is a minor stylistic choice, not a content gap, since the underlying concept was taught clearly in the what-is-eval section's callout. Everything you flagged here confirms the recap and quiz are doing their job — I'm not logging any changes for this subtopic.

---

## Phase 4: Let the LLM use tools

### Intuition
**Student:** Okay, this finally makes sense of something that bugged me the whole course: why would I ever need this if the model can only "talk"? The line "Ask a plain model 8,347 × 219 and it'll hand you a confident, wrong number" is a great concrete hook — I actually believe that now. The big reveal — "the model itself never touches the calculator" and it "has no hands, no internet connection, no ability to run code" — landed clearly, and the diagram walking through a=8347, b=219, op=× → "the real multiplication happens elsewhere" → the LLM reading back 1,828,993 made it click that the model only ever produces text. But two things threw me: first, the diagram says the multiplication "happens elsewhere" without saying where "elsewhere" is yet — I was left hanging for a beat wondering who's actually doing the math. Second, and this one worried me more: the closing callout says "Something else has to actually run it and report back — code you write, called the harness." Wait — code *I* write? The course told me up front I don't need to know how to code! That sentence made me nervous I'd wandered into the wrong course.

**Teacher:** FIX NEEDED: in the "intuition" subtopic, the phrase "code you write, called the harness" (final callout, kind="key") should be softened to something like "code — yours or your assistant's — called the harness" or add a parenthetical like "(your coding assistant will write this for you, as you'll see in Build the agent)". As written, it directly contradicts the course's opening promise that "you don't need to know how to code," and a total beginner reading it cold has no way to know that tension resolves two sections later. NOT A FIX — redirected to fundamentals: not knowing where "elsewhere" happens yet is intentional pacing, not a gap. The very next subtopic is literally titled "The harness" and exists to name and explain that "elsewhere." Don't chase that thread here.

### The harness
**Student:** This is the section where the model really clicked for me. "The harness is just your code" plus "the LLM never sees your real function. It only ever sees a description" finally answered my leftover question from before. The diagram with the six numbered arrows was genuinely the clearest visual in the phase so far — I could trace it step by step. The list of "what counts as a tool" (plain function, API call, database query, RAG, sending a real email) was a nice concrete range. But I have a lingering question the section never answers: where does this harness code actually *live and run*? Is it on my own laptop? A server I have to set up? Somewhere in the cloud next to the LLM? It says "your code" but never says where "your" computer is relative to the LLM's.

**Teacher:** FIX NEEDED: in "the-harness" subtopic, add one clarifying sentence — ideally right after "The harness is just your code" — stating explicitly that the harness runs wherever *you* run your program (your laptop, your server), completely separate from the LLM provider's infrastructure. This directly reinforces the Phase 1 "LLM = remote API" mental model instead of leaving it ambiguous, and it's a one-line fix with high payoff for a beginner's mental map.

### The agent loop
**Student:** The interactive walkthrough (question → tool call → tool result → final answer, all on the calculator example) really tied the harness diagram together into a movie instead of a static picture — that was the best moment of the phase for me. My confusion: the steps list says the LLM replies with "either a tool call... or a final answer — nothing else is possible," phrased as if it's always a single tool call. But then in the Build section a few pages later, the code has a variable called `calls` (plural), implying the model can ask for several tools in the same reply. Which is it — one tool call per turn, or can it be several?

**Teacher:** You're right, and I hadn't caught that myself. FIX NEEDED: "agent-loop" subtopic — the steps list says the LLM replies with "either a tool call (name + arguments) or a final answer — nothing else is possible," phrased as if it's always a single tool call. The Build section's code shows multiple tool calls can come back in one reply. Add a short clause to the agent-loop steps, e.g. "...either one or more tool calls, or a final answer" so the two sections don't quietly disagree. NOT A FIX — redirected to fundamentals: wondering "why cap it at exactly 10" is a real question but it's a tuning detail, not a beginner fundamental.

### Describing your tools
**Student:** Short section, but it landed immediately — the vague "search — searches stuff" versus the clear description is such an obvious before/after. Nothing here confused me, though the "formula" for a good description (what it does, when to use it, what the arguments mean) is only stated inside the small note text under the example rather than called out as its own rule.

**Teacher:** FIX NEEDED: "tool-descriptions" subtopic — pull the three-part formula out of the comparison note and state it once as its own standalone sentence or short callout, so it reads as a reusable rule rather than something a reader has to notice by reverse-engineering the example.

### Build the agent
**Student:** I like that the assistant prompt explicitly tells the AI to build the harness "without ever letting the model run code itself." But the code sample is Anthropic-specific, and Phase 1 told me I could pick *either* Anthropic or OpenAI. If I'd been using OpenAI this whole time, this "read, don't type" code doesn't match my SDK at all, and there's no note acknowledging that.

**Teacher:** NOT A FIX — redirected to fundamentals: the code block is explicitly labeled "read, don't type" — it's illustrative of the loop's shape, not a literal snippet. If you're on OpenAI, your assistant will produce the equivalent. FIX NEEDED: "build" subtopic — add one short line near the code sample acknowledging the SDK choice, e.g. "(shown in Anthropic's SDK — if you're using OpenAI, ask your assistant for the equivalent; the shape is identical)."

### What you should know
**Student:** The recap bullets read like a clean, accurate summary — "an agent is an LLM that can ask for tools and decide what to do next — but it never runs them itself" is exactly the corrected mental model I now have. All three quiz questions felt completely fair.

**Teacher:** Good — no fixes needed here; the quiz stays tightly scoped to material stated explicitly and repeatedly.

---

## Phase 5: Talk to your database

### Intuition
**Student:** Okay, this one makes sense right away. My confusion: the compare block shows raw SQL (`SELECT COUNT(*) FROM customers WHERE month = 'May'`) with nobody telling me what SELECT/COUNT/WHERE mean. I also don't know what "BI tools" means in the callout.

**Teacher:** FIX NEEDED: intuition — the compare block drops raw SQL with zero decoding. Add a short parenthetical translating it into English. FIX NEEDED: intuition — spell out "BI (business intelligence)" the first time it's used. NOT A FIX — redirected to fundamentals: "how does data get into a database in the first place" is a data-engineering question outside this course.

### How it works
**Student:** I follow the loop, and the fail-loop in the diagram is satisfying. My confusion: the diagram box says "Prompt + schema + examples" but the paragraph above never mentions "examples." Also "schema" appears in the diagram before it's ever defined in words.

**Teacher:** FIX NEEDED: how-it-works — the diagram introduces "examples" with no explanation anywhere in the prose; add one sentence about few-shot question→SQL pairs. FIX NEEDED: how-it-works — "schema" appears unlabeled before its formal definition next subtopic; add "(this is called the schema)" inline.

### The three hard parts
**Student:** "Schema grounding" is defined here, which retroactively fixes my earlier confusion. But nothing shows me what a CREATE TABLE line actually looks like. Also, if LIMIT cuts off a real answer that needed more rows, would I know?

**Teacher:** FIX NEEDED: hard-parts — add a 2-3 line concrete CREATE TABLE example. FIX NEEDED: hard-parts — the safety callout should add a caveat that LIMIT can silently truncate a row-dump that legitimately needed more rows.

### The repair loop
**Student:** The "no such table: user" example made this click immediately. My open question: what happens once the retry cap is hit and it still hasn't worked?

**Teacher:** FIX NEEDED: repair — add one sentence describing what happens after the retry cap is exhausted (e.g., surface the database error to the user rather than retrying forever).

### Build it
**Student:** The intro just says grab "Chinook" without explaining what it is. Also the code does `con.execute(sql + " LIMIT 100")` — string-pasting onto whatever SQL the model wrote — and if the repair attempt also fails, there's no second try/except.

**Teacher:** FIX NEEDED: build — add a short parenthetical explaining what Chinook is (a small free sample music-store database). NOT A FIX — redirected to fundamentals: hardening every malformed-query edge case is beyond a first build. FIX NEEDED: build — the final `con.execute(fixed + ...)` line has no try/except, silently contradicting the "cap it at one or two retries" framing; wrap it or note the second-failure behavior explicitly.

### What you should know
**Student:** The recap and quiz both felt fair and matched what was taught.

**Teacher:** Agreed — no fix needed on the quiz itself; the gaps the student surfaced are upstream content issues already flagged above.

---

## Phase 6: See what's happening

### Intuition
**Student:** This makes sense on a gut level. Two things throw me: "scrub its timeline" isn't a word I associate with debugging, and "the RAG step" is mentioned as if I should already know what RAG is.

**Teacher:** FIX NEEDED: replace or gloss "scrub its timeline" with plainer language. FIX NEEDED: "the RAG step" assumes recall of a term from several phases back — add a 3-4 word parenthetical.

### What a trace shows
**Student:** The worked example (span 1/2/3, "1.37s end to end, $0.006") is genuinely the most useful thing so far. How did they arrive at "$0.006"?

**Teacher:** NOT A FIX — redirected to fundamentals: the mechanics of computing $/request from token counts were taught in Phase 1; this phase assumes that and just shows the tool computing it automatically for you.

### From seeing to saving
**Student:** Prompt caching makes sense. But "p95 latency" completely lost me — it's dropped in parentheses next to "worst-case" with zero definition.

**Teacher:** FIX NEEDED: in "seeing-to-saving," add a short clause defining p95 (the number 95% of requests beat — your bad-day latency, not the typical case).

### Add tracing
**Student:** The "read, don't type" code helped. My one real question: do I need to sign up for a Langfuse account and get an API key before any of this works?

**Teacher:** FIX NEEDED: in the "build" subtopic, add a line noting Langfuse requires a free account and API key before the code will actually run — real onboarding gap.

### What you should know
**Student:** Recap and quiz both felt fair; nothing surprising.

**Teacher:** Agreed, no fix needed on the quiz. Once the p95 fix lands, the quiz doesn't need a new question on it.

---

## Phase 7: Keep the agent in its lane

### Intuition
**Student:** "Jailbreak" is used before it's ever defined. "Prompt injection" is used in the closing callout with zero definition anywhere.

**Teacher:** FIX NEEDED: define "jailbreak" the first time it's used. FIX NEEDED (bigger): "prompt injection" is quiz-tested later but never formally defined anywhere in this phase's body text — add a clear definition in Intuition.

### The three layers
**Student:** The two worked examples (CEO address rejected instantly; 45-day-vs-30-day hallucination caught by groundedness) are the best explanation of hallucination-catching so far. Where does "the retrieved context" for groundedness actually come from? And Phase 5 retried a bad SQL query — here a bad answer just gets rejected outright. Is fail-fast always better?

**Teacher:** FIX NEEDED: state outright that the groundedness guard depends on having retrieved context (i.e., a RAG/search step). FIX NEEDED: distinguish mechanical errors (safe to retry, Phase 5) from trust failures (fail-fast, this phase) — add a sentence reconciling the two.

### Defense in depth
**Student:** This mostly restates the previous section. Doesn't running three separate checks triple the latency/cost of every response, right after Phase 6 was all about squeezing cost down?

**Teacher:** FIX NEEDED: give this subtopic its own distinct example instead of re-running the same two from "three-layers." FIX NEEDED: acknowledge the cost/latency tension with Phase 6 explicitly — one sentence reconciling "yes, this adds calls, route cheap checks to a small model."

### Build the guards
**Student:** "Pydantic" and "SSNs" fly by unexplained in the code. Also, does groundedness only apply to the RAG path, not calculator/search?

**Teacher:** NOT A FIX — redirected to fundamentals: "read, don't type" plus the course's up-front framing already covers this jargon. NOT A FIX — redirected to fundamentals: multi-tool guard coverage is an implementation nuance, not a beginner fundamental.

### What you should know
**Student:** Quiz question 2 asks for "prompt injection" but this phase never actually explained what it is — even the assist block outsources that definition to an external question.

**Teacher:** This is the clearest, most actionable finding in the whole audit. FIX NEEDED: define "prompt injection" clearly in Intuition (same fix already flagged there) so the quiz is actually testing taught material, not vocabulary outsourced elsewhere.

---

## Phase 8: Agents that remember

### Intuition
**Student:** The compare block made it click that the *system*, not the model, does the remembering. But "session" is used ("new session, next day") without ever being defined.

**Teacher:** FIX NEEDED: add a one-line parenthetical defining "session" the first time it appears. NOT A FIX — redirected to fundamentals: where the "summary of the last session" comes from is answered in the very next subtopic — don't chase it here.

### Two tiers
**Student:** The assembled-system-prompt code block is the clearest thing in the whole phase. But the diagram has a "Past summaries" node feeding into the prompt, while the paragraph above only talks about saving "facts" — summaries as a separate long-term thing are never mentioned in prose.

**Teacher:** FIX NEEDED: add a bullet explicitly stating that a saved summary of each session is also part of long-term memory — right now the diagram/code introduce it before the prose catches up. NOT A FIX — redirected to fundamentals: choosing a database vs. a vector store for storage is an implementation decision, not a memory-concept question.

### When chats get long
**Student:** This section gives zero concrete example of compaction itself — I understand the concept in theory but can't picture what it actually does to a message list.

**Teacher:** FIX NEEDED: add a small before/after example of compaction (e.g., 30 raw messages collapsing into one summary sentence plus the last few turns), matching the teaching quality of "Two tiers."

### Build memory
**Student:** The code uses both `session_id` and `user_id` — how does the system know which `user_id` I am across sessions? Is that a login I have to build myself?

**Teacher:** NOT A FIX — redirected to fundamentals: user identity across sessions is an application/auth detail, completely separate from the memory concept this phase teaches.

### What you should know
**Student:** The fill-in-the-blank "compaction" question felt harder to nail than the others — I think because that section had no example or diagram to anchor the word to.

**Teacher:** FIX NEEDED: confirms "When chats get long" needs the concrete example flagged above — once it has one, the quiz question will test something the student actually saw demonstrated.

---

## Phase 9: Standardize your tools

### Intuition
**Student:** The three-times-rewrite pain point landed. But "write it once as a small server" — what is a "server" here? And "any app could plug in" — plug in how, exactly?

**Teacher:** FIX NEEDED: define "server" in plain language the first time it's used (e.g., "a small program that sits and waits for requests"). FIX NEEDED: add a sentence clarifying what "plugging in" mechanically means.

### How MCP works
**Student:** Tools, resources, prompts — I only really understand "tools." What would a "resource" or a "prompt" actually be? The diagram shows only generic "servers," not the three-part split from the text.

**Teacher:** FIX NEEDED: add a concrete one-line example for "resource" and "prompt" each. FIX NEEDED: the diagram doesn't visually reinforce the tools/resources/prompts distinction — add an annotation or caption.

### Build an MCP server
**Student:** `@mcp.tool()` is unexplained syntax even in "read, don't type" mode. Also, this is the first time Claude Desktop is mentioned as an actual app, and "config" is never explained.

**Teacher:** FIX NEEDED: add one plain sentence explaining what `@mcp.tool()` conceptually does, without requiring Python knowledge. FIX NEEDED: add a one-line aside introducing Claude Desktop and what a "config" file is. NOT A FIX — redirected to fundamentals: whether MCP tools can only ever be read-only is a guardrails/tool-design question (Phase 7's territory), not MCP itself.

### What you should know
**Student:** The quiz never actually tests whether I understood the difference between tools, resources, and prompts — even though that's a recap bullet.

**Teacher:** FIX NEEDED: add a quiz question testing tools vs. resources vs. prompts, so the quiz validates a concept the recap claims is important.

---

## Phase 10: Test the whole loop

### Intuition
**Student:** The orders example (agent guessed "412" instead of querying) is a little unsettling but clear. How do I actually *see* which tools an agent called? Also "path," "loop," and "trajectory" are all used for the same idea without settling on one term.

**Teacher:** NOT A FIX — redirected to fundamentals: "Build the suite" shows exactly that, with a real test case — this section is concept-only by design. FIX NEEDED: pick one term ("trajectory") early and stick with it, or explicitly announce the switch.

### What a test case looks like
**Student:** "Refusal rate" describes two opposite failures with the same metric name and no example of either. "Sane arguments" — sane compared to what?

**Teacher:** FIX NEEDED: add a concrete example under "Refusal rate" illustrating both directions of failure. FIX NEEDED: ground "sane arguments" with a parenthetical example.

### Put it in CI
**Student:** I don't know what "the build" is or what "fails" means in practice — does my app stop working?

**Teacher:** FIX NEEDED: add one sentence translating CI for non-coders — a robot runs your test suite automatically and blocks bad changes.

### Build the suite
**Student:** "p95 latency" appears in the code comment while the earlier section just said "cost and latency" — is that the same thing with new jargon?

**Teacher:** FIX NEEDED: either define p95 once in plain language or use the same phrasing in both places so it doesn't look like a new, unexplained metric snuck in. FIX NEEDED (small): add "(the SQL tool from Phase 5)" next to `text_to_sql` in the code comment.

### What you should know
**Student:** The fill-in-the-blank wanting exactly "trajectory" made me nervous given the earlier path/loop/trajectory inconsistency.

**Teacher:** Already logged under Intuition — once "trajectory" is standardized from its first appearance, this concern resolves on its own.

---

## Phase 11: From one agent to a team

### Intuition
**Student:** The compare block made the overloaded-generalist-vs-team idea concrete. But I don't understand *mechanically* how agents "hand work to each other" — is one agent calling another like a function, or messaging?

**Teacher:** FIX NEEDED: add one clarifying sentence on the mechanics of "handing off" (one agent calling another as a tool/subroutine, or passing a message/result forward). NOT A FIX — redirected to fundamentals: "context window" was already defined in an earlier phase; this phase doesn't need to re-teach it.

### The patterns
**Student:** The intro says Anthropic's guide "names six patterns," and I only count five bullets. The diagram uses dashed vs. solid arrows with no legend.

**Teacher:** FIX NEEDED: either add the missing sixth pattern (autonomous agents) or change the intro text to say "five" — factual mismatch. FIX NEEDED: add a legend/caption explaining solid vs. dashed arrows.

### The honest caveat
**Student:** Where does the "80%" number actually come from — a real study, or a rule of thumb?

**Teacher:** NOT A FIX — redirected to fundamentals: it's a practitioner heuristic, not a scientific citation, and the course states it as such intentionally — don't get hung up on sourcing the exact percentage.

### Build a small team
**Student:** "Pick LangGraph or Strands" but never says how to actually choose. Also references "your Phase 4 agent" with no reminder of what that was.

**Teacher:** NOT A FIX — redirected to fundamentals: not picking a framework for you is deliberate — the assist block itself suggests asking your coding assistant. FIX NEEDED: add a short parenthetical reminding what the Phase 4 agent was.

### What you should know
**Student:** Recap and quiz both felt fair, nothing surprising.

**Teacher:** Good — no fix needed; confirms the recap/quiz are correctly scoped.

---

## Phase 12: The runtime around the model

### Intuition
**Student:** The Phase 4 callback landed. But "streaming," "permissions," and "session persistence" are thrown out in the compare block with zero gloss — first time any of those words appear in the whole course. Is "harness" now just a synonym for "everything," including the loop itself?

**Teacher:** FIX NEEDED: add a sentence clarifying the Phase 4 "loop" is one component *inside* the broader harness, not a replaced term. FIX NEEDED: gloss "streaming," "permissions," "session persistence" inline in the compare block, or move the compare block after the term list. FIX NEEDED: tie "session state" explicitly back to Phase 8's short-term memory.

### What a harness does
**Student:** "Retries," "streaming," and "permissions" don't get a "(your Phase X work)" tag like the others — was I supposed to build these somewhere and missed it? The diagram is a flat cluster with no arrows showing sequence.

**Teacher:** NOT A FIX — redirected to fundamentals: those three genuinely were never built hands-on earlier — that's intentional, this is the reflective capstone. FIX NEEDED: add directional arrows or a caption to the diagram showing these fire at different points in one request, not independently in parallel.

### Build vs buy
**Student:** This is the thinnest section in the course — no diagram, no code, no compare block — and it doesn't give me a concrete rule for when to pick a framework vs. keep my own loop, even though the phase goal promised "clarity."

**Teacher:** NOT A FIX — redirected to fundamentals: the brevity itself is intentional, this is reflective capstone content. FIX NEEDED: add a short bullet list of concrete signals for each direction (framework vs. hand-rolled) so the promised "clarity" outcome is actually delivered.

### Compare & extend
**Student:** I'm asked to add streaming or hooks to my loop, but neither was ever demonstrated in code anywhere in the course. I have no "what good output looks like" reference to sanity-check against, unlike Phase 4's build step.

**Teacher:** FIX NEEDED: add at least one short reference code snippet (minimal streaming loop or before/after-tool hook) so students have something to compare their assistant's output against. FIX NEEDED: add a small sample matrix (2-3 filled-in rows) so students know what a correctly-structured `harness.md` comparison looks like.

### What you should know
**Student:** The quiz never touches any of the seven individual harness components (hooks, permissions, session state, etc.) even though those terms were introduced for the first time in this phase.

**Teacher:** NOT A FIX — redirected to fundamentals: an easy, big-picture-confirming quiz is appropriate for a capstone. FIX NEEDED: add one question matching a harness component to its one-line description, so those terms get at least one moment of retrieval.
