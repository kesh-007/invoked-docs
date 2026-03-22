---
id: webhooks
title: Webhook Automations
sidebar_position: 3
---

# Webhook Automations

Webhook automations expose HTTP endpoints that trigger your agents when called. The response is returned as JSON automatically.

## Basic pattern

```typescript
import { Agent, createAutomation, startAutomations } from "invoked";

const assistant = new Agent({
  name: "assistant",
  instructions: "You are a helpful assistant.",
});

createAutomation("ask")
  .webhook("/ask", { method: "POST" })
  .agent(assistant)
  .prompt((req) => {
    const body = req.body as { question: string };
    return body.question;
  })
  .start();

await startAutomations({ port: 3000 });
```

`POST http://localhost:3000/ask` with `{ "question": "What is TypeScript?" }` returns:

```json
{ "ok": true, "result": "TypeScript is a typed superset of JavaScript..." }
```

## HTTP methods

```typescript
.webhook("/path")                         // defaults to POST
.webhook("/path", { method: "GET" })
.webhook("/path", { method: "POST" })
.webhook("/path", { method: "PUT" })
.webhook("/path", { method: "DELETE" })
```

## The request object

```typescript
interface WebhookRequest {
  method: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  query: Record<string, string | string[] | undefined>;
}
```

### Reading the body

```typescript
createAutomation("process-order")
  .webhook("/orders", { method: "POST" })
  .run(async (req, ctx) => {
    const order = req.body as { id: string; items: string[]; total: number };
    await orderAgent.generate(`Process order ${order.id}`);
    return { received: true, orderId: order.id };
  });
```

### Reading query params

```typescript
// GET /search?q=typescript&limit=5
createAutomation("search")
  .webhook("/search", { method: "GET" })
  .run(async (req) => {
    const q = req.query.q as string;
    return searchAgent.generate(`Search for "${q}"`);
  });
```

### Auth via headers

```typescript
createAutomation("secured")
  .webhook("/secure", { method: "POST" })
  .run(async (req) => {
    const token = req.headers["x-api-key"] as string;
    if (token !== process.env.WEBHOOK_SECRET) {
      throw new Error("Unauthorized");
    }
    return myAgent.generate("Do the secure thing");
  });
```

## Response format

### Success
```json
{ "ok": true, "result": "..." }
```

### Error (handler throws)
```json
{ "ok": false, "error": "Automation failed" }
```

### Not found
```json
{ "error": "No automation for this route" }
```

## Error handling

```typescript
await startAutomations({
  onError: (name, err) => {
    console.error(`Webhook "${name}" failed:`, err);
  },
});
```

## Type reference

```typescript
interface WebhookRequest {
  method: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  query: Record<string, string | string[] | undefined>;
}

interface WebhookContext {
  automation: string;
  triggeredAt: string;
}

type WebhookHandler = (
  req: WebhookRequest,
  ctx: WebhookContext
) => Promise<unknown> | unknown;
```

## Testing with curl

```bash
curl -X POST http://localhost:3000/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "What is TypeScript?"}'
```
