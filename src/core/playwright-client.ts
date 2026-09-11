import type { Browser, Page, Response } from "playwright";
import { isSameDay } from "date-fns";
import {
  buildSearchResultsUrl,
} from "./search-url.js";
import {
  buildTripFromTimes,
  mapTierLabel,
  parsePriceToCents,
  tripFromIsoRange,
} from "./trip-parser.js";
import type {
  DaySearchResult,
  TicketTier,
  TripResult,
  TripSearchParams,
} from "./types.js";
import { VrClientError } from "./types.js";

const DEFAULT_BASE = "https://www.vr.fi";

export class PlaywrightVrClient {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private cookiesHandled = false;

  constructor(
    private readonly baseUrl: string = DEFAULT_BASE,
    private readonly timeoutMs: number = 45_000
  ) {}

  async searchDay(params: TripSearchParams): Promise<DaySearchResult> {
    const { origin, destination, date } = params;

    try {
      await this.ensurePage();
      const page = this.page!;
      const url = buildSearchResultsUrl(this.baseUrl, params);
      const journeyResponse = this.waitForJourneyResponse(page);

      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: this.timeoutMs,
      });

      await this.acceptCookiesIfPresent(page);
      const apiResponse = await journeyResponse;
      let apiPayload: unknown;
      if (apiResponse !== null) {
        apiPayload = await apiResponse.json().catch(() => undefined);
      }
      let trips = this.extractTripsFromApi(apiPayload, date);

      if (trips.length === 0) {
        trips = await this.extractTripsFromPage(page, date);
      }

      const html = trips.length === 0 ? await page.content() : "";
      if (
        /ErrorHeader__section|sivua ei löytynyt|page not found/i.test(html)
      ) {
        throw new VrClientError(
          "VR returned a missing-page response for its ticket search",
          "NOT_FOUND"
        );
      }
      if (/captcha|challenge|robot/i.test(html) && !/\d{1,2}:\d{2}/.test(html)) {
        throw new VrClientError(
          "VR bot protection blocked automated access",
          "BOT_PROTECTION"
        );
      }

      if (trips.length === 0) {
        trips = this.extractTripsFromHtml(html, date);
      }

      trips.sort(
        (a, b) => a.cheapestOffer.priceCents - b.cheapestOffer.priceCents
      );

