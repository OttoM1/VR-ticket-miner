import chalk from "chalk";
import ora from "ora";
import type { ArrivalWindow } from "../../core/types.js";
import type { PassengerCategory } from "../../core/passengers.js";
import { getSearchRangeLabel, WeekMiner } from "../../miner/week-miner.js";
import type { WeekMinerOptions } from "../../miner/types.js";
import { printWeekSummary } from "../formatters/results.js";

export interface SearchCommandOptions {
  from: string;
  to: string;
  passenger: PassengerCategory;
  arrive: string;
  bandHours: number;
  startDate?: Date;
  week?: number;
  year?: number;
  returnTrip?: boolean;
  mock?: boolean;
  delay?: number;
}

export async function runSearch(opts: SearchCommandOptions): Promise<void> {
  const arrivalWindow: ArrivalWindow = {
    hour: Number(opts.arrive.split(":")[0]),
    minute: Number(opts.arrive.split(":")[1]),
    bandHours: opts.bandHours,
  };

  const minerOptions: WeekMinerOptions = {
    origin: opts.from,
    destination: opts.to,
    passengerType: opts.passenger,
    arrivalWindow,
    startDate: opts.startDate,
    weekNumber: opts.week,
    year: opts.year,
    returnTrip: opts.returnTrip ?? false,
    mock: opts.mock ?? process.env.VR_MINER_MOCK === "1",
    requestDelayMs: opts.delay,
  };

  const rangeLabel = getSearchRangeLabel(minerOptions);
  const modeLabel = minerOptions.mock ? chalk.yellow(" [mock]") : "";
  const passengerLabel =
    opts.passenger === "student" ? chalk.cyan(" student") : "";

  const spinner = ora(
    `Mining ${rangeLabel}: ${opts.from} → ${opts.to} · arrive ${opts.arrive} (±${opts.bandHours}h band)${passengerLabel}${modeLabel}`
  ).start();

  try {
    const miner = new WeekMiner(minerOptions);
    const result = await miner.mine();

    spinner.succeed(
      `Scanned 7 days · ${result.days.filter((d) => !d.error).length} with results in window`
    );

    printWeekSummary(result);

    if (!minerOptions.mock) {
      console.log(
        chalk.dim(
          "Live mode uses Playwright against vr.fi (same flow as junaliput ticket search)."
        )
      );
    }
  } catch (err) {
    spinner.fail("Mining failed");
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(message));
    process.exitCode = 1;
  }
}
