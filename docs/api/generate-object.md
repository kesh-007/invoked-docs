---
id: generate-object
title: agent.generateObject()
sidebar_position: 4
---

# agent.generateObject()

Send a prompt and receive a **fully typed, structured object** — no markdown, no extra text, guaranteed to match your Zod schema.

## Signature

```typescript
agent.generateObject<T extends z.ZodType>(
  prompt: string,
  schema: T,
  metadata?: Record<string, unknown>
): Promise<z.infer<T>>
```

## Basic usage

```typescript
import { z } from "zod";

const Person = z.object({
  name: z.string(),
  age: z.number(),
  skills: z.array(z.string()),
});

const result = await agent.generateObject(
  "Extract: Sarah is 28. She knows TypeScript, Python, and Rust.",
  Person
);

console.log(result.name);    // "Sarah"
console.log(result.age);     // 28
console.log(result.skills);  // ["TypeScript", "Python", "Rust"]
```

## Use cases

### Sentiment analysis

```typescript
const Sentiment = z.object({
  label: z.enum(["positive", "negative", "neutral"]),
  score: z.number().describe("Confidence from 0 to 1"),
  reason: z.string(),
});

const result = await agent.generateObject(
  "Classify: 'This framework is incredibly easy to use!'",
  Sentiment
);
// result.label → "positive"
// result.score → 0.97
```

### Data extraction

```typescript
const Invoice = z.object({
  vendor: z.string(),
  amount: z.number(),
  currency: z.string(),
  date: z.string(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
  })),
});

const invoice = await agent.generateObject(invoiceText, Invoice);
```

### Issue classification

```typescript
const Category = z.object({
  type: z.enum(["bug", "feature", "question", "docs"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  summary: z.string().describe("One-line summary, max 80 chars"),
  assignTeam: z.string(),
});

const classified = await agent.generateObject(githubIssueBody, Category);
```

## Comparison

| | `generate()` | `generateObject()` |
|---|---|---|
| Returns | `string` | `z.infer<YourSchema>` |
| Format | Natural language | Pure JSON only |
| TypeScript typed | ❌ | ✅ Full inference |
| Zod validated | ❌ | ✅ |
| Pipelines run | ✅ | ✅ |
