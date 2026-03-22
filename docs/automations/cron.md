---
id: cron
title: Cron Automations
sidebar_position: 2
---

# Cron Automations

Cron automations run on a schedule. When the schedule fires, the automation calls your agent or runs your custom handler.

## Basic pattern

```typescript
import { Agent, createAutomation, startAutomations } from "invoked";

const reporter = new Agent({
  name: "reporter",
  instructions: "You write concise daily summary reports.",
});

createAutomation("daily-report")
  .cron("0 9 * * *")
  .agent(reporter)
  .prompt("Write today's summary report")
  .start();

await startAutomations();
```

## Cron syntax

```
┌──────────── minute        (0–59)
│ ┌────────── hour           (0–23)
│ │ ┌──────── day of month   (1–31)
│ │ │ ┌────── month          (1–12)
│ │ │ │ ┌──── day of week    (0–6, Sunday=0)
│ │ │ │ │
* * * * *
```

| Expression | Meaning |
|---|---|
| `* * * * *` | Every minute |
| `*/5 * * * *` | Every 5 minutes |
| `0 * * * *` | Every hour |
| `0 9 * * *` | Every day at 9:00 am |
| `0 9 * * 1-5` | Weekdays at 9:00 am |
| `0 0 1 * *` | First day of every month |
| `0 9,17 * * *` | Every day at 9 am and 5 pm |

:::tip
Use [crontab.guru](https://crontab.guru) to build and verify cron expressions.
:::

## Dynamic prompt

```typescript
createAutomation("morning-briefing")
  .cron("0 8 * * 1-5")
  .agent(assistantAgent)
  .prompt((ctx) => {
    const date = new Date(ctx.triggeredAt).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    });
    return `Today is ${date}. Prepare the morning briefing.`;
  })
  .start();
```

The `CronContext`:

```typescript
interface CronContext {
  automation: string;   // automation name
  triggeredAt: string;  // ISO 8601 timestamp
}
```

## Custom handler

```typescript
createAutomation("end-of-day")
  .cron("0 17 * * 1-5")
  .run(async (ctx) => {
    const [metrics, news] = await Promise.all([
      metricsAgent.generate("Pull today's key metrics"),
      newsAgent.generate("Find today's relevant industry news"),
    ]);

    await writerAgent.generate(
      `Combine into an end-of-day briefing:\nMetrics:\n${metrics}\nNews:\n${news}`
    );
  });
```

## Error handling

If a cron handler throws, the error is caught and logged — it will not crash your process. The next scheduled run still fires.

```typescript
await startAutomations({
  onError: (name, err) => {
    console.error(`[ALERT] "${name}" failed:`, err);
  },
});
```

## Type reference

```typescript
interface CronContext {
  automation: string;
  triggeredAt: string;
}

type CronHandler = (ctx: CronContext) => Promise<void> | void;
```
