// Heuristic domain detection from table/column names. No AI needed — used to
// pick better generators (medical, e-commerce, finance, education, etc.).
import type { UnifiedSchema } from "./types";

export type Domain =
  | "medical" | "ecommerce" | "crm" | "saas" | "education"
  | "finance" | "logistics" | "realestate" | "social" | "chat"
  | "blog" | "generic";

const SIGNALS: Record<Domain, RegExp[]> = {
  medical:    [/patients?/i, /doctors?/i, /appointments?/i, /diagnos/i, /prescriptions?/i, /medical/i, /clinics?/i],
  ecommerce:  [/products?/i, /orders?/i, /carts?/i, /skus?/i, /checkouts?/i, /shipments?/i, /catalog/i],
  crm:        [/leads?/i, /deals?/i, /pipelines?/i, /opportunit/i, /accounts?/i, /contacts?/i, /campaigns?/i],
  saas:       [/subscriptions?/i, /plans?/i, /tenants?/i, /workspaces?/i, /seats?/i, /invoices?/i],
  education:  [/students?/i, /courses?/i, /lessons?/i, /enrollments?/i, /grades?/i, /teachers?/i],
  finance:    [/transactions?/i, /accounts?/i, /payments?/i, /ledgers?/i, /invoices?/i, /balances?/i],
  logistics:  [/warehouses?/i, /shipments?/i, /trackings?/i, /carriers?/i, /routes?/i, /deliveries/i],
  realestate: [/listings?/i, /properties?/i, /agents?/i, /viewings?/i, /tenants?/i, /leases?/i],
  social:     [/follow/i, /likes?/i, /reactions?/i, /feed/i],
  chat:       [/messages?/i, /conversations?/i, /channels?/i, /threads?/i, /participants?/i],
  blog:       [/posts?/i, /articles?/i, /comments?/i, /authors?/i, /tags?/i, /categories/i],
  generic:    [],
};

export function detectDomain(schema: UnifiedSchema): Domain {
  const haystack = schema.tables
    .map((t) => `${t.name} ${t.columns.map((c) => c.name).join(" ")}`)
    .join(" ").toLowerCase();
  let best: { d: Domain; score: number } = { d: "generic", score: 0 };
  for (const [d, regs] of Object.entries(SIGNALS) as Array<[Domain, RegExp[]]>) {
    let s = 0;
    for (const r of regs) if (r.test(haystack)) s++;
    if (s > best.score) best = { d, score: s };
  }
  return best.score >= 2 ? best.d : (best.score === 1 ? best.d : "generic");
}

/** Domain-specific value pickers — invoked by generator after byName fails. */
export interface DomainContext { faker: any; column: string; table: string; domain: Domain }

export function domainValue(ctx: DomainContext): unknown {
  const { faker, column, table, domain } = ctx;
  const n = column.toLowerCase();
  const t = table.toLowerCase();
  switch (domain) {
    case "medical":
      if (/specialty|specialit/.test(n)) return faker.helpers.arrayElement(["Cardiology","Dermatology","Pediatrics","Neurology","Oncology","Orthopedics","Psychiatry","Radiology"]);
      if (/diagnos/.test(n)) return faker.helpers.arrayElement(["Hypertension","Type 2 diabetes","Asthma","Migraine","Anxiety disorder","Lower back pain"]);
      if (/blood_?type/.test(n)) return faker.helpers.arrayElement(["O+","O-","A+","A-","B+","B-","AB+","AB-"]);
      if (/dosage|dose/.test(n)) return `${faker.number.int({ min: 5, max: 500 })} mg`;
      if (/prescription/.test(n)) return faker.helpers.arrayElement(["Amoxicillin 500mg","Ibuprofen 400mg","Paracetamol 1g","Metformin 850mg"]);
      break;
    case "ecommerce":
      if (/sku/.test(n)) return `SKU-${faker.string.alphanumeric(8).toUpperCase()}`;
      if (/barcode|ean/.test(n)) return String(faker.number.int({ min: 1e12, max: 9.99e12 }));
      if (/category/.test(n)) return faker.commerce.department();
      if (/brand/.test(n)) return faker.company.name();
      if (t.includes("product") && /name|title/.test(n)) return faker.commerce.productName();
      if (/material/.test(n)) return faker.commerce.productMaterial();
      if (/weight/.test(n)) return faker.number.float({ min: 0.05, max: 25, fractionDigits: 2 });
      if (/discount/.test(n)) return faker.number.int({ min: 0, max: 50 });
      break;
    case "crm":
      if (/stage|status/.test(n)) return faker.helpers.arrayElement(["lead","qualified","proposal","negotiation","won","lost"]);
      if (/source/.test(n)) return faker.helpers.arrayElement(["inbound","outbound","referral","event","ads","organic"]);
      if (/probability/.test(n)) return faker.number.int({ min: 5, max: 95 });
      if (/deal_?value|amount/.test(n)) return faker.number.int({ min: 1000, max: 250000 });
      break;
    case "saas":
      if (/plan/.test(n)) return faker.helpers.arrayElement(["free","starter","pro","team","enterprise"]);
      if (/mrr|arr/.test(n)) return faker.number.int({ min: 0, max: 50000 });
      if (/seats|quantity/.test(n)) return faker.number.int({ min: 1, max: 200 });
      if (/feature_?flag/.test(n)) return faker.datatype.boolean();
      break;
    case "education":
      if (/grade|score/.test(n)) return faker.number.int({ min: 40, max: 100 });
      if (/course|subject/.test(n)) return faker.helpers.arrayElement(["Algebra","Biology","World History","Programming 101","Literature","Physics","Chemistry","Statistics"]);
      if (/level/.test(n)) return faker.helpers.arrayElement(["beginner","intermediate","advanced"]);
      break;
    case "finance":
      if (/currency/.test(n)) return faker.finance.currencyCode();
      if (/iban/.test(n)) return faker.finance.iban();
      if (/bic|swift/.test(n)) return faker.finance.bic();
      if (/account_?number/.test(n)) return faker.finance.accountNumber();
      if (/transaction_?type/.test(n)) return faker.helpers.arrayElement(["debit","credit","transfer","refund","fee"]);
      if (/amount|balance/.test(n)) return faker.number.float({ min: -5000, max: 50000, fractionDigits: 2 });
      break;
    case "logistics":
      if (/tracking/.test(n)) return `TRK${faker.string.alphanumeric(10).toUpperCase()}`;
      if (/carrier/.test(n)) return faker.helpers.arrayElement(["DHL","UPS","FedEx","La Poste","Chronopost","Royal Mail"]);
      if (/status/.test(n)) return faker.helpers.arrayElement(["pending","picked","in_transit","delivered","returned"]);
      break;
    case "realestate":
      if (/bedrooms?/.test(n)) return faker.number.int({ min: 1, max: 6 });
      if (/bathrooms?/.test(n)) return faker.number.int({ min: 1, max: 4 });
      if (/surface|area|sqm|sqft/.test(n)) return faker.number.int({ min: 25, max: 350 });
      if (/property_?type/.test(n)) return faker.helpers.arrayElement(["apartment","house","studio","loft","villa","townhouse"]);
      if (/listing_?status/.test(n)) return faker.helpers.arrayElement(["draft","active","under_offer","sold","withdrawn"]);
      break;
  }
  return undefined;
}
