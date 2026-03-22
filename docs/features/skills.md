---
id: skills
title: Skills
sidebar_position: 2
---

# Skills

Skills are other agents (or custom functions) the main agent can invoke autonomously to handle complete sub-tasks end to end.

## Define a skill from an agent

```typescript
import { Agent } from "invoked";

const researcher = new Agent({
  name: "researcher",
  instructions: "Search the web and summarise findings with cited sources.",
  allowedTools: ["WebSearch", "WebFetch"],
});

// Expose as a skill
const researchSkill = researcher.asSkill(
  "Search the web and return a detailed summary with sources"
);
```

## Or use defineSkill()

```typescript
import { defineSkill } from "invoked";
import { z } from "zod";

// Backed by a custom function
const formatJson = defineSkill({
  name: "format_json",
  description: "Pretty-print a raw JSON string",
  input: { json: z.string() },
  run: async ({ json }) => JSON.stringify(JSON.parse(String(json)), null, 2),
});
```

## Attach to an orchestrator

```typescript
const orchestrator = new Agent({
  name: "orchestrator",
  instructions: `You coordinate tasks. Delegate to skills when needed.
Use researcher for any web lookups.
Use analyst for data analysis.`,
  skills: [
    researcher.asSkill("Handles all web research and news lookup"),
    analyst.asSkill("Analyses data and provides strategic insights"),
  ],
});

// The orchestrator autonomously decides when to call each skill
await orchestrator.generate(
  "Research the latest news on NVIDIA and analyse if it's a good investment"
);
```

## How it works

Each skill becomes an MCP tool named `skill_<name>` that Claude can call at any time during a response. When called, it runs the skill's agent or function and returns the result back to the orchestrator.

## Full example

```typescript
import { Agent, defineTool } from "invoked";
import { z } from "zod";

const researcher = new Agent({
  name: "researcher",
  instructions: "Search and summarise web content with cited sources.",
  allowedTools: ["WebSearch", "WebFetch"],
});

const analyst = new Agent({
  name: "analyst",
  instructions: "Analyse data, find patterns, give actionable insights.",
});

const fetchPrice = defineTool({
  name: "fetch_price",
  description: "Get the current price of a stock ticker",
  input: { ticker: z.string() },
  run: async ({ ticker }) => `$142.50 for ${ticker}`,
});

const orchestrator = new Agent({
  name: "orchestrator",
  instructions: "You coordinate research and analysis tasks.",
  tools: [fetchPrice],
  skills: [
    researcher.asSkill("Handles all web research"),
    analyst.asSkill("Analyses data and provides insights"),
  ],
});

const report = await orchestrator.generate(
  "Research the latest news on NVIDIA and analyse whether it's a good time to invest"
);
```
