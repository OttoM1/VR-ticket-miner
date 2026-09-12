import type { PassengerCategory } from "./passengers.js";

/** VR ticket tier names as returned by the booking API. */
export type TicketTier = "Basic" | "Eco" | "Extra";

/** Arrival band: trips must arrive in (target − bandHours, target]. */
export interface ArrivalWindow {
  hour: number;
  minute: number;
  bandHours: number;
}

export interface Station {
  code: string;
  name: string;
  aliases: string[];
}

export interface TripSearchParams {
  origin: string;
  destination: string;
  date: Date;
  passengerType: PassengerCategory;
  /** Target arrival band filter (8h window ending at target time). */
  arrivalWindow?: ArrivalWindow;
  /** When true, search for return journeys (destination → origin). */
  returnTrip?: boolean;
}

export interface TicketOffer {
  tier: TicketTier;
  priceCents: number;
  currency: string;
}

export interface TripResult {
  departureTime: Date;
  arrivalTime: Date;
  durationMinutes: number;
  trainNumber: string;
  offers: TicketOffer[];
  /** Cheapest offer across all tiers for this trip. */
  cheapestOffer: TicketOffer;
}

export interface DaySearchResult {
  date: Date;
  origin: string;
  destination: string;
  trips: TripResult[];
  error?: string;
}

export type VrClientErrorCode =
  | "RATE_LIMITED"
  | "BOT_PROTECTION"
  | "NOT_FOUND"
  | "NETWORK"
  | "UNKNOWN";

export class VrClientError extends Error {
  public readonly code: VrClientErrorCode;

  constructor(message: string, code: VrClientErrorCode, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = "VrClientError";
    this.code = code;
  }
}

export interface VrClientOptions {
  /** Base URL for VR API (override for testing). */
  baseUrl?: string;
  /** Request timeout in milliseconds. */
  timeoutMs?: number;
  /** Use mock data instead of live API. */
  mock?: boolean;
}
