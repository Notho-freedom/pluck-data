// AI helpers — Lovable AI Gateway. Used by the engine for analysis/validation.
// Server-only (reads process.env.LOVABLE_API_KEY).

const URL_GW = "https://ai.gateway.lovable.dev/v1/chat/completions";

export interface AiAnalysis {
  domain: string;
  columnHints: Record<string, string>;
}

const MODEL = "google/gemini-2.5-flash";

async function chat(messages: any[], tools?: any[]): Promise<any> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch(URL_GW, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(tools ? { tools, tool_choice: "auto" } : {}),
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI gateway ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json();
}

export async function analyzeSchema(
  schemaSummary: { tables: { name: string; columns: { name: string; kind: string }[] }[] },
): Promise<AiAnalysis> {
  const sys =
    "You are a database analyst. Given a schema, identify the business domain and suggest realistic data generators for ambiguous columns. Be brief.";
  const user = JSON.stringify(schemaSummary);
  const tools = [
    {
      type: "function",
      function: {
        name: "set_analysis",
        description: "Return the schema analysis",
        parameters: {
          type: "object",
          properties: {
            domain: { type: "string", description: "Business domain like 'chat app', 'e-commerce'" },
            columnHints: {
              type: "object",
              description: "Map of 'table.column' to a generator hint (one of: name,email,bio,title,company,product,address,phone,url,sentence,paragraph,uuid,date,price)",
              additionalProperties: { type: "string" },
            },
          },
          required: ["domain", "columnHints"],
        },
      },
    },
  ];
  const res = await chat(
    [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    tools,
  );
  const call = res.choices?.[0]?.message?.tool_calls?.[0];
  if (call?.function?.arguments) {
    try {
      return JSON.parse(call.function.arguments);
    } catch {
      /* ignore */
    }
  }
  return { domain: "unknown", columnHints: {} };
}

export interface AiValidation {
  ok: boolean;
  issues: string[];
}

export async function validateSample(
  sample: Record<string, unknown[]>,
  domain: string,
): Promise<AiValidation> {
  const res = await chat([
    {
      role: "system",
      content:
        "You validate generated demo data. Reply with strict JSON: {\"ok\":bool,\"issues\":string[]}. Issues are SHORT human-readable strings.",
    },
    {
      role: "user",
      content: `Domain: ${domain}\nSample (first rows per table):\n${JSON.stringify(sample).slice(0, 4000)}`,
    },
  ]);
  const text = res.choices?.[0]?.message?.content ?? "{}";
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      const parsed = JSON.parse(m[0]);
      return {
        ok: !!parsed.ok,
        issues: Array.isArray(parsed.issues) ? parsed.issues.slice(0, 10).map(String) : [],
      };
    }
  } catch {
    /* ignore */
  }
  return { ok: true, issues: [] };
}
