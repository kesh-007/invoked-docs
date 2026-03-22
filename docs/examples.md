---
id: examples
title: Examples
sidebar_position: 10
---

# Examples

## Simple Q&A agent

```typescript
import { Agent } from "invoked";

const agent = new Agent({
  name: "qa",
  instructions: "You are a concise assistant. Answer in 2-3 sentences max.",
});

const answer = await agent.generate("What is a closure in JavaScript?");
console.log(answer);
```

---

## Streaming chat in the terminal

```typescript
import { Agent } from "invoked";
import * as readline from "readline";

const agent = new Agent({
  name: "chat",
  instructions: "You are a friendly assistant.",
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const ask = () => {
  rl.question("You: ", async (input) => {
    if (input.trim() === "exit") { rl.close(); return; }
    process.stdout.write("\nAssistant: ");
    for await (const chunk of agent.stream(input)) {
      process.stdout.write(chunk);
    }
    console.log("\n");
    ask();
  });
};

ask();
```

---

## Data extractor with generateObject

```typescript
import { Agent } from "invoked";
import { z } from "zod";

const extractor = new Agent({
  name: "extractor",
  instructions: "Extract structured data from the provided text accurately.",
});

const ContactSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  company: z.string().optional(),
  role: z.string().optional(),
});

const contact = await extractor.generateObject(
  `Extract: "Hi, I'm Sarah Chen, Lead Engineer at Acme Corp. Reach me at sarah@acme.io"`,
  ContactSchema
);

console.log(contact.name);    // "Sarah Chen"
console.log(contact.email);   // "sarah@acme.io"
```

---

## Orchestrator with skills

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

---

## Agent with scratchpad

```typescript
import { Agent } from "invoked";

const researcher = new Agent({
  name: "researcher",
  instructions: "You are a thorough research analyst.",
  allowedTools: ["WebSearch", "WebFetch"],
  scratchpad: true,
});

const report = await researcher.generate(
  "Research the competitive landscape of AI coding assistants in 2025"
);
```

---

## Daily report cron

```typescript
import { Agent, createAutomation, startAutomations } from "invoked";
import { writeFileSync } from "fs";

const reporter = new Agent({
  name: "reporter",
  instructions: "You write concise daily briefings.",
  allowedTools: ["Read", "Glob"],
});

createAutomation("daily-briefing")
  .cron("0 9 * * 1-5")
  .run(async (ctx) => {
    const report = await reporter.generate(
      `Write a morning briefing for ${new Date(ctx.triggeredAt).toDateString()}.`
    );
    writeFileSync(`./reports/${ctx.triggeredAt.slice(0, 10)}.md`, report);
  });

await startAutomations();
```

---

## Multi-automation app

```typescript
import { Agent, createAutomation, startAutomations } from "invoked";

const reporter   = new Agent({ name: "reporter",   instructions: "Write summary reports." });
const classifier = new Agent({ name: "classifier", instructions: "Classify support tickets." });
const notifier   = new Agent({ name: "notifier",   instructions: "Draft notification messages." });

createAutomation("daily-report")
  .cron("0 9 * * 1-5")
  .agent(reporter)
  .prompt("Compile today's key metrics and write a 3-paragraph summary.")
  .start();

createAutomation("support-ticket")
  .webhook("/support", { method: "POST" })
  .agent(classifier)
  .prompt((req) => {
    const ticket = req.body as { subject: string; message: string };
    return `Classify this ticket: ${ticket.subject} — ${ticket.message}`;
  })
  .start();

createAutomation("notify")
  .webhook("/notify", { method: "POST" })
  .run(async (req) => {
    const { event, user } = req.body as { event: string; user: string };
    const message = await notifier.generate(`Draft a notification for "${user}" about: ${event}`);
    return { sent: true, message };
  });

createAutomation("health")
  .webhook("/health", { method: "GET" })
  .run((_req, ctx) => ({ status: "ok", timestamp: ctx.triggeredAt }));

await startAutomations({
  port: 3000,
  onError: (name, err) => console.error(`[ERROR] "${name}" failed:`, err),
});
```
