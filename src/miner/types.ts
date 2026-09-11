import type { PassengerCategory } from "../core/passengers.js";
import type {
  ArrivalWindow,
  DaySearchResult,
  TicketOffer,
  TripResult,
} from "../core/types.js";

export interface WeekMinerOptions {
  origin: string;
  destination: string;
  passengerType: PassengerCategory;
  arrivalWindow: ArrivalWindow;
  /** First day of the 7-day rolling window. Defaults to tomorrow. */
  startDate?: Date;
  /** ISO week mode (legacy). When set, overrides startDate. */
  weekNumber?: number;
  year?: number;
  returnTrip?: boolean;
  requestDelayMs?: number;
  mock?: boolean;
}

export interface DayBestOption {
  date: Date;
  trip: TripResult;
  cheapestOffer: TicketOffer;
  /** All trips matching the arrival window that day. */
  matchingTrips: TripResult[];
  error?: string;
}

export interface WeekMiningResult {
  origin: string;
  destination: string;
  passengerType: PassengerCategory;
  arrivalWindow: ArrivalWindow;
  rangeStart: Date;
  rangeEnd: Date;
  days: DayBestOption[];
  overallCheapest: DayBestOption | null;
  raw: DaySearchResult[];
}
