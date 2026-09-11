import { addMinutes, differenceInMinutes, parseISO } from "date-fns";
import type { TicketOffer, TicketTier, TripResult } from "./types.js";

const TIER_ALIASES: Record<string, TicketTier> = {
  basic: "Basic",
  perus: "Basic",
  eco: "Eco",
  extra: "Extra",
  ekstra: "Extra",
};

export function parsePriceToCents(text: string): number | null {
  const normalized = text.replace(/\s/g, "").replace(",", ".");
  const match = /(\d+(?:\.\d{1,2})?)\s*(?:€|EUR|euro)?/i.exec(normalized);
  if (!match) return null;
  return Math.round(parseFloat(match[1]!) * 100);
}

export function parseClockOnDate(
  day: Date,
  clock: string
): Date | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(clock.trim());
  if (!match) return null;
  const d = new Date(day);
  d.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return d;
}

export function mapTierLabel(label: string): TicketTier {
  const key = label.trim().toLowerCase();
  return TIER_ALIASES[key] ?? "Basic";
}

export function buildTripFromTimes(
  day: Date,
  departureClock: string,
  arrivalClock: string,
  trainNumber: string,
  priceCents: number,
  tier: TicketTier = "Basic"
): TripResult | null {
  const departureTime = parseClockOnDate(day, departureClock);
  const arrivalTime = parseClockOnDate(day, arrivalClock);
  if (!departureTime || !arrivalTime) return null;

  let arrival = arrivalTime;
  if (arrival <= departureTime) {
    arrival = addMinutes(arrival, 24 * 60);
  }

  const offers: TicketOffer[] = [
    { tier, priceCents, currency: "EUR" },
  ];

  return {
    departureTime,
    arrivalTime: arrival,
    durationMinutes: differenceInMinutes(arrival, departureTime),
    trainNumber,
    offers,
    cheapestOffer: offers[0]!,
  };
}

/** Parse ISO datetime strings from GraphQL responses. */
export function tripFromIsoRange(
  departureIso: string,
  arrivalIso: string,
  trainNumber: string,
  priceCents: number,
  tier: TicketTier = "Basic"
): TripResult {
  const departureTime = parseISO(departureIso);
  const arrivalTime = parseISO(arrivalIso);
  const offers: TicketOffer[] = [{ tier, priceCents, currency: "EUR" }];
  return {
    departureTime,
    arrivalTime,
    durationMinutes: differenceInMinutes(arrivalTime, departureTime),
    trainNumber,
    offers,
    cheapestOffer: offers[0]!,
  };
}
