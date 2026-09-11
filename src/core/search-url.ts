import { format } from "date-fns";
import type { PassengerCategory } from "./passengers.js";
import { toVrPassengerType } from "./passengers.js";
import type { TripSearchParams } from "./types.js";

export const VR_TICKET_PAGE = "https://www.vr.fi/junaliput#osta-lippuja";
export const VR_TICKET_PATH = "/junaliput";
export const VR_OUTBOUND_SEARCH_PATH =
  "/kertalippu-menomatkan-hakutulokset";

export interface VrSearchQuery {
  from: string;
  to: string;
  outboundDate: string;
  passengerType: string;
  returnDate?: string;
}

export function buildSearchQuery(params: TripSearchParams): VrSearchQuery {
  return {
    from: params.origin,
    to: params.destination,
    outboundDate: format(params.date, "yyyy-MM-dd"),
    passengerType: toVrPassengerType(params.passengerType),
    ...(params.returnTrip
      ? { returnDate: format(params.date, "yyyy-MM-dd") }
      : {}),
  };
}

/** Query string matching vr.fi `cleanSearchParameters` / qs format. */
export function buildSearchQueryString(params: TripSearchParams): string {
  const q = buildSearchQuery(params);
  const search = new URLSearchParams();
  search.set("from", q.from);
  search.set("to", q.to);
  search.set("outboundDate", q.outboundDate);
  search.set("passengers[0][type]", q.passengerType);
  if (q.returnDate) search.set("returnDate", q.returnDate);
  return search.toString();
}

export function buildSearchResultsUrl(
  baseUrl: string,
  params: TripSearchParams
): string {
  const qs = buildSearchQueryString(params);
  return `${baseUrl.replace(/\/$/, "")}${VR_OUTBOUND_SEARCH_PATH}?${qs}`;
}
