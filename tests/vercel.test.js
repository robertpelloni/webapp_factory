const { deployApp } = require('../src/deployer/index');

async function test() {
  console.log("Running Vercel deployment shell test...");

  const result = await deployApp("Vercel Mock Test App", "console.log('vercel integration');");

  if (!result.deployedUrl || !result.deployedUrl.includes('.vercel.app')) {
     console.error("Vercel mock API did not return expected URL structure.");
     process.exit(1);
  }

  if (result.slug !== 'vercel-mock-test-app') {
     console.error("Slug parsing failed during deployment.");
     process.exit(1);
  }

  console.log("Vercel Deployment Architecture verified successfully.");
}

test();
