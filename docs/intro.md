---
id: intro
title: Introduction
sidebar_position: 1
slug: /
---

# invoked

A lightweight TypeScript package for building Claude-powered agents, cron jobs, and webhook automations — runs on your existing Claude Code subscription, **no API key required**.

## What can you build?

- **Chat agents** — Q&A, summarisation, code explanation
- **Structured data extractors** — typed JSON output from natural language
- **Orchestrators** — one agent that coordinates a team of specialised sub-agents
- **Automated workflows** — cron jobs and webhook handlers backed by Claude

## Core features

| Feature | What it does |
|---|---|
| **Agent** | Claude-powered entity with tools and skills — stateless by default |
| **Tools** | Typed TypeScript functions Claude can call (fetch, calculate, query DB…) |
| **Skills** | Delegate complex sub-tasks to specialised sub-agents |
| **Scratchpad** | Opt-in internal notepad — agent tracks its own goal and notes |
| **Streaming** | Real token-by-token output |
| **generateObject** | Guaranteed typed JSON via Zod schemas |
| **Automations** | Cron jobs and webhook endpoints that run agents on a schedule or on demand |

## Quick look

### Agents

```typescript
import { Agent, defineTool, defineSkill } from "invoked";
import { z } from "zod";

const agent = new Agent({
  name: "assistant",
  instructions: "You are a helpful assistant.",
  tools: [myTool],
  skills: [mySkill],
});

const answer = await agent.generate("What is TypeScript?");

for await (const chunk of agent.stream("Tell me a story")) {
  process.stdout.write(chunk);
}

const result = await agent.generateObject(
  "Extract: Alice is 30, knows TypeScript.",
  z.object({ name: z.string(), age: z.number() })
);
```

### Automations

```typescript
import { createAutomation, startAutomations } from "invoked";

createAutomation("daily-report")
  .cron("0 9 * * *")
  .agent(myAgent)
  .prompt("Compile today's summary report")
  .start();

createAutomation("pr-review")
  .webhook("/github", { method: "POST" })
  .agent(codeReviewer)
  .prompt((req) => `Review this PR: ${JSON.stringify(req.body)}`)
  .start();

await startAutomations({ port: 3000 });
```

## Next steps

- [Installation →](./installation)
- [Your first agent →](./api/agent)
- [Tools →](./features/tools)
- [Skills →](./features/skills)
- [Automations →](./automations/overview)
