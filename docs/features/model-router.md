---
id: model-router
title: Model Router
sidebar_position: 6
---

# Model Router

A model router dynamically picks the best Claude model for each agent's sub-task at runtime. Use it with the `Orchestrator` to avoid paying for a heavy model when a lightweight one is enough.

## Create a router

```typescript
import { defineModelRouter } from "invoked";

const router = defineModelRouter(
  [
    // first match wins — evaluated in order
    { match: /analyze|review|architect/i, model: "claude-opus-4-6"           },
    { match: /write|draft|explain/i,      model: "claude-sonnet-4-6"         },
    { match: /search|lookup|find/i,       model: "claude-haiku-4-5-20251001" },
  ],
  "claude-sonnet-4-6" // default when nothing matches
);
```

Pass it to an `Orchestrator`:

```typescript
const orchestrator = new Orchestrator({
  name: "pipeline",
  agents: [researcher, analyst, writer],
  modelRouter: router,
});
```

Each agent invocation passes its task string through the router at runtime. If the task is `"search for recent AI papers"`, the router returns `claude-haiku-4-5-20251001` and the researcher runs on that model for that call.

---

## Match types

Each route's `match` field accepts three forms:

### String (substring match, case-insensitive)

```typescript
{ match: "summarize", model: "claude-sonnet-4-6" }
// matches: "summarize this article", "SUMMARIZE the data"
```

### RegExp

```typescript
{ match: /write|draft|generate/i, model: "claude-sonnet-4-6" }
```

### Async predicate

```typescript
{
  match: async (task: string) => task.split(" ").length > 100,
  model: "claude-opus-4-6",
}
```

Use an async predicate when the routing decision itself requires an async operation (e.g. checking task length, calling a classifier).

---

## First match wins

Rules are evaluated in order — as soon as one matches, that model is used:

```typescript
const router = defineModelRouter([
  { match: /analyze/i, model: "claude-opus-4-6"   }, // checked first
  { match: /analyze|write/i, model: "claude-sonnet-4-6" }, // never reached for "analyze"
]);
```

Put your most specific rules first.

---

## Default model

The second argument to `defineModelRouter` is the fallback model used when no rule matches:

```typescript
const router = defineModelRouter(
  [{ match: "search", model: "claude-haiku-4-5-20251001" }],
  "claude-sonnet-4-6" // default
);
```

If omitted, the default is `"claude-sonnet-4-6"`.

---

## Model IDs

| Alias | Full model ID | Best for |
|---|---|---|
| — | `claude-opus-4-6` | Complex reasoning, analysis, architecture |
| — | `claude-sonnet-4-6` | Writing, coding, general tasks |
| — | `claude-haiku-4-5-20251001` | Fast lookups, search, classification |
