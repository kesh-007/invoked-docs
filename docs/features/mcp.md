---
id: mcp
title: MCP Servers
sidebar_position: 4
---

# MCP Servers

Agents can connect to any [Model Context Protocol](https://modelcontextprotocol.io) server, giving Claude access to tools and resources from the wider MCP ecosystem — databases, file systems, APIs, and more.

Pass a `mcpServers` map to your agent. Each key is a server name, each value is a connection config.

## Stdio server

Stdio servers run as a local subprocess. Most published MCP servers use this transport.

```typescript
const agent = new Agent({
  name: "coder",
  instructions: "You help with code tasks.",
  mcpServers: {
    filesystem: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "./src"],
    },
  },
});
```

| Option | Type | Description |
|---|---|---|
| `command` | `string` | Executable to run |
| `args` | `string[]` | Arguments passed to the process |
| `env` | `Record<string, string>` | Extra environment variables |

## SSE server

SSE servers are remote HTTP servers that stream events.

```typescript
const agent = new Agent({
  name: "assistant",
  instructions: "You are a helpful assistant.",
  mcpServers: {
    myApi: {
      type: "sse",
      url: "https://my-mcp-server.com/sse",
      headers: { Authorization: "Bearer my-token" },
    },
  },
});
```

| Option | Type | Description |
|---|---|---|
| `type` | `"sse"` | Must be `"sse"` |
| `url` | `string` | Full URL to the SSE endpoint |
| `headers` | `Record<string, string>` | Optional request headers |

## Multiple servers

You can connect to as many servers as you need:

```typescript
const agent = new Agent({
  name: "analyst",
  instructions: "You analyse data and write reports.",
  mcpServers: {
    filesystem: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-filesystem", "./data"],
    },
    postgres: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-postgres", process.env.DATABASE_URL!],
    },
  },
});
```

## Combining with tools and allowedTools

MCP servers, custom `tools`, and `allowedTools` all work together — Claude can call any of them:

```typescript
const agent = new Agent({
  name: "researcher",
  instructions: "You research and summarise information.",
  allowedTools: ["WebSearch", "WebFetch"],
  tools: [myCustomTool],
  mcpServers: {
    filesystem: { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem", "./"] },
  },
});
```

## Finding MCP servers

Browse available servers at [modelcontextprotocol.io/servers](https://modelcontextprotocol.io/servers) or search npm for `@modelcontextprotocol/server-*`.
