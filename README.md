# DataSeed

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-1.x-FF4154)
![Supabase](https://img.shields.io/badge/Supabase-backend-3ECF8E?logo=supabase&logoColor=white)

**DataSeed** is a seed-data infrastructure product for software projects and AI coding agents. The current web application turns database schemas into coherent demo datasets and exposes an MCP-oriented workflow for agent tooling.

> **Current status:** the landing/product surface describes a v1 API and MCP-native product. Treat external API availability and production guarantees as separate from the UI documented here.

## What the product is designed to do

DataSeed accepts schemas in formats such as:

- SQL DDL
- Prisma
- Drizzle
- Zod
- OpenAPI
- JSON Schema

It is designed to generate data that respects relationships and domain constraints, including foreign-key ordering, locales, personas and domain-specific values.

The product surface currently advertises:

- Schema analysis
- Coherent, foreign-key-safe seed data
- Persona and locale-aware generation
- SQL, JSON, CSV, TypeScript and Python output concepts
- Direct PostgreSQL / Supabase / Neon insertion concepts
- Deterministic generation by seed
- MCP access for coding agents
- Playground and documentation areas

## Agent workflow

The landing page presents DataSeed as an MCP-native service for coding agents. The advertised tool surface includes operations such as schema analysis, seed generation, database insertion and preset management.

The project also includes examples for direct HTTP usage from JavaScript/TypeScript workflows.

## Tech stack

- **React 19 + TypeScript**
- **TanStack Start / TanStack Router**
- **Vite 7**
- **Tailwind CSS 4**
- **Supabase** integration
- **Neon serverless client**
- **Model Context Protocol SDK**
- **TanStack Query**
- **Cloudflare Vite plugin**
- **Zod** for validation
- **Recharts** and Radix UI primitives

## Development

### Requirements

- Node.js
- npm

### Install

```bash
npm install
```

### Development server

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

### Lint and formatting

```bash
npm run lint
npm run format
```

## Project structure

```text
src/
├── components/       # UI, marketing, code and landing components
├── routes/           # TanStack Start routes
├── assets/           # Product illustrations
└── ...
```

## Product identity

The repository is named `pluck-data`, while the current application presents the product as **DataSeed**. This README follows the product identity exposed by the application rather than the repository name.

## Status

This repository currently contains the DataSeed product/marketing application and its supporting frontend stack. The README intentionally avoids claiming that every advertised backend capability is already production-ready unless it is directly verifiable from the repository.

## License

No explicit license file was identified in the current repository. Treat the project as **all rights reserved** unless a license is added.