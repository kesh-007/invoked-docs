---
id: intro
title: Introduction
sidebar_position: 1
slug: /
---

# invoked

A lightweight TypeScript library for building Claude-powered agents — runs on your existing Claude Code subscription, **no API key required**.

## What can you build?

- **Chat agents** — Q&A, summarisation, code explanation
- **Structured data extractors** — typed JSON output from natural language
- **Orchestrators** — one agent that coordinates a team of specialised sub-agents
- **Tool-using agents** — connect to any MCP server or define your own tools

## Core features

| Feature | What it does |
|---|---|
| **Agent** | Claude-powered entity with tools and skills — stateless by default |
| **Tools** | Typed TypeScript functions Claude can call |
| **Skills** | Delegate sub-tasks to specialised sub-agents |
| **MCP servers** | Connect to any Model Context Protocol server — stdio or SSE |
| **Scratchpad** | Opt-in internal notepad — agent tracks its own goal and notes |
| **Streaming** | Real token-by-token output |
| **generateObject** | Guaranteed typed JSON via Zod schemas |
| **Processors** | Transform inputs and outputs with a middleware pipeline |

## Quick look

```typescript
import { Agent, defineTool } from "invoked";
import { z } from "zod";

// Simple agent
const agent = new Agent({
  name: "assistant",
  instructions: "You are a helpful assistant.",
});

const answer = await agent.generate("What is TypeScript?");

// Stream token by token
for await (const chunk of agent.stream("Tell me a story")) {
  process.stdout.write(chunk);
}

// Structured output
const result = await agent.generateObject(
  "Extract: Alice is 30, knows TypeScript.",
  z.object({ name: z.string(), age: z.number() })
);

// With MCP server
const fsAgent = new Agent({
  name: "coder",
  instructions: "You help with code.",
  mcpServers: {
    filesystem: { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem", "./"] },
  },
});
```

## Next steps

- [Installation →](./installation)
- [Your first agent →](./api/agent)
- [Tools →](./features/tools)
- [Skills →](./features/skills)
- [MCP servers →](./features/mcp)
