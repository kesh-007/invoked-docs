---
id: installation
title: Installation
sidebar_position: 2
---

# Installation

## Prerequisites

- **Node.js** 18 or later
- **Claude Code** installed and authenticated — [claude.com/product/claude-code](https://claude.com/product/claude-code)

## Install the package

```bash
npm install invoked zod
```

## Imports

```typescript
import {
  Agent,
  defineTool,
  defineSkill,
  createInputProcessor,
  createOutputProcessor,
  createAutomation,
  startAutomations,
} from "invoked";
import { z } from "zod";
```

## TypeScript config

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true
  }
}
```

## Authentication

Authentication is handled automatically by Claude Code — the same account you use in your editor. No `.env` file, no API keys to manage.

## Verify it works

```typescript
import { Agent } from "invoked";

const agent = new Agent({
  name: "test",
  instructions: "You are a concise assistant. Keep responses under 2 sentences.",
});

const answer = await agent.generate("What is 2 + 2?");
console.log(answer);
```

Run it:

```bash
npx ts-node test.ts
```
