import { createFileRoute } from "@tanstack/react-router";
import { createMcpServer } from "mcp-tanstack-start";
import { analyzeSchemaTool, generateSeedTool } from "@/lib/mcp/tools";

const mcp = createMcpServer({
  name: "dataseed",
  version: "1.0.0",
  instructions:
    "DataSeed: turn a database schema into realistic seed data. Use analyze_schema first to inspect, then generate_seed to produce rows. Supports SQL DDL, Prisma, Drizzle, Zod, OpenAPI, JSON Schema.",
  tools: [analyzeSchemaTool, generateSeedTool],
});

const methodNotAllowed = () =>
  new Response(JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null }),
    { status: 405, headers: { "Content-Type": "application/json", Allow: "POST, OPTIONS" } });

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      POST: async ({ request }) => mcp.handleRequest(request),
      GET: async () => methodNotAllowed(),
      DELETE: async () => methodNotAllowed(),
    },
  },
});
