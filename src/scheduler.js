const cron = require('node-cron');
const { runDiscovery } = require('./discovery');
const { generateSpec, generateCode, runHealingLoop } = require('./generator');
const { deployApp } = require('./deployer');
const { generateMetadata, updateSitemap } = require('./seo');

async function runFactoryCycle(isDryRun = false) {
  console.log(`\n=== Starting Factory Cycle [Dry Run: ${isDryRun}] ===\n`);
  try {
    const apps = await runDiscovery();
    if (apps.length === 0) {
      console.log("[Factory] No new feasible apps discovered. Ending cycle.");
      return;
    }

    console.log(`[Factory] Discovered ${apps.length} new apps to process.`);

    for (const app of apps) {
      console.log(`\n--- Processing: ${app.name} ---`);

      const spec = await generateSpec(app);
      if (!spec) {
         console.error(`[Factory] Failed to generate spec for ${app.name}. Skipping.`);
         continue;
      }

      const code = await generateCode(spec);
      if (!code) {
         console.error(`[Factory] Failed to generate code for ${app.name}. Skipping.`);
         continue;
      }

      if (isDryRun) {
         console.log(`[Factory Dry Run] Spec & Code generated successfully. Skipping deploy/SEO.`);
         continue;
      }

      const healingResult = await runHealingLoop(code);
      if (!healingResult.success) {
         console.error(`[Factory] Code failed healing loop for ${app.name}. Skipping deploy.`);
         continue;
      }

      const deployResult = await deployApp(app.name, healingResult.code);

      const meta = generateMetadata(app.name, app.category || 'Utilities');
      console.log(`[Factory] Generated Meta Tags:\n${meta}`);

      updateSitemap(deployResult.subdomain);

      console.log(`[Factory] Successfully completed pipeline for: ${app.name}`);
    }

  } catch (err) {
      console.error("[Factory] Fatal Error during cycle:", err);
  }
  console.log(`\n=== Finished Factory Cycle ===\n`);
}

function startScheduler() {
  console.log("[Scheduler] Initializing cron job: Running every 6 hours (0 */6 * * *)");
  // Run every 6 hours
  cron.schedule('0 */6 * * *', () => {
    runFactoryCycle();
  });
}

module.exports = {
  runFactoryCycle,
  startScheduler
};
