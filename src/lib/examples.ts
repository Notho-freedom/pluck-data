export interface SchemaExample {
  id: string;
  label: string;
  description: string;
  icon: string;
  schema: string;
  suggestedFormat?: "sql" | "json" | "csv" | "typescript" | "python";
  suggestedLocale?: string;
}

export const EXAMPLES: SchemaExample[] = [
  {
    id: "chat",
    label: "Chat app",
    description: "Users, conversations, messages with realistic threads.",
    icon: "💬",
    suggestedFormat: "sql",
    suggestedLocale: "fr",
    schema: `CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  title VARCHAR(120),
  created_at TIMESTAMP
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  user_id UUID REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP
);`,
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    description: "Products, orders, customers — full FK chain.",
    icon: "🛒",
    suggestedFormat: "sql",
    schema: `CREATE TABLE customers (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(100),
  country VARCHAR(2),
  created_at TIMESTAMP
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  sku VARCHAR(40) UNIQUE,
  name VARCHAR(120),
  price DECIMAL(10,2),
  stock INT
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  product_id UUID REFERENCES products(id),
  quantity INT,
  total DECIMAL(10,2),
  created_at TIMESTAMP
);`,
  },
  {
    id: "saas",
    label: "SaaS billing",
    description: "Accounts, subscriptions, invoices.",
    icon: "💳",
    suggestedFormat: "json",
    schema: `CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  workspace_name VARCHAR(100),
  owner_email VARCHAR(255),
  plan VARCHAR(20),
  created_at TIMESTAMP
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),
  status VARCHAR(20),
  current_period_end TIMESTAMP,
  amount_cents INT
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id),
  amount_cents INT,
  paid BOOLEAN,
  issued_at TIMESTAMP
);`,
  },
  {
    id: "blog",
    label: "Blog CMS",
    description: "Authors, posts, comments. Markdown-ready.",
    icon: "📝",
    suggestedFormat: "json",
    schema: `CREATE TABLE authors (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(100),
  bio TEXT
);

CREATE TABLE posts (
  id UUID PRIMARY KEY,
  author_id UUID REFERENCES authors(id),
  title VARCHAR(200),
  slug VARCHAR(200) UNIQUE,
  content TEXT,
  published_at TIMESTAMP
);

CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  author_email VARCHAR(255),
  content TEXT,
  created_at TIMESTAMP
);`,
  },
  {
    id: "crm",
    label: "CRM",
    description: "Companies, contacts, deals pipeline.",
    icon: "🤝",
    suggestedFormat: "csv",
    schema: `CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name VARCHAR(120),
  domain VARCHAR(120),
  industry VARCHAR(60),
  size INT
);

CREATE TABLE contacts (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  email VARCHAR(255),
  full_name VARCHAR(100),
  phone VARCHAR(30),
  title VARCHAR(80)
);

CREATE TABLE deals (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  contact_id UUID REFERENCES contacts(id),
  stage VARCHAR(30),
  amount DECIMAL(12,2),
  expected_close TIMESTAMP
);`,
  },
  {
    id: "analytics",
    label: "Analytics events",
    description: "Flat event stream — sessions and actions.",
    icon: "📊",
    suggestedFormat: "json",
    schema: `CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID,
  device VARCHAR(20),
  country VARCHAR(2),
  started_at TIMESTAMP
);

CREATE TABLE events (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  name VARCHAR(60),
  properties TEXT,
  occurred_at TIMESTAMP
);`,
  },
];
