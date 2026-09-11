import type { Station } from "./types.js";

/** Common VR station codes and aliases for Finnish cities. */
const STATIONS: readonly Station[] = [
  {
    code: "HKI",
    name: "Helsinki",
    aliases: ["helsinki", "helsingfors", "hel"],
  },
  {
    code: "TKU",
    name: "Turku",
    aliases: ["turku", "åbo"],
  },
  {
    code: "TPE",
    name: "Tampere",
    aliases: ["tampere", "tam"],
  },
  {
    code: "PSL",
    name: "Pasila",
    aliases: ["pasila", "böle"],
  },
  {
    code: "OL",
    name: "Oulu",
    aliases: ["oulu"],
  },
  {
    code: "KUO",
    name: "Kuopio",
    aliases: ["kuopio"],
  },
  {
    code: "JY",
    name: "Jyväskylä",
    aliases: ["jyvaskyla", "jyväskylä", "jkl"],
  },
  {
    code: "ROI",
    name: "Rovaniemi",
    aliases: ["rovaniemi", "rov"],
  },
  {
    code: "KAJ",
    name: "Kajaani",
    aliases: ["kajaani"],
  },
  {
    code: "KEM",
    name: "Kemi",
    aliases: ["kemi"],
  },
  {
    code: "LH",
    name: "Lahti",
    aliases: ["lahti"],
  },
  {
    code: "KV",
    name: "Kouvola",
    aliases: ["kouvola"],
  },
  {
    code: "SK",
    name: "Seinäjoki",
    aliases: ["seinajoki", "seinäjoki"],
  },
  {
    code: "RI",
    name: "Riihimäki",
    aliases: ["riihimaki", "riihimäki"],
  },
] as const;

function normalize(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Resolve a user-provided station name or code to a VR station code.
 * Accepts codes (HKI), full names (Helsinki), or aliases.
 */
export function resolveStation(input: string): Station {
  const query = normalize(input);

  const byCode = STATIONS.find((s) => s.code.toLowerCase() === query);
  if (byCode) return byCode;

  const byName = STATIONS.find((s) => normalize(s.name) === query);
  if (byName) return byName;

  const byAlias = STATIONS.find((s) =>
    s.aliases.some((a) => normalize(a) === query)
  );
  if (byAlias) return byAlias;

  const partial = STATIONS.find(
    (s) =>
      normalize(s.name).includes(query) ||
      s.aliases.some((a) => normalize(a).includes(query))
  );
  if (partial) return partial;

  throw new Error(
    `Unknown station "${input}". Try a city name (e.g. Helsinki) or code (e.g. HKI).`
  );
}

export function listStations(): readonly Station[] {
  return STATIONS;
}

export function formatStation(code: string): string {
  const station = STATIONS.find((s) => s.code === code);
  return station ? `${station.name} (${station.code})` : code;
}
