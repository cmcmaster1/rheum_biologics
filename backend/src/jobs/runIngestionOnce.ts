import '../loadEnv.js';

import { runBiologicsIngestion } from './biologicsIngestion.js';

const parseArgs = () => {
  const args = new Map<string, string>();
  for (const arg of process.argv.slice(2)) {
    const [key, value] = arg.split('=');
    if (key && value) {
      args.set(key.replace(/^--/, ''), value);
    }
  }
  return args;
};

const args = parseArgs();

const resolveTargetDate = (): Date | undefined => {
  const dateArg = args.get('date');
  if (!dateArg) return undefined;
  const [year, month] = dateArg.split('-').map((part) => Number.parseInt(part, 10));
  if (!year || !month || month < 1 || month > 12) {
    throw new Error('Invalid --date argument. Expected YYYY-MM.');
  }
  return new Date(Date.UTC(year, month - 1, 1));
};

const resolveLookback = (): number | undefined => {
  const lookbackArg = args.get('lookback');
  if (!lookbackArg) return undefined;
  const parsed = Number.parseInt(lookbackArg, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error('Invalid --lookback argument. Expected positive integer.');
  }
  return parsed;
};

const main = async () => {
  try {
    const targetDate = resolveTargetDate();
    const lookbackMonths = resolveLookback();
    const { schedule, count } = await runBiologicsIngestion({
      targetDate,
      lookbackMonths
    });
    console.log(
      `Biologics ingestion complete for schedule ${schedule.code} (${schedule.month} ${schedule.year}) · inserted ${count} rows.`
    );
    process.exit(0);
  } catch (error) {
    console.error('Biologics ingestion failed:', error);
    process.exit(1);
  }
};

void main();
