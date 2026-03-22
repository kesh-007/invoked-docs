---
id: processors
title: Input & Output Processors
sidebar_position: 4
---

# Input & Output Processors

Processors are middleware functions that transform the message before Claude sees it (input) or the result before it's returned (output). Chain as many as you need — they run left to right.

## createInputProcessor()

```typescript
import { createInputProcessor } from "invoked";

const addDate = createInputProcessor((ctx) => ({
  ...ctx,
  message: `Today is ${ctx.timestamp.slice(0, 10)}.\n\n${ctx.message}`,
}));

const agent = new Agent({
  name: "agent",
  instructions: "...",
  inputPipeline: [addDate],
});
```

The `InputContext` you receive:

```typescript
interface InputContext {
  message: string;
  agentName: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}
```

## createOutputProcessor()

```typescript
import { createOutputProcessor } from "invoked";
import { appendFileSync } from "fs";

const auditLog = createOutputProcessor((ctx) => {
  appendFileSync(
    "./audit.log",
    `${ctx.input.timestamp} | ${ctx.agentName} | ${ctx.result.slice(0, 100)}\n`
  );
  return ctx;
});

const agent = new Agent({
  name: "agent",
  instructions: "...",
  outputPipeline: [auditLog],
});
```

The `OutputContext` you receive:

```typescript
interface OutputContext {
  result: string;
  agentName: string;
  input: InputContext;
  metadata: Record<string, unknown>;
}
```

## Real examples

### Add metadata to every message

```typescript
const personalise = createInputProcessor((ctx) => ({
  ...ctx,
  message: ctx.metadata.userName
    ? `[User: ${ctx.metadata.userName}]\n${ctx.message}`
    : ctx.message,
}));

await agent.generate("What plan am I on?", { userName: "Alice" });
```

### Sanitise output

```typescript
const stripMarkdown = createOutputProcessor((ctx) => ({
  ...ctx,
  result: ctx.result
    .replace(/```[\s\S]*?```/g, "[code block]")
    .replace(/\*\*/g, "")
    .trim(),
}));
```

### Advanced: full middleware with next()

```typescript
import type { InputMiddleware } from "invoked";

const timer: InputMiddleware = async (ctx, next) => {
  const start = Date.now();
  const result = await next(ctx);
  console.log(`Pipeline took ${Date.now() - start}ms`);
  return result;
};
```
