---
id: orchestrator
title: Orchestrator
sidebar_position: 5
---

# Orchestrator

The `Orchestrator` coordinates a team of specialised agents to complete a task. Give it the agents, give it the task — it figures out the rest.

## How it works

Every `orchestrator.stream(task)` call runs three automatic phases:

**1. Plan** — a built-in planner LLM reads the task and your agents' descriptions, then produces a typed workflow: which agent does what, and whether each step runs in parallel or sequentially.

**2. Execute** — runs the workflow exactly as planned:
- Parallel steps stream concurrently — chunks merged by arrival time
- Sequential steps receive all prior agents' results as context automatically

**3. Synthesize** — a built-in synthesizer LLM combines every agent's output into one coherent, conclusive answer.

---

## Setup

```typescript
import { Agent, Orchestrator } from "invoked";

const researcher = new Agent({
  name: "researcher",
  description: "Searches the web and returns key facts with sources",
  instructions: "You are a research specialist. Return 3-5 key facts about the given topic.",
  allowedTools: ["WebSearch", "WebFetch"],
  memory: false,
});

const analyst = new Agent({
  name: "analyst",
  description: "Analyses information and identifies patterns or insights",
  instructions: "You are a data analyst. Identify the 2-3 most important insights.",
  memory: false,
});

const writer = new Agent({
  name: "writer",
  description: "Writes clear, engaging explanations for a general audience",
  instructions: "You are a writer. Turn facts and insights into a polished explanation.",
  memory: false,
});

const orchestrator = new Orchestrator({
  name: "content-pipeline",
  agents: [researcher, analyst, writer],
  plannerModel:     "claude-sonnet-4-6",
  synthesizerModel: "claude-sonnet-4-6",
});
```

:::tip Add a `description` to every agent
The planner reads each agent's `description` to decide who does what. The more specific the description, the better the plan.
:::

---

## Streaming

```typescript
for await (const event of orchestrator.stream("Explain how the JS event loop works")) {
  if (event.type === "plan") {
    console.log("Workflow:", event.reasoning);
    for (const s of event.steps)
      console.log(`  • ${s.agent}  parallel=${s.runInParallel}`);
  }

  if (event.type === "agent_start")      console.log(`\n▶ [${event.agent}]`);
  if (event.type === "agent_chunk")      process.stdout.write(event.chunk);
  if (event.type === "agent_done")       console.log(`\n✓ [${event.agent}] done`);

  if (event.type === "synthesizing")     console.log("\n\n— Synthesizing…");
  if (event.type === "conclusion_chunk") process.stdout.write(event.chunk);

  if (event.type === "done") {
    console.log("\nPer-agent results:", event.results);
    console.log("Final conclusion:", event.conclusion);
  }
}
```

---

## One-shot (non-streaming)

```typescript
const { results, conclusion } = await orchestrator.generate(
  "Compare React and Vue for building large-scale applications"
);

console.log(conclusion);
// → one synthesized answer combining all agents' work

console.log(results);
// → { researcher: "…", analyst: "…", writer: "…" }
```

---

## Event reference

| Event | Key fields | When |
|---|---|---|
| `"planning"` | `message` | Orchestration starts |
| `"plan"` | `reasoning`, `steps[]` | Planner produced the workflow |
| `"agent_start"` | `agent`, `task` | An agent begins its task |
| `"agent_chunk"` | `agent`, `chunk` | Streaming token from an agent |
| `"agent_done"` | `agent`, `result` | An agent finished |
| `"synthesizing"` | `message` | All agents done; synthesizer starting |
| `"conclusion_chunk"` | `chunk` | Streaming token from the synthesizer |
| `"conclusion"` | `result` | The complete synthesized answer |
| `"done"` | `results`, `conclusion` | Everything complete |

---

## Config reference

```typescript
new Orchestrator({
  name: string,
  agents: Agent[],
  plannerModel?:     string,   // model for the planning step
  synthesizerModel?: string,   // model for the synthesis step (defaults to plannerModel)
  instructions?:     string,   // extra guidance appended to the planner's prompt
  modelRouter?:      ModelRouter, // dynamically route each agent's task to the best model
})
```

---

## Parallel vs sequential

The planner decides whether each step runs in parallel or sequentially based on dependencies. You can guide it with your agent descriptions and the task phrasing.

Steps that the planner marks as `runInParallel: true` run concurrently — their chunks are interleaved in real time. Sequential steps automatically receive the full output of all prior steps as context.

```
Task: "Research AI trends, analyse the data, write a blog post"

Plan:
  1. researcher   parallel=false   ← must run first
  2. analyst      parallel=false   ← needs researcher output as context
  3. writer       parallel=false   ← needs analyst output as context
```

```
Task: "Get me a weather report AND the latest tech news"

Plan:
  1. weather-agent   parallel=true   ← independent
  2. news-agent      parallel=true   ← independent (runs at the same time)
  3. formatter       parallel=false  ← needs both results above
```

---

## With a model router

Optionally route each agent's sub-task to the best model at runtime:

```typescript
import { Orchestrator, defineModelRouter } from "invoked";

const router = defineModelRouter([
  { match: /analyze|review/i,  model: "claude-opus-4-6"           },
  { match: /write|draft/i,     model: "claude-sonnet-4-6"         },
  { match: /search|lookup/i,   model: "claude-haiku-4-5-20251001" },
]);

const orchestrator = new Orchestrator({
  name: "routed-pipeline",
  agents: [researcher, analyst, writer],
  modelRouter: router,
});
```

See [Model Router →](./model-router) for full documentation.

---

## Skills vs Orchestrator

| | **Skills** (on `Agent`) | **Orchestrator** |
|---|---|---|
| Who decides workflow | Claude (autonomously during response) | Built-in planner (explicit upfront) |
| Parallel execution | ❌ sequential only | ✅ parallel + sequential |
| Final synthesis | ❌ raw agent output | ✅ synthesized conclusion |
| Best for | Flexible delegation mid-response | Structured multi-agent pipelines |

Use **skills** when you want Claude to decide when to delegate. Use **Orchestrator** when you want explicit, planned, parallel-capable multi-agent workflows with a final synthesized result.
