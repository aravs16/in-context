---
id: how-to-break-into-genai
title: How to break into GenAI
category: Thoughts
date: 2026-05-26
readTime: 9 min
excerpt: I get asked this every week. The question has two distinct problems hidden inside it — learning the work and finding the job — and they have to be solved in parallel. Here's the version I keep sending people.
---

I get asked this almost every week. Sometimes it's an SA at a customer wondering whether to pivot. Sometimes it's an engineer six years into a backend career who's quietly worried about what their job looks like in three. Sometimes it's a friend texting me at 11pm. The question is always the same shape: _how do I get into this?_

Most people are hoping for a list of courses. _Take these and you're in._ It doesn't work that way.

The question actually has two problems hidden inside it — learning the technology, and finding the job — and they have to be worked on together, not in sequence. Most of the people I see stay stuck did the courses and stopped there. The learning happened. The career didn't.

This is the version I send people who actually want to do this.

## Pick a target first

Before anything else, pick a role you'd want to be in twelve to eighteen months from now. Not "something in AI." A specific kind of work. _Solutions architect at a cloud provider. Agent engineer at a small startup. Applied scientist at an AI lab. Platform engineer at a company running AI at scale._

The reason this matters: GenAI isn't a job. The skills that get you hired as an SA are different from the skills that get you hired as an applied scientist, which are different from the skills that get you hired as an agent engineer. Trying to learn "GenAI" without a target is how you spend six months reading and end up with nothing concrete to show.

People resist this step because picking feels like premature commitment. It isn't. You can change targets later. You can't start a real plan without one.

Once you have a target, look at five actual job descriptions for it. Read the LinkedIn profiles of people who currently do it. The gap between you and them is usually smaller than you fear, and it's almost always concentrated in two or three areas, not spread thin across forty.

Now you have something a plan can hang off.

## The seven roles, briefly

So you know what's on the menu before you pick:

- **Solutions Architect.** Customer-facing system design, mostly at clouds and consulting firms. Rewards clarity of thought and depth in a handful of deployment patterns.
- **GenAI / Agent Engineer.** Hands-on building, mostly at startups and product teams. Software engineering fundamentals matter more than ML credentials.
- **Applied Scientist.** Experiments and fine-tuning, at the labs. Highest bar, usually wants either a PhD or a serious public portfolio.
- **Platform Engineer.** The infrastructure layer at companies running AI at scale. A distributed-systems job with an AI domain on top.
- **AI Product Manager.** The bridge role. Hard to break into without prior PM experience.
- **Safety / Evals Engineer.** Defining what "safe enough to ship" means. Growing fast in regulated industries and at the labs.
- **Cloud + GenAI hybrid.** The role nobody writes a clean title for. Bridging an enterprise cloud and the AI stack.

Pick one. The rest of this splits into the two things you actually have to do.

---

## Part one — Learning the work

I'll be opinionated about the order. Three tiers, in this sequence — foundations, then a layer above for production-facing roles, then a specialization for whichever target you picked.

```
  ╔══════════════════════════════════════════════╗
  ║  FOUNDATIONS  ·  ~4 weeks                    ║
  ║                                              ║
  ║  transformers · llm behavior · prompts       ║
  ║  retrieval · evaluation                      ║
  ║                                              ║
  ║  every role needs these                      ║
  ╚══════════════════════════════════════════════╝
                       │
                       ▼
  ╔══════════════════════════════════════════════╗
  ║  INTERMEDIATE  ·  ~3 weeks                   ║
  ║                                              ║
  ║  agents · production · narrow safety         ║
  ║                                              ║
  ║  most production-facing roles                ║
  ╚══════════════════════════════════════════════╝
                       │
                       ▼
  ╔══════════════════════════════════════════════╗
  ║  SPECIALIZATION  ·  ~4 weeks                 ║
  ║                                              ║
  ║  one of: SA · engineer · scientist · PM      ║
  ║          platform · safety · cloud hybrid    ║
  ║                                              ║
  ║  opinionated for your target role            ║
  ╚══════════════════════════════════════════════╝
```

The five foundations: **how transformers work, how LLMs behave in practice, prompt engineering, retrieval, and evaluation.**

A note on the first one, because I argued myself out of it once and the data convinced me back in. Transformer fundamentals do come up in technical screens — not as a derivation exercise but as understanding. You'll be asked why context length matters, how tokenization works, why models hallucinate, what the difference is between encoder-only and decoder-only models. None of that requires you to draw attention mathematically. All of it requires you to have the mental model. Get it.

The mistake people make on each foundation is the same: they treat it as a topic to study rather than a topic to build with. You don't really understand transformers until you've poked at tokenizers on hard inputs and watched the same prompt vary across temperatures. You don't really understand prompt engineering until you've iterated on the same prompt twenty times against ten examples. You don't really understand retrieval until you've watched your own RAG system pull the wrong chunk and worked out why.

So the rule: for each foundation, find one resource you trust — the field has converged enough that you'll know the canonical names within a day of looking — spend a few days on it, then build something small that uses what you learned. The building is the foundation. The reading is the scaffolding.

The most important of the five is the one most people skip: **evaluation.** How do you actually know if your AI system is any good? Hand-curated test sets. LLM-as-judge, with its caveats. Online versus offline. What "good" even means for an open-ended task. If you can speak fluently about how you'd evaluate a specific system for a specific failure mode, you separate yourself from most candidates immediately. Most people can describe a transformer at a high level. Very few can design a useful eval. The second is what hiring managers reach for to decide if you've actually built things.

After the foundations come three intermediate areas: **agents, production concerns, and the boring kind of safety** — prompt injection, output filtering, PII handling, distinct from existential-risk safety. Engineers, architects, and platform people need all three. PMs and pure researchers can skim.

