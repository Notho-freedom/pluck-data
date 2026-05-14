import { createFileRoute } from "@tanstack/react-router";
import { SUPPORTED_FORMATS, SUPPORTED_DIALECTS, SUPPORTED_LOCALES } from "@/lib/engine/formats";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export const Route = createFileRoute("/api/public/v1/formats")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async () =>
        new Response(
          JSON.stringify({
            formats: SUPPORTED_FORMATS,
            sql_dialects: SUPPORTED_DIALECTS,
            locales: SUPPORTED_LOCALES,
            modes: ["single", "per-table"],
            ai_modes: ["off", "validate", "fill-gaps", "full"],
          }),
          { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
        ),
    },
  },
});
