// Generators for rich column types: vector, geo, array, inet, interval, bytea.
import type { Faker } from "@faker-js/faker";
import type { Column } from "./types";

export function parseVectorDim(raw: string | undefined): number {
  const m = raw?.match(/vector\s*\(\s*(\d+)\s*\)/i);
  return m ? Math.max(1, Math.min(4096, Number(m[1]))) : 1536;
}

export function richValue(faker: Faker, col: Column): unknown {
  switch (col.kind) {
    case "vector": {
      const dim = col.meta?.vectorDim ?? parseVectorDim(col.rawType);
      const v: number[] = new Array(dim);
      for (let i = 0; i < dim; i++) v[i] = Math.round(faker.number.float({ min: -1, max: 1 }) * 1000) / 1000;
      return v;
    }
    case "geo-point":
      return {
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
      };
    case "array": {
      const elemKind = col.meta?.arrayOf ?? "string";
      const n = faker.number.int({ min: 1, max: 5 });
      return Array.from({ length: n }, () => {
        if (elemKind === "integer") return faker.number.int({ min: 1, max: 100 });
        if (elemKind === "decimal") return faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
        return faker.lorem.word();
      });
    }
    case "inet":
      return faker.internet.ipv4();
    case "interval":
      return `${faker.number.int({ min: 1, max: 90 })} days`;
    case "bytea":
      return `\\x${faker.string.hexadecimal({ length: 32, casing: "lower", prefix: "" })}`;
    default:
      return undefined;
  }
}
