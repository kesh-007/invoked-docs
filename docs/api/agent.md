---
id: agent
title: Agent
sidebar_position: 1
---

# Agent

The core class. Create one per use case — each agent has its own name, instructions, tools, and skills. Agents remember conversation history across calls by default.

## Create an agent

```typescript
import { Agent } from "invoked";

const agent = new Agent({
  name: "assistant",
  instructions: "You are a helpful assistant.",
});
```

## Config reference

```typescript
new Agent({
  name: string,
  instructions: string | ((ctx: InputContext) => string),
  memory?: boolean,            // default: true  — set false for stateless one-shot agents
  scratchpad?: boolean,        // default: false
  allowedTools?: string[],
  tools?: ToolDef[],
  skills?: SkillDef[],
  inputPipeline?: InputMiddleware[],
  outputPipeline?: OutputMiddleware[],
})
```

## Dynamic instructions

```typescript
const agent = new Agent({
  name: "assistant",
  instructions: (ctx) => {
    return `You are a helpful assistant.
Current time: ${ctx.timestamp}`;
  },
});
```

The `ctx` object:

```typescript
interface InputContext {
  message: string;
  agentName: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}
```

## Built-in Claude Code tools

```typescript
new Agent({
  allowedTools: ["Read", "Glob", "Grep"],        // read files
  allowedTools: ["Read", "Write", "Edit"],       // full file access
  allowedTools: ["Bash"],                        // shell commands
  allowedTools: ["WebSearch", "WebFetch"],       // web access
});
```

## Methods

| Method | Returns | Description |
|---|---|---|
| `generate(prompt)` | `Promise<string>` | Full response as a string |
| `stream(prompt)` | `AsyncGenerator<string>` | Token-by-token streaming |
| `generateObject(prompt, schema)` | `Promise<z.infer<T>>` | Typed structured output |
| `clearMemory()` | `void` | Clear scratchpad and session |
| `asSkill(description)` | `SkillDef` | Expose as a skill for another agent |

## Scratchpad

Enable the scratchpad for complex multi-step tasks:

```typescript
const agent = new Agent({
  name: "analyst",
  instructions: "You are a research analyst.",
  scratchpad: true,
});
```

When enabled, the agent automatically tracks its current goal and can write notes to itself via a built-in `remember` tool.

See [Scratchpad →](../features/memory) for details.