The agent section is the most fun and the most informative. Build one from scratch, no framework. Three tools, a loop, JSON parsing, error handling. About two hundred lines. You'll learn more from those two hundred lines than from a week of reading about agents.

Then your specialization, which depends on your target. Architects need a cloud platform and reference architectures they've written themselves. Engineers need shipped products and framework fluency without framework dependency. Applied scientists need to reproduce papers and design proper experiments. Platform engineers need distributed-systems depth that has nothing to do with AI specifically. PMs need PRDs they can show, written for real AI features.

Don't go deep on specialization until the foundations are solid. The order isn't a suggestion. The specialization collapses without the foundations under it.

At part-time pace, a reasonable total budget is about three months. If you can't see meaningful progress in three months, the plan is wrong and needs to be redone, not extended.

---

## Part two — Finding the job

This is the part most people start too late. The application track runs in parallel with the second half of the learning track, not after it. Talking to people in the role while you're still building is what makes the building targeted. Reading actual job descriptions while you still have time to close gaps is what makes the eventual application meaningful.

```
   ── month 1 ──── month 2 ──── month 3 ──── month 4+ ──▶

   learning:    ███████████████████████░░░░░░░
   applying:                  ██████████████████████
                              ▲
                              start the applying track
                              here — in parallel with
                              learning, not after it
```

A few things I've watched repeatedly across hiring loops in this space.

**Your portfolio matters more than your résumé.** A CV bullet that says _"experienced with LLMs"_ tells a hiring manager nothing. A GitHub project they can run, with a clean README and a write-up explaining the trade-offs, tells them what they need to know in five minutes. Recruiters in this space have started asking for GitHub links before they read anything else.

**Three shipped things beats five half-finished ones.** I see this mistake constantly. Three projects, each polished, each deployed somewhere a stranger can actually use, each with a written explanation of what you tried and what failed. That's the bar. Don't pad. Don't aim for one ambitious masterpiece.

Two specific moves that put a portfolio above the median:

- A `DECISIONS.md` file in each repo explaining _why_ you picked what you picked. Why ChromaDB and not Pinecone. Why the smaller model and not the frontier one. Why a 1,000-token chunk and not 500. Hiring managers want to see your reasoning, not just your code. The decisions doc is the part that proves you have it.
- A two-minute screen recording walking through the project, showing it running, and explaining one specific failure you hit and how you debugged it. This alone is something almost nobody does. The ones who do, stand out.

**The write-up is more important than the code.** A senior engineer assessing your portfolio will spend longer reading your blog post about why you chose retrieval over fine-tuning than reading your retrieval code. The write-up is the part that proves you understand what you built. It's also the part the hiring manager forwards to their team.

**Eval literacy is the biggest signal.** I keep coming back to this because it keeps being true. If you can talk concretely about how you'd evaluate a real AI system — what metrics, what test set, what failure modes you'd watch for — you separate yourself from candidates who have only studied.

**Stop being a model tinkerer.** A fine-tuned Llama in a Streamlit app, a Titanic classifier, a basic sentiment analyzer on IMDB — every junior portfolio has these. People reviewing portfolios have seen them thousands of times. What stands out: shipped agents, retrieval over real corpora, AI features inside existing products, anything where the data was messy and the failure modes had to be actually handled.

**Apply narrow, not wide.** Pick five to ten target companies. Not fifty. For each, find the hiring manager on LinkedIn. Read their last six months of posts. Send a short, specific message that shows you've understood what their team is actually doing. _"I built this thing. I read your post on that thing. I'd love twenty minutes to ask about how you think about the other thing."_ Most senior people will say yes if the ask is specific and brief. One thirty-minute conversation is worth more than thirty cold applications.

**What the interview actually looks like.** Whiteboard algorithm questions are largely gone from AI-specific roles. They've been replaced by scenario-based questions and live work.

For engineering roles, expect: _how would you chunk documents for this corpus, how would you evaluate this agent, how would you handle prompt injection in this product, walk me through a system you built and what you'd change._

For architect roles, expect production system design: _design a RAG pipeline that handles ten million documents with sub-two-second latency, architect a guardrails layer for an enterprise customer, design an LLMOps pipeline with eval-gated deployments._ The bar is functional requirements plus non-functional requirements (scale, latency, cost, availability) plus data flows that show you understand where the work actually happens.

Both kinds of roles have started using live AI-native building sessions — you get a problem and ninety minutes and any tooling you want, and the interviewer watches how you work. The people who do well are the ones who pick a small target and ship it, not the ones who design the most ambitious thing in the first ten minutes.

Biggest interview mistakes I see, in order:

1. Memorizing transformer math when the interviewer wants to know how you'd evaluate a customer support agent.
2. Treating framework knowledge as the point. LangChain and LlamaIndex are tools. The interviewer cares whether you can build without them.
3. Giving generic answers — _"I would do RAG"_ — when the win is in specifics. Chunking strategy, embedding choice, the eval you ran, the time you tried something and it failed and what you learned.

---

## The thing nobody tells you

The biggest gap between people who get into this and people who don't is not knowledge. It's that the first group started shipping anything, however small, while the second group was still reading.

The space is moving fast enough that the person who has built three agents this year — even badly — has a more accurate picture of where the frontier actually is than the person who has read fifty papers. Models change. Frameworks change. Best practices change every six months. The only durable thing is the muscle of shipping into this medium — the calibration you build by trying, watching it fail, and trying again.

That muscle takes about three months to start and a lifetime to keep current. The sooner you start, the smaller the gap stays.

> Pick a target. Find your specific gap. Ship three things that close it. Write about what happened. Start talking to people in the role while you're still building. The rest is iteration.
