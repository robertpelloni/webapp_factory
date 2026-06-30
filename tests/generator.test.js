const { generateSpec, generateCode, runHealingLoop } = require('../src/generator/index');
const fs = require('fs');

async function test() {
  const appData = { name: "Test Calculator", description: "A test app", category: "Utils" };

  const spec = await generateSpec(appData);
  if (spec.app_name !== "Test Calculator") {
    console.error("Spec generation failed");
    process.exit(1);
  }

  const code = await generateCode(spec);
  if (!code.includes("Test Calculator")) {
    console.error("Code generation failed");
    process.exit(1);
  }

  // Test healing loop - success case
  const resultSuccess = await runHealingLoop(code);
  if (!resultSuccess.success) {
    console.error("Healing loop failed on good code");
    process.exit(1);
  }

  // Test healing loop - error case that gets fixed
  const badCode = code + "\n// SYNTAX_ERROR";
  const resultHealed = await runHealingLoop(badCode);
  if (!resultHealed.success || resultHealed.attempts !== 2) {
    console.error("Healing loop failed to heal bad code properly");
    process.exit(1);
  }

  console.log("Generator pipeline verified successfully.");
}

test();
