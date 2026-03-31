---
id: skills
title: Skills
sidebar_position: 2
---

# Skills

Skills are other agents (or custom functions) the main agent can invoke autonomously to handle complete sub-tasks end to end.

## Skill files

The easiest way to define reusable skills is as markdown files. The frontmatter configures the agent, the body is its system prompt.

```
skills/
  researcher.md
  analyst.md
  formatter.md
```

**`skills/researcher.md`**

```markdown
---
name: researcher
description: Handles all web research tasks
allowedTools: ["WebSearch", "WebFetch"]
scratchpad: true
---

You are a research analyst. Search the web thoroughly and summarise findings with cited sources.
Always include at least 3 sources.
```

**`skills/analyst.md`**

```markdown
---
name: analyst
description: Analyses data and provides strategic insights
---

You are a data analyst. Identify patterns, trends, and give clear actionable recommendations.
```

Load them into any agent:

```typescript
import { Agent, loadSkills } from "invoked";

// Single file → array with that one skill
const skills = loadSkills("./skills/researcher.md");

// Directory → all .md files loaded as skills
const skills = loadSkills("./skills");

const orchestrator = new Agent({
  name: "orchestrator",
  instructions: "You coordinate tasks. Delegate to your skills.",
  skills,
});

await orchestrator.generate("Research the latest AI news and write an analysis");
```

### Supported frontmatter fields

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Required. Unique skill/agent name |
| `description` | `string` | Required. Tells the orchestrator when to use this skill |
| `allowedTools` | `string[]` | Built-in Claude Code tools, e.g. `["WebSearch", "WebFetch"]` |
| `scratchpad` | `boolean` | Enable internal notepad for complex tasks |
| `mcpServers` | `object` | Connect to MCP servers (JSON object) |

---

## Define a skill in code

```typescript
import { Agent } from "invoked";

const researcher = new Agent({
  name: "researcher",
  instructions: "Search the web and summarise findings with cited sources.",
  allowedTools: ["WebSearch", "WebFetch"],
});

const orchestrator = new Agent({
  name: "orchestrator",
  instructions: "You coordinate tasks. Delegate research to your skills.",
  skills: [researcher.asSkill("Handles all web research")],
});
```

## Custom function skill

```typescript
import { defineSkill } from "invoked";
import { z } from "zod";

const formatJson = defineSkill({
  name: "format_json",
  description: "Pretty-print a raw JSON string",
  input: { json: z.string() },
  run: async ({ json }) => JSON.stringify(JSON.parse(String(json)), null, 2),
});
```

## How it works

Each skill becomes an MCP tool named `skill_<name>` that Claude can call at any time during a response. When called, it runs the skill's agent or function and returns the result back to the orchestrator.
