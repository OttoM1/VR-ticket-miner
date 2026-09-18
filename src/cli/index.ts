#!/usr/bin/env node

import { Command } from "commander";
import { parseISO } from "date-fns";
import { parseArrivalTime } from "../core/arrival-window.js";
import { resolvePassengerCategory } from "../core/passengers.js";
import { listStations } from "../core/stations.js";
import { runSearch } from "./commands/search.js";

const program = new Command();

program
  .name("vr-miner")
  .description(
    "Find the cheapest VR train tickets for a route across 14 days (vr.fi/junaliput)"
  )
  .version("0.1.0");

program
  .command("search")
  .description(
    "Search cheapest tickets per day for trips arriving in an 8-hour window"
  )
  .requiredOption(
    "--from <station>",
    "Origin station (name or code, e.g. Helsinki or HKI)"
  )
  .requiredOption(
    "--to <station>",
    "Destination station (name or code, e.g. Tampere or TKU)"
  )
  .requiredOption(
    "--arrive <HH:mm>",
    "Target arrival time; keeps trips arriving within the band ending at this time"
  )
  .option(
    "--passenger <type>",
    "Passenger type: adult or student",
    "adult"
  )
  .option(
    "--band-hours <n>",
    "Arrival band width in hours (default: 8)",
    (v) => parseInt(v, 10),
    8
  )
  .option(
    "--start <date>",
    "First day of the 7-day window (YYYY-MM-DD). Default: tomorrow"
  )
  .option("--week <number>", "Legacy: ISO week number instead of rolling 7 days", (v) =>
    parseInt(v, 10)
  )
  .option("--year <number>", "Year for --week", (v) => parseInt(v, 10))
  .option("--return", "Search return journeys (destination → origin)")
  .option("--mock", "Use mocked VR responses (no browser)")
  .option(
    "--delay <ms>",
    "Delay between day requests in ms (default: 800)",
    (v) => parseInt(v, 10)
  )
  .action(async (options) => {
    let startDate: Date | undefined;
    if (options.start) {
      startDate = parseISO(options.start);
      if (Number.isNaN(startDate.getTime())) {
        console.error(`Invalid --start date: ${options.start}`);
        process.exit(1);
      }
    }

    let passenger;
    try {
      passenger = resolvePassengerCategory(options.passenger);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }

    let arrive;
    try {
      arrive = parseArrivalTime(options.arrive);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }

    await runSearch({
      from: options.from,
      to: options.to,
      passenger,
      arrive: `${String(arrive.hour).padStart(2, "0")}:${String(arrive.minute).padStart(2, "0")}`,
      bandHours: options.bandHours,
      startDate,
      week: options.week,
      returnTrip: options.return ?? false,
      mock: options.mock ?? false,
      delay: options.delay,
      year: options.year,
    });
  });

program
  .command("stations")
  .description("List known station codes and aliases")
  .action(() => {
    console.log("Known stations:\n");
    for (const s of listStations()) {
      console.log(`  ${s.code.padEnd(4)}  ${s.name}  (${s.aliases.join(", ")})`);
    }
  });

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
