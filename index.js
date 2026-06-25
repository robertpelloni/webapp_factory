require('dotenv').config({ path: __dirname + '/.env' }); // Assuming someone might drop an .env file
const { runFactoryCycle, startScheduler } = require('./src/scheduler');

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isCron = args.includes('--cron');

async function main() {
  if (isCron) {
    console.log("Starting webapp_factory in CRON daemon mode...");
    startScheduler();

    // To prevent the script from exiting
    process.stdin.resume();
  } else {
    console.log("Starting webapp_factory in IMMEDIATE execution mode...");
    await runFactoryCycle(isDryRun);
    process.exit(0);
  }
}

main();
