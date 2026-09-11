import axios, { type AxiosError } from "axios";
import { filterTripsByArrivalWindow } from "./arrival-window.js";
import { generateMockDayResult } from "./mock-data.js";
import { passengerPriceMultiplier } from "./passengers.js";
import { PlaywrightVrClient } from "./playwright-client.js";
import { buildSearchQuery } from "./search-url.js";
import type {
  DaySearchResult,
  TripSearchParams,
  VrClientOptions,
} from "./types.js";
import { VrClientError } from "./types.js";

/** VR Matkalla GraphQL endpoint (Apollo Client on vr.fi). */
const DEFAULT_GRAPHQL_URL = "https://www.vr.fi/api/v7";

export interface VrClient {
  searchDay(params: TripSearchParams): Promise<DaySearchResult>;
  close?(): Promise<void>;
}

/**
 * Live client: prefers Playwright (handles AWS WAF / session cookies),
 * with a GraphQL POST stub for future persisted-query integration.
 */
export class LiveVrClient implements VrClient {
  private readonly playwright: PlaywrightVrClient;
  private readonly graphqlUrl: string;
  private readonly timeoutMs: number;

  constructor(options: VrClientOptions = {}) {
    this.graphqlUrl = options.baseUrl ?? DEFAULT_GRAPHQL_URL;
    this.timeoutMs = options.timeoutMs ?? 45_000;
    this.playwright = new PlaywrightVrClient(
      "https://www.vr.fi",
      this.timeoutMs
    );
  }

  async searchDay(params: TripSearchParams): Promise<DaySearchResult> {
    try {
      return await this.playwright.searchDay(params);
    } catch (err) {
      if (err instanceof VrClientError && err.code === "BOT_PROTECTION") {
        throw err;
      }
      // GraphQL fallback is not yet wired to persisted queries; surface clearly.
      throw new VrClientError(
        `Live VR search failed. ${err instanceof Error ? err.message : String(err)}`,
        err instanceof VrClientError ? err.code : "UNKNOWN",
        err
      );
    }
  }

  async close(): Promise<void> {
    await this.playwright.close();
  }
}

export class MockVrClient implements VrClient {
  async searchDay(params: TripSearchParams): Promise<DaySearchResult> {
    await new Promise((r) => setTimeout(r, 120 + Math.random() * 180));
    const result = generateMockDayResult(params);
    return result;
  }
}

export function createVrClient(options: VrClientOptions = {}): VrClient {
  if (options.mock ?? process.env.VR_MINER_MOCK === "1") {
    return new MockVrClient();
  }
  return new LiveVrClient(options);
}

/** Reserved for GraphQL persisted-query integration (vr.fi/api/v7). */
export async function postGraphqlSearch(
  params: TripSearchParams,
  graphqlUrl: string = DEFAULT_GRAPHQL_URL
): Promise<unknown> {
  const query = buildSearchQuery(params);
  const payload = {
    operationName: "CreateSeriesBundleOffers",
    variables: {
      input: {
        from: query.from,
        to: query.to,
        outboundDate: query.outboundDate,
        passengers: [{ type: query.passengerType, amount: 1 }],
      },
    },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: process.env.VR_GRAPHQL_HASH ?? "",
      },
    },
  };

  if (!process.env.VR_GRAPHQL_HASH) {
    throw new VrClientError(
      "GraphQL persisted query hash not configured (VR_GRAPHQL_HASH)",
      "UNKNOWN"
    );
  }

  try {
    const response = await axios.post(graphqlUrl, payload, {
      timeout: 15_000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "vr-ticker-miner/0.1.0",
      },
    });
    return response.data;
  } catch (err) {
    throw mapAxiosError(err);
  }
}

export function applyPassengerPricing(
  result: DaySearchResult,
  params: TripSearchParams
): DaySearchResult {
  const mult = passengerPriceMultiplier(params.passengerType);
  if (mult === 1) return result;

  const trips = result.trips.map((t) => {
    const offers = t.offers.map((o) => ({
      ...o,
      priceCents: Math.round(o.priceCents * mult),
    }));
    const cheapest = offers.reduce((min, o) =>
      o.priceCents < min.priceCents ? o : min
    );
    return { ...t, offers, cheapestOffer: cheapest };
  });

  return { ...result, trips };
}

export interface FinalizeOptions {
  /** Apply student/adult price multiplier (mock only; live prices come from VR). */
  adjustPassengerPricing?: boolean;
}

export function finalizeDayResult(
  result: DaySearchResult,
  params: TripSearchParams,
  options: FinalizeOptions = {}
): DaySearchResult {
  let { trips } = result;
  if (params.arrivalWindow) {
    trips = filterTripsByArrivalWindow(
      trips,
      params.date,
      params.arrivalWindow
    );
  }
  if (options.adjustPassengerPricing) {
    trips = applyPassengerPricing({ ...result, trips }, params).trips;
  }
  trips.sort((a, b) => a.cheapestOffer.priceCents - b.cheapestOffer.priceCents);

  return {
    ...result,
    trips,
    error:
      result.error ??
      (trips.length === 0 ? "No trips in arrival window" : undefined),
  };
}

function mapAxiosError(err: unknown): VrClientError {
  if (!axios.isAxiosError(err)) {
    return new VrClientError("Unexpected error during VR request", "UNKNOWN", err);
  }

  const axiosErr = err as AxiosError;
  const status = axiosErr.response?.status;

  if (status === 429) {
    return new VrClientError("Rate limited by VR API", "RATE_LIMITED", err);
  }
  if (status === 403 || status === 401) {
    return new VrClientError(
      "Bot protection or authentication required",
      "BOT_PROTECTION",
      err
    );
  }
  if (status === 404) {
    return new VrClientError("Route or endpoint not found", "NOT_FOUND", err);
  }
  if (axiosErr.code === "ECONNABORTED" || axiosErr.code === "ERR_NETWORK") {
    return new VrClientError("Network error contacting VR", "NETWORK", err);
  }

  return new VrClientError(
    axiosErr.message ?? "VR API request failed",
    "UNKNOWN",
    err
  );
}
