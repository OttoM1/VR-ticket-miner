import chalk from "chalk";
import Table from "cli-table3";
import { format } from "date-fns";
import { formatStation } from "../../core/stations.js";
import type { DayBestOption, WeekMiningResult } from "../../miner/types.js";

function formatPrice(cents: number, currency: string): string {
  if (!Number.isFinite(cents)) return "—";
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

function formatDate(date: Date): string {
  return format(date, "EEE dd MMM");
}

function formatBand(result: WeekMiningResult): string {
  const { hour, minute, bandHours } = result.arrivalWindow;
  const hh = String(hour).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `arrive by ${hh}:${mm} (${bandHours}h band)`;
}

export function printWeekSummary(result: WeekMiningResult): void {
  const route = `${formatStation(result.origin)} → ${formatStation(result.destination)}`;
  const rangeLabel = `${format(result.rangeStart, "dd MMM")} – ${format(result.rangeEnd, "dd MMM yyyy")}`;
  const passenger =
    result.passengerType === "student" ? " · student fare" : " · adult fare";

  console.log();
  console.log(chalk.bold.cyan("VR Ticket Miner"));
  console.log(
    chalk.dim(`${route}  ·  ${rangeLabel}  ·  ${formatBand(result)}${passenger}`)
  );
  console.log();

  if (result.overallCheapest) {
    const best = result.overallCheapest;
    console.log(
      chalk.bold.green("★ Cheapest option:"),
      chalk.greenBright(
        `${formatDate(best.date)} ${formatTime(best.trip.departureTime)} → ${formatTime(best.trip.arrivalTime)}`
      ),
      chalk.greenBright(
        `${formatPrice(best.cheapestOffer.priceCents, best.cheapestOffer.currency)} (${best.cheapestOffer.tier})`
      ),
      chalk.dim(`· ${best.trip.trainNumber}`)
    );
    console.log();
  } else {
    console.log(chalk.yellow("No trips matched the arrival window across these 14 days."));
    console.log();
  }

  const table = new Table({
    head: [
      chalk.bold("Day"),
      chalk.bold("Departure"),
      chalk.bold("Arrival"),
      chalk.bold("Train"),
      chalk.bold("Tier"),
      chalk.bold("Price"),
      chalk.bold("In window"),
      chalk.bold("Status"),
    ],
    style: { head: [], border: ["gray"] },
  });

  const sortedDays = [...result.days].sort((a, b) => {
    if (a.error && b.error) return a.date.getTime() - b.date.getTime();
    if (a.error) return 1;
    if (b.error) return -1;
    return a.cheapestOffer.priceCents - b.cheapestOffer.priceCents;
  });

  for (const day of sortedDays) {
    table.push(formatDayRow(day, result.overallCheapest));
  }

  console.log(table.toString());
  console.log();
}

function formatDayRow(
  day: DayBestOption,
  overallCheapest: DayBestOption | null
): string[] {
  const isBest =
    overallCheapest &&
    !day.error &&
    day.date.getTime() === overallCheapest.date.getTime() &&
    day.trip.departureTime.getTime() ===
      overallCheapest.trip.departureTime.getTime();

  const dayCell = isBest
    ? chalk.greenBright(formatDate(day.date))
    : formatDate(day.date);

  if (day.error) {
    return [
      dayCell,
      "—",
      "—",
      "—",
      "—",
      "—",
      "0",
      chalk.red(day.error),
    ];
  }

  const priceStr = formatPrice(
    day.cheapestOffer.priceCents,
    day.cheapestOffer.currency
  );

  return [
    dayCell,
    formatTime(day.trip.departureTime),
    formatTime(day.trip.arrivalTime),
    day.trip.trainNumber,
    day.cheapestOffer.tier,
    isBest ? chalk.greenBright(priceStr) : priceStr,
    String(day.matchingTrips.length),
    chalk.green("OK"),
  ];
}
