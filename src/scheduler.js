const cron = require('node-cron');
const { runDiscovery } = require('./discovery');
const { generateSpec, generateCode, runHealingLoop } = require('./generator');
const { deployApp } = require('./deployer');
const { generateMetadata, injectMetadataIntoLayout, updateSitemap } = require('./seo');
const logger = require('./logger');

async function runFactoryCycle(isDryRun = false) {
  logger.info(`\n=== Starting Factory Cycle [Dry Run: ${isDryRun}] ===\n`);
  try {
    const apps = await runDiscovery();
    if (apps.length === 0) {
      logger.info("[Factory] No new feasible apps discovered. Ending cycle.");
      return;
    }

    logger.info(`[Factory] Discovered ${apps.length} new apps to process.`);

    for (const app of apps) {
      logger.info(`\n--- Processing: ${app.name} ---`);

      const spec = await generateSpec(app);
      if (!spec) {
         logger.error(`[Factory] Failed to generate spec for ${app.name}. Skipping.`);
         continue;
      }

      const code = await generateCode(spec);
      if (!code) {
         logger.error(`[Factory] Failed to generate code for ${app.name}. Skipping.`);
         continue;
      }

      if (isDryRun) {
         logger.info(`[Factory Dry Run] Spec & Code generated successfully. Skipping deploy/SEO.`);
         continue;
      }

      const healingResult = await runHealingLoop(code);
      if (!healingResult.success) {
         logger.error(`[Factory] Code failed healing loop for ${app.name}. Skipping deploy.`);
         continue;
      }

      // Inject SEO metadata natively into the Next.js layout before deployment
      const meta = generateMetadata(app.name, app.category || 'Utilities');
      injectMetadataIntoLayout(healingResult.tempDir, meta);

      const deployResult = await deployApp(app.name, healingResult.code, healingResult.tempDir);

      updateSitemap(deployResult.subdomain);

      logger.info(`[Factory] Successfully completed pipeline for: ${app.name}`);
    }

  } catch (err) {
      logger.error("[Factory] Fatal Error during cycle:", err);
  }
  logger.info(`\n=== Finished Factory Cycle ===\n`);
}

function startScheduler() {
  logger.info("[Scheduler] Initializing cron job: Running every 6 hours (0 */6 * * *)");
  cron.schedule('0 */6 * * *', () => {
    runFactoryCycle();
  });
}

module.exports = {
  runFactoryCycle,
  startScheduler
};
