---
id: generate
title: agent.generate()
sidebar_position: 2
---

# agent.generate()

Send a prompt and receive the full response as a string.

## Signature

```typescript
agent.generate(prompt: string, metadata?: Record<string, unknown>): Promise<string>
```

## Basic usage

```typescript
const answer = await agent.generate("What is TypeScript?");
console.log(answer);
```

## With metadata

```typescript
const answer = await agent.generate("Summarise this", {
  userId: "u_123",
  source: "web-app",
});
```

Metadata flows through your input/output pipeline via `ctx.metadata`.

## What happens internally

1. Input pipeline runs (if configured)
2. System prompt assembled — instructions + scratchpad (if enabled)
3. Claude processes the prompt
4. Output pipeline runs (if configured)
5. Result string returned

## When to use

Use `generate()` for Q&A, summarisation, code explanation, or any task where you want the full response before doing anything with it.

For real-time display use [`stream()`](./stream). For typed structured data use [`generateObject()`](./generate-object).