      return {
        date,
        origin,
        destination,
        trips,
        error: trips.length === 0 ? "No trips found" : undefined,
      };
    } catch (err) {
      if (err instanceof VrClientError) throw err;
      throw new VrClientError(
        err instanceof Error ? err.message : "Playwright search failed",
        "UNKNOWN",
        err
      );
    }
  }

  async close(): Promise<void> {
    await this.page?.close().catch(() => undefined);
    await this.browser?.close().catch(() => undefined);
    this.page = null;
    this.browser = null;
  }

  private async ensurePage(): Promise<void> {
    if (this.page) return;

    const { chromium } = await import("playwright");
    this.browser = await chromium.launch({
      headless: true,
      args: ["--disable-blink-features=AutomationControlled"],
    });
    this.page = await this.browser.newPage({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      locale: "fi-FI",
    });
  }

  private async acceptCookiesIfPresent(page: Page): Promise<void> {
    if (this.cookiesHandled) return;

    const selectors = [
      'button:has-text("Hyväksy kaikki")',
      'button:has-text("Accept all")',
      'button:has-text("Hyväksy")',
      '[data-testid*="cookie"] button',
    ];
    for (const sel of selectors) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await btn.click().catch(() => undefined);
        break;
      }
    }
    this.cookiesHandled = true;
  }

  private waitForJourneyResponse(page: Page): Promise<Response | null> {
    return page
      .waitForResponse(
        (response) =>
          response.status() === 200 &&
          response.url().includes("/api/trpc/journey.searchJourney"),
        { timeout: Math.min(this.timeoutMs, 20_000) }
      )
      .catch(() => null);
  }

  private async extractTripsFromPage(
    page: Page,
    day: Date
  ): Promise<TripResult[]> {
    const items = page.locator('[data-testid="connection-list-item"]');
    const count = await items.count();
    const trips: TripResult[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const departure = await item
        .locator('[data-testid="connection-list-item__time_departure"]')
        .innerText()
        .catch(() => "");
      const arrival = await item
        .locator('[data-testid="connection-list-item__time_arrival"]')
        .innerText()
        .catch(() => "");
      const train = await item
        .locator('[data-testid="connection-list-item__train-list"]')
        .innerText()
        .catch(() => "");
      const price = await item
        .locator('[data-testid="price__price-value"]')
        .first()
        .innerText()
        .catch(() => "");
      const departureClock = extractClock(departure);
      const arrivalClock = extractClock(arrival);
      if (!departureClock || !arrivalClock) continue;
      const priceCents = parsePriceToCents(price);
      if (priceCents == null) continue;
      const trainLabel = normalizeTrainLabel(train);
      const key = `${departureClock}-${arrivalClock}-${trainLabel}-${priceCents}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const trip = buildTripFromTimes(
        day,
        departureClock,
        arrivalClock,
        trainLabel,
        priceCents,
        mapTierLabel("Basic")
      );
      if (trip) trips.push(trip);
    }

    return trips;
  }

  private extractTripsFromApi(payload: unknown, day: Date): TripResult[] {
    if (!Array.isArray(payload)) return [];

    const trips: TripResult[] = [];
    for (const entry of payload) {
      if (!isRecord(entry) || !isRecord(entry.result)) continue;
      const data = entry.result.data;
      if (!isRecord(data) || !Array.isArray(data.options)) continue;

      for (const option of data.options) {
        if (
          !isRecord(option) ||
          typeof option.departureTime !== "string" ||
          typeof option.arrivalTime !== "string" ||
          typeof option.totalPrice !== "number"
        ) {
          continue;
        }

        const legs = Array.isArray(option.legs) ? option.legs : [];
        const trains = legs.flatMap((leg) => {
          if (!isRecord(leg)) return [];
          const type =
            typeof leg.trainType === "string" ? leg.trainType : "";
          const number =
            typeof leg.trainNumber === "string" ? leg.trainNumber : "";
          const line =
            typeof leg.commercialLineIdentifier === "string"
              ? leg.commercialLineIdentifier
              : "";
          const label = line
            ? `${line} train`
            : type === "LOL"
              ? `Train ${number}`
              : `${type} ${number}`.trim();
          return label ? [label] : [];
        });
        const tier = inferTier(option);

        trips.push(
          tripFromIsoRange(
            option.departureTime,
            option.arrivalTime,
            trains.join(" + ") || "—",
            option.totalPrice,
            tier
          )
        );
      }
    }

    return trips.filter(
      (trip) =>
        !Number.isNaN(trip.departureTime.getTime()) &&
        !Number.isNaN(trip.arrivalTime.getTime()) &&
        isSameDay(trip.departureTime, day)
    );
  }

  /** Fallback for legacy shop.vr.fi HTML table layout. */
  private extractTripsFromHtml(html: string, day: Date): TripResult[] {
    const rowRe =
      /(\d{1,2}:\d{2})[\s\S]{0,120}?(\d{1,2}:\d{2})[\s\S]{0,200}?((?:IC|P|S|Z)\s?\d+)?[\s\S]{0,120}?(\d+[,.]\d{2})\s*€/gi;
    const trips: TripResult[] = [];
    let match: RegExpExecArray | null;
    while ((match = rowRe.exec(html)) !== null) {
      const priceCents = parsePriceToCents(match[4]!);
      if (priceCents == null) continue;
      const trip = buildTripFromTimes(
        day,
        match[1]!,
        match[2]!,
        match[3]?.trim() || "—",
        priceCents
      );
      if (trip) trips.push(trip);
    }
    return trips;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractClock(text: string): string | null {
  return text.match(/\d{1,2}:\d{2}/)?.[0] ?? null;
}

function normalizeTrainLabel(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  const matches =
    normalized.match(
      /(?:Pendolino Plus|Pendolino|InterCity|IC|P|S|Z)\s*\d+/gi
    ) ?? [];
  return [...new Set(matches)].join(" + ") || normalized || "—";
}

function inferTier(option: Record<string, unknown>): TicketTier {
  const passengers = Array.isArray(option.passengers) ? option.passengers : [];
  const products = passengers.flatMap((passenger) => {
    if (!isRecord(passenger) || !Array.isArray(passenger.offers)) return [];
    return passenger.offers.flatMap((offer) =>
      isRecord(offer) && typeof offer.product === "string"
        ? [offer.product.toUpperCase()]
        : []
    );
  });

  if (products.some((product) => product.includes("EXTRA"))) return "Extra";
  if (products.some((product) => product.includes("ECO"))) return "Eco";
  return "Basic";
}
