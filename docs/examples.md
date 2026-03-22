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

## Agent with MCP server

```typescript
import { Agent } from "invoked";

const agent = new Agent({
  name: "coder",
  instructions: "You help with code tasks. Use the filesystem to read and write files.",
  mcpServers: {
    filesystem: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "./src"],
    },
  },
});

const result = await agent.generate("List all TypeScript files and summarise what each one does");
```

---

## Agent with multiple MCP servers

```typescript
import { Agent } from "invoked";

const agent = new Agent({
  name: "analyst",
  instructions: "You query databases and write analysis reports.",
  mcpServers: {
    postgres: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres", process.env.DATABASE_URL!],
    },
    filesystem: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "./reports"],
    },
  },
});

const report = await agent.generate(
  "Query the orders table for last month and write a summary report to ./reports/monthly.md"
);
```

---

## Output validation with processor retry

```typescript
import { Agent, createOutputProcessor } from "invoked";
import { z } from "zod";

const enforceJson = createOutputProcessor(async (ctx) => {
  try {
    JSON.parse(ctx.result);
    return ctx;
  } catch {
    return { ...ctx, retry: { prompt: `Return valid JSON only. Previous attempt: ${ctx.result}` } };
  }
});

const agent = new Agent({
  name: "json-agent",
  instructions: "Always respond with valid JSON.",
  outputPipeline: [enforceJson],
});
```
