import { addMinutes, setHours, setMinutes } from "date-fns";
import type { DaySearchResult, TicketOffer, TripResult } from "./types.js";
import type { TripSearchParams } from "./types.js";

function makeOffers(basePriceCents: number): TicketOffer[] {
  return [
    { tier: "Basic", priceCents: basePriceCents, currency: "EUR" },
    { tier: "Eco", priceCents: basePriceCents + 500, currency: "EUR" },
    { tier: "Extra", priceCents: basePriceCents + 1200, currency: "EUR" },
  ];
}

function cheapest(offers: TicketOffer[]): TicketOffer {
  return offers.reduce((min, o) => (o.priceCents < min.priceCents ? o : min));
}

function makeTrip(
  date: Date,
  hour: number,
  minute: number,
  durationMinutes: number,
  trainNumber: string,
  basePriceCents: number
): TripResult {
  const departureTime = setMinutes(setHours(date, hour), minute);
  const arrivalTime = addMinutes(departureTime, durationMinutes);
  const offers = makeOffers(basePriceCents);

  return {
    departureTime,
    arrivalTime,
    durationMinutes,
    trainNumber,
    offers,
    cheapestOffer: cheapest(offers),
  };
}

function dayPriceSeed(date: Date, origin: string, destination: string): number {
  const key = `${date.toISOString().slice(0, 10)}:${origin}:${destination}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Raw mock schedule for a day (filtering applied later by finalizeDayResult). */
export function generateMockDayResult(params: TripSearchParams): DaySearchResult {
  const { date, origin, destination } = params;
  const seed = dayPriceSeed(date, origin, destination);
  const dayOfWeek = date.getDay();
  const basePrice = 1200 + (seed % 800) + dayOfWeek * 150;

  const trips: TripResult[] = [
    makeTrip(date, 6, 30, 95, "IC 1", basePrice),
    makeTrip(date, 8, 15, 92, "IC 3", basePrice + 200),
    makeTrip(date, 10, 45, 94, "IC 5", basePrice - 100),
    makeTrip(date, 12, 0, 94, "IC 7", basePrice - 100),
    makeTrip(date, 13, 30, 93, "IC 9", basePrice + 80),
    makeTrip(date, 15, 0, 96, "IC 11", basePrice + 350),
    makeTrip(date, 17, 15, 92, "IC 13", basePrice + 120),
    makeTrip(date, 19, 30, 93, "IC 15", basePrice + 100),
  ];

  return {
    date,
    origin,
    destination,
    trips,
  };
}
