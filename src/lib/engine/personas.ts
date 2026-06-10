// Persona generator — produces a coherent identity per row used by the
// coherence layer so country/phone/language/avatar stay consistent.
import type { Faker } from "@faker-js/faker";
import type { Persona } from "./types";

const COUNTRY_PROFILES: Record<string, {
  name: string;
  city: string[];
  lang: string;
  currency: string;
  tz: string;
  phonePrefix: string;
}> = {
  FR: { name: "France",        city: ["Paris","Lyon","Marseille","Toulouse"], lang: "fr", currency: "EUR", tz: "Europe/Paris",  phonePrefix: "+33" },
  US: { name: "United States", city: ["New York","San Francisco","Austin","Chicago"], lang: "en", currency: "USD", tz: "America/New_York", phonePrefix: "+1" },
  GB: { name: "United Kingdom",city: ["London","Manchester","Bristol"], lang: "en", currency: "GBP", tz: "Europe/London", phonePrefix: "+44" },
  DE: { name: "Germany",       city: ["Berlin","Munich","Hamburg"], lang: "de", currency: "EUR", tz: "Europe/Berlin", phonePrefix: "+49" },
  ES: { name: "Spain",         city: ["Madrid","Barcelona","Valencia"], lang: "es", currency: "EUR", tz: "Europe/Madrid", phonePrefix: "+34" },
  JP: { name: "Japan",         city: ["Tokyo","Osaka","Kyoto"], lang: "ja", currency: "JPY", tz: "Asia/Tokyo", phonePrefix: "+81" },
  BR: { name: "Brazil",        city: ["São Paulo","Rio de Janeiro"], lang: "pt", currency: "BRL", tz: "America/Sao_Paulo", phonePrefix: "+55" },
  IT: { name: "Italy",         city: ["Rome","Milan","Florence"], lang: "it", currency: "EUR", tz: "Europe/Rome", phonePrefix: "+39" },
};

const LOCALE_TO_COUNTRY: Record<string, string> = {
  fr: "FR", en: "US", en_US: "US", en_GB: "GB",
  es: "ES", de: "DE", it: "IT", ja: "JP", pt_BR: "BR", pt: "BR",
};

function slugify(s: string): string {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".").replace(/^\.|\.$/g, "");
}

export function makePersona(faker: Faker, locale: string | undefined, index: number): Persona {
  // Distribute most personas in the requested locale country, with 15% diversity.
  const primaryCC = LOCALE_TO_COUNTRY[locale ?? "en"] ?? "US";
  const codes = Object.keys(COUNTRY_PROFILES);
  const cc = faker.number.float({ min: 0, max: 1 }) < 0.85
    ? primaryCC
    : faker.helpers.arrayElement(codes);
  const country = COUNTRY_PROFILES[cc]!;

  const gender = faker.helpers.arrayElement(["male", "female"] as const);
  const firstName = faker.person.firstName(gender);
  const lastName  = faker.person.lastName(gender);
  const fullName  = `${firstName} ${lastName}`;
  const username  = `${slugify(firstName)}.${slugify(lastName)}${faker.number.int({ min: 0, max: 99 })}`;
  const emailDomain = faker.helpers.arrayElement(["example.com","gmail.com","outlook.com","proton.me"]);
  const email     = `${slugify(firstName)}.${slugify(lastName)}@${emailDomain}`;
  const city      = faker.helpers.arrayElement(country.city);
  const zip       = faker.location.zipCode({ state: cc === "US" ? "CA" : undefined });
  const phone     = `${country.phonePrefix} ${faker.number.int({ min: 100, max: 999 })} ${faker.number.int({ min: 100, max: 999 })} ${faker.number.int({ min: 100, max: 999 })}`;
  const avatarSeed = `${slugify(firstName)}-${slugify(lastName)}-${index}`;

  return {
    firstName, lastName, fullName, email, username, phone,
    avatarSeed,
    country: country.name,
    countryCode: cc,
    city, zip,
    language: country.lang,
    currency: country.currency,
    timezone: country.tz,
    gender,
    ageYears: faker.number.int({ min: 18, max: 72 }),
  };
}
