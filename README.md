# Nephro Advisor — Kidney Specialist Expert System

A modern, single-page **expert system** for kidney-related (nephrology) queries.
It demonstrates classic **rule-based / forward-chaining inference** (the kind of
reasoning you would write in Prolog or CLIPS) implemented in plain JavaScript,
wrapped in a polished React UI.

> ⚕️ **Educational demo only.** This is not a medical device and must not be used
> for diagnosis. Always consult a qualified clinician.

## What it does

1. The user answers a short, structured questionnaire (risk factors, symptoms,
   optional lab values such as eGFR / ACR).
2. Answers become **facts** in working memory.
3. A dependency-free **inference engine** forward-chains over a nephrology
   **knowledge base** of rules, asserting derived facts (e.g. CKD stage from
   eGFR) and reaching conclusions.
4. Results are shown as severity-ranked cards, each with an **explanation** of
   exactly which facts/rule produced it, plus a full **inference trace**.

## Tech

- **React 18 + Vite** — fast, modern frontend.
- **Vanilla JS inference engine** — `src/engine/ruleEngine.js` (CLIPS/Prolog-style).
- **Declarative knowledge base** — `src/data/knowledgeBase.js`.
- Plain CSS with a glassmorphism / gradient design system (no UI framework).

## Project structure

```
src/
  engine/
    ruleEngine.js      # generic forward-chaining engine
    advisor.js         # glue: answers -> facts -> conclusions
    ruleEngine.test.js # node:test unit tests
  data/
    knowledgeBase.js   # questions + nephrology rules (the "expert" knowledge)
  components/          # Hero, Wizard, QuestionField, Results, Disclaimer
  App.jsx
```

## Getting started

```bash
npm install
npm run dev        # start dev server
npm run build      # production build
npm run preview    # preview the build
npm run lint       # eslint
npm test           # run the inference-engine unit tests
```

## How the rule engine works

A rule is declarative data:

```js
{
  id: 'AKI',
  priority: 35,
  conditions: [
    { id: 'recent_nsaid', equals: true },
    { id: 'urine_output', equals: 'low' },
  ],
  conclude: [{ result: { id: 'aki', title: 'Possible acute kidney injury', severity: 'urgent', ... } }],
}
```

`infer(facts, rules)` repeatedly fires every rule whose conditions all match the
current facts (highest `priority` first), asserting any new facts, until it
reaches a fixed point. Because conclusions can assert facts that satisfy other
rules, the engine supports multi-step chaining (e.g. `eGFR < 15` → `kidney_failure`
fact → urgent conclusion).

## Extending the knowledge base

Add a new rule to `rules` in `src/data/knowledgeBase.js`. To collect a new input,
add a question to `questionGroups`; its `id` automatically becomes a fact.
