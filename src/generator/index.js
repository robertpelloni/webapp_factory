const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper to call Gemini API if key is present
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
    console.error('[Gemini API] Error calling Gemini:', error);
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
      // Strip markdown code block formatting if present
      const cleanJson = llmResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      console.log(`[Generator] Successfully generated spec via Gemini for ${appData.name}`);
      return JSON.parse(cleanJson);
    } catch(e) {
        console.error('[Generator] Failed to parse Gemini output, falling back to mock.');
    }
  }

  // Fallback Mock Spec Writer
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
  `;

  const llmResponse = await callGemini(prompt);

  if (llmResponse) {
      console.log(`[Generator] Successfully generated code via Gemini for ${spec.app_name}`);
      return llmResponse.replace(/```jsx?/g, '').replace(/```/g, '').trim();
  }

  // Fallback Mock Code Generator
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

// The Healing Loop
async function runHealingLoop(code, maxAttempts = 3) {
  let attempt = 0;
  let currentCode = code;

  const tempDir = path.resolve(__dirname, 'temp_build');

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

      // If we are actually compiling, we would run:
      // execSync('npm run build', { cwd: tempDir, stdio: 'pipe' });

      return { success: true, code: currentCode, attempts: attempt };
    } catch (error) {
      console.log(`[Healing Loop] Attempt ${attempt} failed:`, error.message);

      if (attempt < maxAttempts) {
        console.log(`[Healing Loop] Patching code...`);

        const errorMsg = error.message || error.toString();
        const patchPrompt = `
          The following React code failed to build with error: ${errorMsg}
          Fix the code and return the entire corrected file. Return ONLY valid code.
          Code:
          ${currentCode}
        `;

        const llmPatch = await callGemini(patchPrompt);

        if (llmPatch) {
             currentCode = llmPatch.replace(/```jsx?/g, '').replace(/```/g, '').trim();
        } else {
             // Mock patch
             currentCode = currentCode.replace("SYNTAX_ERROR", "/* fixed */");
        }
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
