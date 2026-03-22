---
id: memory
title: Scratchpad
sidebar_position: 3
---

# Scratchpad

Agents are **stateless by default** — each call is independent and no history is stored between runs. This is intentional: stateless agents are simpler, more predictable, and work great for most automations.

When you need the agent to track what it's doing across a complex multi-step task, enable the scratchpad.

## Enable the scratchpad

```typescript
const agent = new Agent({
  name: "analyst",
  instructions: "You are a research analyst.",
  scratchpad: true,
});
```

## What the scratchpad does

When `scratchpad: true`, every call automatically:

1. **Records the current goal** — the prompt is saved so the agent always knows what it's working on
2. **Injects the scratchpad into the system prompt** — the agent can see its own notes on every call
3. **Provides a built-in `remember` tool** — the agent can write notes to itself during a run

```
## Scratchpad
goal: "Research the top 5 AI developments from the past week"
notes:
  - "Found 3 relevant papers from arXiv, still searching for industry news"
  - "Key finding: market share increased 15% YoY — include in summary"
```

## When to use it

```typescript
// Stateless — good for Q&A, data extraction, one-shot tasks
const extractor = new Agent({
  name: "extractor",
  instructions: "Extract structured data from text.",
});

// With scratchpad — good for complex research, multi-step workflows
const researcher = new Agent({
  name: "researcher",
  instructions: "Research topics thoroughly using web search.",
  allowedTools: ["WebSearch", "WebFetch"],
  scratchpad: true,
});
```

## Clearing the scratchpad

```typescript
agent.clearMemory();
// Clears scratchpad notes, goal, and session
```

## Memory extensions

For persistent memory across sessions, use the pipeline hooks:

```typescript
import { Agent, createInputProcessor, createOutputProcessor } from "invoked";

const injectHistory = createInputProcessor((ctx) => ({
  ...ctx,
  message: `${ctx.message}\n\n[Previous context here]`,
}));

const saveHistory = createOutputProcessor((ctx) => {
  // persist ctx.input.message + ctx.result somewhere
  return ctx;
});

const agent = new Agent({
  name: "assistant",
  instructions: "You are a helpful assistant.",
  inputPipeline: [injectHistory],
  outputPipeline: [saveHistory],
});
```

See [Processors →](./processors) for the full pipeline API.
