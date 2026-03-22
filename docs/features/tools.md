---
id: tools
title: Tools
sidebar_position: 1
---

# Tools

Tools are typed TypeScript functions that Claude can call during a response. Use them for anything requiring real data — API calls, database queries, calculations, file operations.

## Define a tool

```typescript
import { defineTool } from "invoked";
import { z } from "zod";

const getWeather = defineTool({
  name: "get_weather",
  description: "Get current weather for a city",
  input: {
    city: z.string().describe("City name, e.g. London"),
    units: z.enum(["C", "F"]).optional(),
  },
  run: async ({ city, units }) => {
    // your API call here
    return `22°${units ?? "C"} and sunny in ${city}`;
  },
});
```

## Attach to an agent

```typescript
const agent = new Agent({
  name: "weather-bot",
  instructions: "You help with weather queries.",
  tools: [getWeather],
});

await agent.generate("What's the weather in Tokyo?");
// Claude calls get_weather({ city: "Tokyo" }) automatically
```

## Multiple tools

```typescript
const agent = new Agent({
  name: "assistant",
  instructions: "You are a helpful assistant with access to various tools.",
  tools: [getWeather, searchDatabase, sendEmail, fetchStockPrice],
});
```

## Built-in Claude Code tools

Give Claude direct access to your filesystem, shell, or the web:

```typescript
new Agent({
  allowedTools: ["Read", "Glob", "Grep"],        // read files
  allowedTools: ["Read", "Write", "Edit"],       // full file access
  allowedTools: ["Bash"],                        // shell commands
  allowedTools: ["WebSearch", "WebFetch"],       // web access
});
```

These are built into Claude Code — no implementation needed.

## Tool vs Skill

| | Tool | Skill |
|---|---|---|
| Best for | Single data lookups | Multi-step sub-tasks |
| Returns | string | Full agent response |
| Backed by | Your function | Another Agent |
| Example | `fetch_price("AAPL")` | `research("latest AI news")` |
