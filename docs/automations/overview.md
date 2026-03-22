---
id: overview
title: Automations Overview
sidebar_position: 1
---

# Automations

Wire Claude agents to **cron schedules** and **HTTP webhooks** using a single fluent builder API.

## The three-part chain

```
createAutomation("name")
  .<trigger>      ← .cron() or .webhook()
  .<action>       ← .agent().prompt()  or  .run(handler)
  .<register>     ← .start()
```

## Triggers

| Method | When it runs |
|---|---|
| `.cron("0 9 * * *")` | On a schedule (standard cron syntax) |
| `.webhook("/path", { method: "POST" })` | When an HTTP request arrives |

## Actions

**Agent + prompt** (most common):
```typescript
.agent(myAgent)
.prompt("Summarise today's activity")
```

**Custom handler** (full control):
```typescript
.run(async (ctx) => {
  // call agents, query databases, send emails, anything
})
```

## Starting all automations

```typescript
// Cron only — no port needed
await startAutomations();

// Webhooks (or mixed) — port required
await startAutomations({ port: 3000 });
```

| You registered | What happens |
|---|---|
| Cron only | Schedules them — no HTTP server started |
| Webhooks | Starts HTTP server on `port` |
| Both | Does both |

## Complete example

```typescript
import { Agent, createAutomation, startAutomations } from "invoked";

const reporter = new Agent({
  name: "reporter",
  instructions: "You write concise daily summary reports.",
  allowedTools: ["Read", "Glob"],
});

const codeReviewer = new Agent({
  name: "code-reviewer",
  instructions: "You review pull requests for bugs and style issues.",
});

createAutomation("daily-report")
  .cron("0 9 * * 1-5")
  .agent(reporter)
  .prompt("Read all .ts files changed today and write a summary")
  .start();

createAutomation("pr-review")
  .webhook("/github")
  .agent(codeReviewer)
  .prompt((req) => `Review this PR: ${JSON.stringify(req.body)}`)
  .start();

createAutomation("health-check")
  .webhook("/health", { method: "GET" })
  .run(async (_req, ctx) => ({ status: "ok", timestamp: ctx.triggeredAt }));

await startAutomations({ port: 3000 });
```

## Next steps

- [Cron automations →](./cron)
- [Webhook automations →](./webhooks)
