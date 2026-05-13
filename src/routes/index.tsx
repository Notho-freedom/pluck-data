import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DataSeed API — Génère des données de démo depuis ton schéma" },
      {
        name: "description",
        content:
          "API qui transforme un schéma SQL ou JSON en données de démonstration cohérentes (SQL, JSON, CSV, TypeScript, Python).",
      },
    ],
  }),
  component: Playground,
});

const EXAMPLE_SQL = `CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  created_at TIMESTAMP
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP
);`;

function Playground() {
  const [schema, setSchema] = useState(EXAMPLE_SQL);
  const [format, setFormat] = useState<"sql" | "json" | "csv" | "typescript" | "python">("sql");
  const [rows, setRows] = useState(5);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const res = await fetch("/api/public/v1/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { type: "auto", files: [{ name: "schema.sql", content: schema }] },
          output: { format, mode: "single" },
          options: { rowsPerTable: { default: rows }, seed: 42 },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setOutput(
        typeof data.output.single === "string"
          ? data.output.single
          : JSON.stringify(data.output, null, 2),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            DataSeed <span className="text-muted-foreground font-normal">API</span>
          </h1>
          <a
            href="/api/public/v1/generate"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            POST /api/public/v1/generate
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Génère des données de démo depuis ton schéma
          </h2>
          <p className="mt-2 text-muted-foreground max-w-2xl">
            Envoie un schéma SQL ou JSON, choisis le format de sortie, récupère des données
            réalistes avec les relations préservées (clés étrangères respectées).
          </p>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Schéma d'entrée</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                className="font-mono text-xs min-h-[320px]"
                placeholder="Colle ton CREATE TABLE ou ton JSON Schema ici..."
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="format">Format de sortie</Label>
                  <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sql">SQL (INSERT)</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rows">Lignes par table</Label>
                  <Input
                    id="rows"
                    type="number"
                    min={1}
                    max={500}
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                  />
                </div>
              </div>
              <Button onClick={generate} disabled={loading} className="w-full">
                {loading ? "Génération..." : "Générer"}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Résultat</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={output}
                readOnly
                className="font-mono text-xs min-h-[420px]"
                placeholder="Le résultat apparaîtra ici..."
              />
            </CardContent>
          </Card>
        </div>

        <section className="mt-12 prose prose-sm max-w-none">
          <h3 className="text-lg font-semibold">Utiliser l'API depuis ton code</h3>
          <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
{`curl -X POST ${typeof window !== "undefined" ? window.location.origin : ""}/api/public/v1/generate \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": { "type": "sql", "files": [{ "name": "schema.sql", "content": "CREATE TABLE ..." }] },
    "output": { "format": "sql", "mode": "single", "sql_dialect": "postgres" },
    "options": { "rowsPerTable": { "default": 10 }, "seed": 42 }
  }'`}
          </pre>
          <p className="text-muted-foreground text-sm mt-4">
            Phase 1 — moteur de génération + endpoint public. Auth par clé API, quotas, IA
            d'enrichissement et formats supplémentaires arrivent dans les phases suivantes.
          </p>
        </section>
      </main>
    </div>
  );
}
