import type { Station } from "./types.js";

/** Common VR station codes and aliases for Finnish cities. */
const STATIONS: readonly Station[] = [
  {
    code: "HKI",
    name: "Helsinki",
    aliases: ["helsinki", "helsingfors", "hel"],
  },
  {
    code: "PSL",
    name: "Pasila",
    aliases: ["pasila", "böle", "psl"],
  },
  {
    code: "TKL",
    name: "Tikkurila",
    aliases: ["tikkurila", "tkl", "dickursby"],
  },
  {
    code: "KE",
    name: "Kerava",
    aliases: ["kerava"],
  },
  {
    code: "JP",
    name: "Järvenpää",
    aliases: ["jarvenpaa", "järvenpää"],
  },
  {
    code: "HY",
    name: "Hyvinkää",
    aliases: ["hyvinkaa", "hyvinkää"],
  },
  {
    code: "RI",
    name: "Riihimäki",
    aliases: ["riihimaki", "riihimäki"],
  },
  {
    code: "HL",
    name: "Hämeenlinna",
    aliases: ["hameenlinna", "hämeenlinna"],
  },
  {
    code: "FO",
    name: "Forssa",
    aliases: ["forssa"],
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
    code: "KA",
    name: "Kotka",
    aliases: ["kotka"],
  },
  {
    code: "POH",
    name: "Porvoo",
    aliases: ["porvoo", "borgå"],
  },
  {
    code: "TPE",
    name: "Tampere",
    aliases: ["tampere", "tam"],
  },
  {
    code: "TKU",
    name: "Turku",
    aliases: ["turku", "åbo"],
  },
  {
    code: "SL",
    name: "Salo",
    aliases: ["salo"],
  },
  {
    code: "JY",
    name: "Jyväskylä",
    aliases: ["jyvaskyla", "jyväskylä", "jkl"],
  },
  {
    code: "MI",
    name: "Mikkeli",
    aliases: ["mikkeli"],
  },
  {
    code: "LR",
    name: "Lappeenranta",
    aliases: ["lappeenranta"],
  },
  {
    code: "IMR",
    name: "Imatra",
    aliases: ["imatra"],
  },
  {
    code: "JNS",
    name: "Joensuu",
    aliases: ["joensuu"],
  },
  {
    code: "KUO",
    name: "Kuopio",
    aliases: ["kuopio"],
  },
  {
    code: "ISL",
    name: "Iisalmi",
    aliases: ["iisalmi"],
  },
  {
    code: "PIE",
    name: "Pieksämäki",
    aliases: ["pieksamaki", "pieksämäki"],
  },
  {
    code: "SK",
    name: "Seinäjoki",
    aliases: ["seinajoki", "seinäjoki", "sjk"],
  },
  {
    code: "VS",
    name: "Vaasa",
    aliases: ["vaasa", "vasa", "vsa"],
  },
  {
    code: "KK",
    name: "Kokkola",
    aliases: ["kokkola"],
  },
  {
    code: "YLI",
    name: "Ylivieska",
    aliases: ["ylivieska"],
  },
  {
    code: "RH",
    name: "Raahe",
    aliases: ["raahe"],
  },
  {
    code: "OL",
    name: "Oulu",
    aliases: ["oulu"],
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
    code: "ROI",
    name: "Rovaniemi",
    aliases: ["rovaniemi", "rov"],
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

/** Display names for UI autocomplete (sorted). */
export function listStationDisplayNames(): string[] {
  return [...STATIONS.map((s) => s.name)].sort((a, b) =>
    a.localeCompare(b, "fi")
  );
}

export function formatStation(code: string): string {
  const station = STATIONS.find((s) => s.code === code);
  return station ? `${station.name} (${station.code})` : code;
}
