import { addHours, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";
import type { ArrivalWindow, TripResult } from "./types.js";

export type { ArrivalWindow };

export function parseArrivalTime(input: string): Pick<ArrivalWindow, "hour" | "minute"> {
  const match = /^(\d{1,2}):(\d{2})$/.exec(input.trim());
  if (!match) {
    throw new Error(`Invalid arrival time "${input}". Use HH:mm (e.g. 14:30).`);
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    throw new Error(`Invalid arrival time "${input}". Hour must be 0–23.`);
  }
  return { hour, minute };
}

/** Apply arrival clock time to a calendar day (local). */
export function arrivalTargetOnDate(day: Date, window: ArrivalWindow): Date {
  return setMilliseconds(
    setSeconds(setMinutes(setHours(day, window.hour), window.minute), 0),
    0
  );
}

/**
 * Keep trips whose arrival falls in the band ending at the target arrival:
 * (target - bandHours, target] on the same calendar day.
 */
export function isWithinArrivalBand(
  arrival: Date,
  day: Date,
  window: ArrivalWindow
): boolean {
  const target = arrivalTargetOnDate(day, window);
  const bandStart = addHours(target, -window.bandHours);
  return arrival > bandStart && arrival <= target;
}

export function filterTripsByArrivalWindow(
  trips: TripResult[],
  day: Date,
  window: ArrivalWindow
): TripResult[] {
  return trips.filter((t) => isWithinArrivalBand(t.arrivalTime, day, window));
}
