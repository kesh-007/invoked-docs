---
id: stream
title: agent.stream()
sidebar_position: 3
---

# agent.stream()

Send a prompt and receive an async generator that yields text chunks as they arrive.

## Signature

```typescript
agent.stream(prompt: string, metadata?: Record<string, unknown>): AsyncGenerator<string>
```

## Basic usage

```typescript
for await (const chunk of agent.stream("Write a short story about TypeScript")) {
  process.stdout.write(chunk);
}
```

## In an Express route

```typescript
app.get("/chat", async (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  for await (const chunk of agent.stream(req.query.q as string)) {
    res.write(chunk);
  }
  res.end();
});
```

## In a Next.js API route

```typescript
export async function POST(req: Request) {
  const { prompt } = await req.json();
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of agent.stream(prompt)) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

## When to use

| | `generate()` | `stream()` |
|---|---|---|
| Response delivery | All at once | Chunk by chunk |
| Best for | Scripts, batch jobs | Chat UIs, terminals |
| Output pipelines | ✅ | ✅ |
