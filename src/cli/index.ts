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
    "Search cheapest tickets per day (4h arrival window or any time)"
  )
  .requiredOption(
    "--from <station>",
    "Origin station (name or code, e.g. Helsinki or HKI)"
  )
  .requiredOption(
    "--to <station>",
    "Destination station (name or code, e.g. Tampere or TKU)"
  )
  .option(
    "--arrive <HH:mm>",
    "Latest arrival time when using a band (required unless --band-hours 0)"
  )
  .option(
    "--passenger <type>",
    "Passenger type: adult or student",
    "adult"
  )
  .option(
    "--band-hours <n>",
    "Hours before --arrive to include (default: 4). Use 0 for any arrival that day",
    (v) => parseInt(v, 10),
    4
  )
  .option(
    "--start <date>",
    "First day of the 14-day window (YYYY-MM-DD). Default: tomorrow"
  )
  .option("--week <number>", "Legacy: ISO week number instead of rolling 14 days", (v) =>
    parseInt(v, 10)
  )
  .option("--year <number>", "Year for --week", (v) => parseInt(v, 10))
  .option("--return", "Search return journeys (destination → origin)")
  .option(
    "--direct-only",
    "Only include direct trains (no changes along the route)"
  )
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

    const bandHours = options.bandHours;
    if (!Number.isFinite(bandHours) || bandHours < 0 || bandHours > 24) {
      console.error("--band-hours must be between 0 and 24");
      process.exit(1);
    }

    let arriveHour = 0;
    let arriveMinute = 0;
    if (bandHours > 0) {
      if (!options.arrive) {
        console.error("--arrive is required when --band-hours is greater than 0");
        process.exit(1);
      }
      try {
        const parsed = parseArrivalTime(options.arrive);
        arriveHour = parsed.hour;
        arriveMinute = parsed.minute;
      } catch (err) {
        console.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    }

    await runSearch({
      from: options.from,
      to: options.to,
      passenger,
      arrive: `${String(arriveHour).padStart(2, "0")}:${String(arriveMinute).padStart(2, "0")}`,
      bandHours,
      startDate,
      week: options.week,
      returnTrip: options.return ?? false,
      directOnly: options.directOnly ?? false,
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
