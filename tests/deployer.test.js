const { initDeployDb, deployApp, getRoute } = require('../src/deployer/index');

async function test() {
  await initDeployDb();

  const { slug, subdomain } = await deployApp("Test App", "console.log('hi');");

  if (slug !== 'test-app' || subdomain !== 'test-app.utilityhub.com') {
    console.error("Deployment route generation failed");
    process.exit(1);
  }

  const fetchedSubdomain = await getRoute('test-app');
  if (fetchedSubdomain !== 'test-app.utilityhub.com') {
     console.error("Failed to retrieve saved route from DB");
     process.exit(1);
  }

  console.log("Deployer pipeline verified successfully.");
}

test();
