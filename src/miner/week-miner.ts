import {
  addDays,
  format,
  setISOWeek,
  startOfDay,
  startOfISOWeek,
  startOfWeek,
} from "date-fns";
import {
  createVrClient,
  finalizeDayResult,
  type VrClient,
} from "../core/vr-client.js";
import { RateLimiter } from "../core/rate-limiter.js";
import { resolveStation } from "../core/stations.js";
import type { DaySearchResult, TripResult } from "../core/types.js";
import { VrClientError } from "../core/types.js";
import type {
  DayBestOption,
  WeekMinerOptions,
  WeekMiningResult,
} from "./types.js";

const DEFAULT_DELAY_MS = 800;
const DAY_COUNT = 14;

//const MAX_DAY_COUNT = 7;
//const MIN_DAY_COUNT = 7;


export class WeekMiner {
  private readonly client: VrClient;
  private readonly limiter: RateLimiter;

  constructor(
    private readonly options: WeekMinerOptions,
    client?: VrClient
  ) {
    this.client =
      client ??
      createVrClient({
        mock: options.mock,
      });
    this.limiter = new RateLimiter(options.requestDelayMs ?? DEFAULT_DELAY_MS);
  }

  async mine(): Promise<WeekMiningResult> {
    const originStation = resolveStation(this.options.origin);
    const destStation = resolveStation(this.options.destination);
    const searchOrigin = this.options.returnTrip ? destStation : originStation;
    const searchDestination = this.options.returnTrip
      ? originStation
      : destStation;

    const rangeStart = resolveRangeStart(this.options);
    const rangeEnd = addDays(rangeStart, DAY_COUNT - 1);
    const dates = Array.from({ length: DAY_COUNT }, (_, i) =>
      addDays(rangeStart, i)
    );

    const raw: DaySearchResult[] = [];
    const days: DayBestOption[] = [];

    try {
      for (const date of dates) {
        const result = await this.limiter.schedule(async () => {
          try {
            const searchParams = {
              origin: searchOrigin.code,
              destination: searchDestination.code,
              date,
              passengerType: this.options.passengerType,
              arrivalWindow: this.options.arrivalWindow,
            };

            const dayResult = await this.client.searchDay(searchParams);
            return finalizeDayResult(dayResult, searchParams, {
              adjustPassengerPricing: this.options.mock ?? false,
            });
          } catch (err) {
            return mapSearchError(
              date,
              searchOrigin.code,
              searchDestination.code,
              err
            );
          }
        });

        raw.push(result);
        days.push(pickBestForDay(result));
      }
    } finally {
      await this.client.close?.();
    }

    const successful = days.filter((d) => !d.error && d.matchingTrips.length > 0);
    const overallCheapest =
      successful.length > 0
        ? successful.reduce((min, d) =>
            d.cheapestOffer.priceCents < min.cheapestOffer.priceCents ? d : min
          )
        : null;

    return {
      origin: searchOrigin.code,
      destination: searchDestination.code,
      passengerType: this.options.passengerType,
      arrivalWindow: this.options.arrivalWindow,
      rangeStart,
      rangeEnd,
      days,
      overallCheapest,
      raw,
    };
  }
}

function resolveRangeStart(options: WeekMinerOptions): Date {
  if (options.weekNumber !== undefined) {
    const year = options.year ?? new Date().getFullYear();
    const anchor = new Date(year, 0, 4);
    return startOfISOWeek(setISOWeek(anchor, options.weekNumber));
  }

  if (options.startDate) {
    return startOfDay(options.startDate);
  }

  // Default: next 7 days starting tomorrow (VR requires future dates).
  return startOfDay(addDays(new Date(), 1));
}

function pickBestForDay(result: DaySearchResult): DayBestOption {
  if (result.error && result.trips.length === 0) {
    return {
      date: result.date,
      trip: emptyTrip(result.date),
      cheapestOffer: { tier: "Basic", priceCents: Infinity, currency: "EUR" },
      matchingTrips: [],
      error: result.error,
    };
  }

  if (result.trips.length === 0) {
    return {
      date: result.date,
      trip: emptyTrip(result.date),
      cheapestOffer: { tier: "Basic", priceCents: Infinity, currency: "EUR" },
      matchingTrips: [],
      error: "No trips in arrival window",
    };
  }

  const best = result.trips.reduce((min, t) =>
    t.cheapestOffer.priceCents < min.cheapestOffer.priceCents ? t : min
  );

  return {
    date: result.date,
    trip: best,
    cheapestOffer: best.cheapestOffer,
    matchingTrips: result.trips,
  };
}

function emptyTrip(date: Date): TripResult {
  return {
    departureTime: date,
    arrivalTime: date,
    durationMinutes: 0,
    trainNumber: "—",
    offers: [],
    cheapestOffer: { tier: "Basic", priceCents: Infinity, currency: "EUR" },
  };
}

function mapSearchError(
  date: Date,
  origin: string,
  destination: string,
  err: unknown
): DaySearchResult {
  if (err instanceof VrClientError) {
    return {
      date,
      origin,
      destination,
      trips: [],
      error: `${err.code}: ${err.message}`,
    };
  }

  const message = err instanceof Error ? err.message : String(err);
  return {
    date,
    origin,
    destination,
    trips: [],
    error: message,
  };
}

/** Label for CLI progress (rolling 7-day window). */
export function getSearchRangeLabel(options: WeekMinerOptions): string {
  const start = resolveRangeStart(options);
  const end = addDays(start, DAY_COUNT - 1);
  return `${format(start, "yyyy-MM-dd")} → ${format(end, "yyyy-MM-dd")}`;
}

/** Legacy ISO-week helper. */
export function resolveWeekStart(options: WeekMinerOptions): Date {
  if (options.weekNumber !== undefined) {
    const year = options.year ?? new Date().getFullYear();
    const anchor = new Date(year, 0, 4);
    return startOfISOWeek(setISOWeek(anchor, options.weekNumber));
  }
  if (options.startDate) {
    return startOfWeek(options.startDate, { weekStartsOn: 1 });
  }
  return startOfISOWeek(new Date());
}
