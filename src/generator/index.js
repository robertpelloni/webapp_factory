const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../logger');

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    logger.error('[Gemini API] Error calling Gemini:', error);
    return null;
  }
}

async function generateSpec(appData) {
  const prompt = `
    You are an expert software architect. Analyze the following trending application and create a highly rigid JSON specification for building a client-side Next.js web alternative.
    Target App: ${appData.name} - ${appData.description}
    Requirements:
    - Must be a client-side utility (no backend databases).
    - Use "Next.js / Tailwind CSS".
    - Use "shadcn/ui" components where possible.
    Output ONLY valid JSON.
    Format:
    {
      "app_name": "WebAlternativeName",
      "framework": "Next.js / Tailwind CSS",
      "components": ["List", "Of", "Components"],
      "state_management": "React Context or useState",
      "libraries_allowed": ["lucide-react", "canvas-confetti"]
    }
  `;

  const llmResponse = await callGemini(prompt);

  if (llmResponse) {
    try {
      const cleanJson = llmResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      logger.info(`[Generator] Successfully generated spec via Gemini for ${appData.name}`);
      return JSON.parse(cleanJson);
    } catch(e) {
        logger.error('[Generator] Failed to parse Gemini output, falling back to mock.');
    }
  }

  return {
    app_name: appData.name,
    framework: "Next.js / Tailwind CSS",
    components: ["Header", "MainTool", "Footer"],
    state_management: "React Context",
    libraries_allowed: ["lucide-react"]
  };
}

async function generateCode(spec) {
  const prompt = `
    Write a complete, single-file Next.js React component for the following spec:
    ${JSON.stringify(spec)}
    Requirements:
    - Return ONLY valid React code, no markdown wrapping, no explanations.
    - Use Tailwind CSS for styling.
    - Assume shadcn/ui components are available in @/components/ui/
  `;

  const llmResponse = await callGemini(prompt);

  if (llmResponse) {
      logger.info(`[Generator] Successfully generated code via Gemini for ${spec.app_name}`);
      return llmResponse.replace(/```jsx?/g, '').replace(/```tsx?/g, '').replace(/```/g, '').trim();
  }

  return `
import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-2xl font-bold">${spec.app_name}</h1>
      <p>Tool content goes here. (Mocked)</p>
    </div>
  );
}
  `;
}

function copyDirSync(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        if (entry.name === 'node_modules' || entry.name === '.next') continue;

        entry.isDirectory() ?
            copyDirSync(srcPath, destPath) :
            fs.copyFileSync(srcPath, destPath);
    }
}

async function runHealingLoop(code, maxAttempts = 3) {
  let attempt = 0;
  let currentCode = code;

  const templateDir = path.resolve(__dirname, 'template');
  const tempDir = path.resolve(__dirname, 'temp_build');

  if (!fs.existsSync(tempDir)) {
      logger.info('[Healing Loop] Copying Next.js template...');
      copyDirSync(templateDir, tempDir);

      // Perform a one-time npm install in the temp directory if not running in pure mock mode
      if (process.env.GEMINI_API_KEY) {
          logger.info('[Healing Loop] Installing template dependencies...');
          execSync('npm install', { cwd: tempDir, stdio: 'ignore' });
      }
  }

  while (attempt < maxAttempts) {
    attempt++;
    const filePath = path.resolve(tempDir, 'src/app/page.js');

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, currentCode);

    try {
      if (currentCode.includes("SYNTAX_ERROR")) {
        throw new Error("Syntax error mock detected");
      }

      // Actual build validation
      if (process.env.GEMINI_API_KEY) {
          logger.info(`[Healing Loop] Attempt ${attempt}: Running actual Next.js build validation...`);
          execSync('npm run build', { cwd: tempDir, stdio: 'pipe' });
          logger.info(`[Healing Loop] Build successful!`);
      }

      return { success: true, code: currentCode, attempts: attempt, tempDir };
    } catch (error) {
      // Capture the stderr from the build command if it failed
      let errorMsg = error.message;
      if (error.stderr) {
         errorMsg = error.stderr.toString();
      }

      logger.error(`[Healing Loop] Attempt ${attempt} failed: \n${errorMsg.substring(0, 500)}...`);

      if (attempt < maxAttempts) {
        logger.info(`[Healing Loop] Requesting patch from LLM...`);

        const patchPrompt = `
          The following Next.js React code failed to build with error:
          ${errorMsg}
          Fix the code and return the entire corrected file. Return ONLY valid code.
          Code:
          ${currentCode}
        `;

        const llmPatch = await callGemini(patchPrompt);

        if (llmPatch) {
             currentCode = llmPatch.replace(/```jsx?/g, '').replace(/```tsx?/g, '').replace(/```/g, '').trim();
        } else {
             currentCode = currentCode.replace("SYNTAX_ERROR", "/* fixed */");
        }
      }
    }
  }

  return { success: false, code: currentCode, attempts: attempt, tempDir };
}

module.exports = {
  generateSpec,
  generateCode,
  runHealingLoop
};
