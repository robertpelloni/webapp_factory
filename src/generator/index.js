const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Mock Spec Writer
function generateSpec(appData) {
  return {
    app_name: appData.name,
    framework: "Next.js / Tailwind CSS",
    components: ["Header", "MainTool", "Footer"],
    state_management: "React Context",
    libraries_allowed: ["lucide-react"]
  };
}

// Mock Code Generator
function generateCode(spec) {
  // Returns a simple Next.js component string
  return `
import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-2xl font-bold">${spec.app_name}</h1>
      <p>Tool content goes here.</p>
    </div>
  );
}
  `;
}

// The Healing Loop
function runHealingLoop(code, maxAttempts = 3) {
  let attempt = 0;
  let currentCode = code;

  const tempDir = path.resolve(__dirname, 'temp_build');

  // Setup temp build env (mock)
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  while (attempt < maxAttempts) {
    attempt++;
    const filePath = path.resolve(tempDir, 'App.js');
    fs.writeFileSync(filePath, currentCode);

    try {
      // We simulate a build command. For mocking, if code contains "ERROR", it fails.
      if (currentCode.includes("SYNTAX_ERROR")) {
        throw new Error("Syntax error mock detected");
      }

      // Simulate build success
      // execSync('npm run build', { cwd: tempDir, stdio: 'pipe' });

      // If it reaches here, it succeeded
      return { success: true, code: currentCode, attempts: attempt };
    } catch (error) {
      console.log(`[Healing Loop] Attempt ${attempt} failed:`, error.message);

      // Simulate LLM patching the code
      if (attempt < maxAttempts) {
        console.log(`[Healing Loop] Patching code...`);
        currentCode = currentCode.replace("SYNTAX_ERROR", "/* fixed */");
      }
    }
  }

  return { success: false, code: currentCode, attempts: attempt };
}

module.exports = {
  generateSpec,
  generateCode,
  runHealingLoop
};
