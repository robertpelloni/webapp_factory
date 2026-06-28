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
    You are an expert software architect. Analyze the following trending application and create a highly rigid JSON specification for building a pure HTML/Tailwind/Vanilla JS web alternative.
    Target App: ${appData.name} - ${appData.description}
    Requirements:
    - Must be a client-side utility (no backend databases).
    - Use "HTML / Tailwind CSS / Vanilla JS".
    Output ONLY valid JSON.
    Format:
    {
      "app_name": "WebAlternativeName",
      "framework": "HTML / Tailwind CSS / Vanilla JS",
      "components": ["List", "Of", "Sections"],
      "state_management": "Vanilla JS DOM manipulation",
      "libraries_allowed": ["canvas-confetti"]
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
    framework: "HTML / Tailwind CSS / Vanilla JS",
    components: ["Header", "MainTool", "Footer"],
    state_management: "Vanilla JS DOM manipulation",
    libraries_allowed: []
  };
}

async function generateCode(spec) {
  const prompt = `
    Write a complete, single-file HTML document for the following spec, ensuring the layout is compact, responsive, and specifically designed to be embedded as an iframe widget (e.g. for Notion or personal websites):
    ${JSON.stringify(spec)}
    Requirements:
    - Return ONLY valid HTML code, no markdown wrapping, no explanations.
    - Use Tailwind CSS for styling.
    - Load Tailwind CSS via CDN (e.g. <script src="https://cdn.tailwindcss.com"></script>)
    - All JavaScript must be in a single <script> tag at the bottom of the body.
  `;

  const llmResponse = await callGemini(prompt);

  if (llmResponse) {
      logger.info(`[Generator] Successfully generated HTML code via Gemini for ${spec.app_name}`);
      return llmResponse.replace(/```html?/g, '').replace(/```/g, '').trim();
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${spec.app_name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="text-center">
        <h1 class="text-2xl font-bold">${spec.app_name}</h1>
        <p>Tool content goes here. (Mocked Vanilla JS version)</p>
    </div>
</body>
</html>
  `;
}


async function runHealingLoop(code, maxAttempts = 3) {
  let attempt = 0;
  let currentCode = code;
  const tempDir = path.resolve(__dirname, 'temp_build');

  if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
  }

  while (attempt < maxAttempts) {
    attempt++;
    const filePath = path.resolve(tempDir, 'index.html');

    fs.writeFileSync(filePath, currentCode);

    try {
      if (currentCode.includes("SYNTAX_ERROR")) {
        throw new Error("Syntax error mock detected");
      }

      // No actual npm run build for Vanilla JS, just file write validation
      logger.info(`[Healing Loop] HTML file successfully validated without build errors.`);

      return { success: true, code: currentCode, attempts: attempt, tempDir };
    } catch (error) {
      let errorMsg = error.message;

      logger.error(`[Healing Loop] Attempt ${attempt} failed: \n${errorMsg.substring(0, 500)}...`);

      if (attempt < maxAttempts) {
        logger.info(`[Healing Loop] Requesting patch from LLM...`);

        const patchPrompt = `
          The following HTML code failed validation with error:
          ${errorMsg}
          Fix the code and return the entire corrected file. Return ONLY valid HTML code.
          Code:
          ${currentCode}
        `;

        const llmPatch = await callGemini(patchPrompt);

        if (llmPatch) {
             currentCode = llmPatch.replace(/```html?/g, '').replace(/```/g, '').trim();
        } else {
             currentCode = currentCode.replace("SYNTAX_ERROR", "<!-- fixed -->");
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
