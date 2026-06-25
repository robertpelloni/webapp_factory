const { runDiscovery } = require('../src/discovery/index');
const { initDb, isAppProcessed, db } = require('../src/discovery/db');
const fs = require('fs');

async function test() {
  if (fs.existsSync('src/discovery/discovery.db')) {
    fs.unlinkSync('src/discovery/discovery.db');
  }

  const newApps = await runDiscovery();
  console.log("Newly Discovered Feasible Apps:", newApps.map(a => a.name));

  if (newApps.length !== 2) {
    console.error("Test failed, expected 2 feasible apps.");
    process.exit(1);
  }

  // Run again, should return 0 new apps because they are processed
  const newAppsRun2 = await runDiscovery();
  console.log("Newly Discovered Feasible Apps (Run 2):", newAppsRun2.map(a => a.name));

  if (newAppsRun2.length !== 0) {
    console.error("Test failed, expected 0 feasible apps on run 2.");
    process.exit(1);
  }

  console.log("Discovery pipeline verified successfully.");
}

test();
