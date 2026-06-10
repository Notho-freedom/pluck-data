// Cross-column coherence: detect persona-like clusters in a table and
// resolve values from a single shared persona instance per row.
import type { Column, Persona, Table } from "./types";

export interface CoherenceMap {
  /** column.name → derived field on the persona, or null if not coherent */
  cols: Record<string, keyof Persona | null>;
  isPeople: boolean;
}

export function detectCoherence(table: Table): CoherenceMap {
  const cols: Record<string, keyof Persona | null> = {};
  let isPeople = false;
  for (const c of table.columns) {
    const n = c.name.toLowerCase();
    if (/^email$/.test(n) || /_email$/.test(n)) { cols[c.name] = "email"; isPeople = true; continue; }
    if (/^username$|^login$|^handle$/.test(n)) { cols[c.name] = "username"; isPeople = true; continue; }
    if (/^first.?name$|^prenom$|^given.?name$/.test(n)) { cols[c.name] = "firstName"; isPeople = true; continue; }
    if (/^last.?name$|^surname$|^family.?name$|^nom$/.test(n)) { cols[c.name] = "lastName"; isPeople = true; continue; }
    if (/^full.?name$|^name$|^display.?name$/.test(n)) { cols[c.name] = "fullName"; isPeople = true; continue; }
    if (/^phone$|^mobile$|^tel$/.test(n)) { cols[c.name] = "phone"; continue; }
    if (/^country$/.test(n)) { cols[c.name] = "country"; continue; }
    if (/^country.?code$/.test(n)) { cols[c.name] = "countryCode"; continue; }
    if (/^city$|^ville$/.test(n)) { cols[c.name] = "city"; continue; }
    if (/^zip$|^postal|^cp$|^postcode$/.test(n)) { cols[c.name] = "zip"; continue; }
    if (/^language$|^lang$|^locale$/.test(n)) { cols[c.name] = "language"; continue; }
    if (/^currency$/.test(n)) { cols[c.name] = "currency"; continue; }
    if (/^timezone$|^tz$/.test(n)) { cols[c.name] = "timezone"; continue; }
    if (/^age$/.test(n)) { cols[c.name] = "ageYears"; continue; }
    if (/^gender$|^sex$/.test(n)) { cols[c.name] = "gender"; continue; }
  }
  return { cols, isPeople };
}

export function valueFromPersona(persona: Persona, key: keyof Persona | null): unknown {
  if (!key) return undefined;
  const v = persona[key];
  return v;
}

/** Does a table look like a "people" table? Drives persona usage. */
export function isPeopleTable(table: Table): boolean {
  const n = table.name.toLowerCase();
  if (/users?|customers?|patients?|members?|profiles?|contacts?|employees?|students?|teachers?|doctors?|agents?|leads?|people/.test(n)) return true;
  return detectCoherence(table).isPeople;
}
