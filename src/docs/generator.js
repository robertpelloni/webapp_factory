const fs = require('fs');
const path = require('path');
const logger = require('../logger');
// We will utilize the same Gemini LLM to parse and extract the Markdown structure,
// keeping it modular and consistent with our widget generator.

async function generateWidgetDocs(spec, generatedCode, llmCaller) {
  logger.info(`[Docs] Generating documentation for ${spec.app_name}...`);

  const prompt = `
    You are an expert technical writer. Based on the following application specification and generated Vanilla JS HTML code, generate a clean, professional Markdown documentation file.

    The documentation MUST include:
    1. A Title and Brief Description.
    2. Embedded Iframe snippet instructions (like: <iframe src="https://{slug}.utilityhub.com">).
    3. Extracted Props/Configuration (if any are configurable via URL params or postMessage).
    4. Internal Methods & Logic (briefly summarizing the core functions found in the <script> tags).
    5. Events (e.g., any EventListeners attached in the code).

    Specification:
    ${JSON.stringify(spec)}

    Generated Code:
    ${generatedCode}

    Return ONLY the Markdown content. Do not wrap in markdown code blocks.
  `;

  // Fallback structure if LLM fails or is in mock mode
  let markdownContent = `# ${spec.app_name}

## Overview
A lightweight, single-file client-side utility generated for the ${spec.framework || 'HTML/JS'} framework.

## Integration
Embed this widget using the following snippet:
\`\`\`html
<iframe src="https://example.utilityhub.com" width="100%" height="500px" style="border:none;"></iframe>
\`\`\`

## Technical Details
* **Components:** ${spec.components ? spec.components.join(', ') : 'None specified'}
* **State Management:** ${spec.state_management || 'Vanilla DOM'}

## API & Events
*This section is auto-generated based on the internal logic of the widget.*
`;

  if (llmCaller) {
    try {
       const llmResponse = await llmCaller(prompt);
       if (llmResponse) {
           markdownContent = llmResponse.replace(/^```markdown/g, '').replace(/```$/g, '').trim();
       }
    } catch (e) {
       logger.warn(`[Docs] LLM generation failed, using fallback documentation for ${spec.app_name}`);
    }
  }

  return markdownContent;
}

function saveDocs(appName, markdownContent) {
    const slug = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const docsDir = path.resolve(process.cwd(), 'docs', 'widgets');

    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
    }

    const filePath = path.resolve(docsDir, `${slug}.md`);
    fs.writeFileSync(filePath, markdownContent);
    logger.info(`[Docs] Saved documentation to ${filePath}`);
    return filePath;
}

module.exports = {
  generateWidgetDocs,
  saveDocs
};
