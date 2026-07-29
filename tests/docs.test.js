import { describe, it, expect } from 'vitest';
import * as docsPkg from '../src/docs/index.js';
import fs from 'fs';
import path from 'path';

describe('Documentation Generator', () => {

  it('should generate fallback markdown when no LLM is provided', async () => {
    const mockSpec = {
      app_name: 'Test Docs Widget',
      framework: 'HTML/Tailwind/Vanilla',
      components: ['Form', 'Result']
    };
    const mockCode = '<html><script>console.log("test")</script></html>';

    const markdown = await docsPkg.generateWidgetDocs(mockSpec, mockCode, null);

    expect(markdown).toContain('# Test Docs Widget');
    expect(markdown).toContain('Form, Result');
    expect(markdown).toContain('iframe');
  });

  it('should save generated markdown to the docs directory', async () => {
     const mockMarkdown = '# Hello World\nThis is a test doc.';
     const filePath = docsPkg.saveDocs('Test Docs Widget', mockMarkdown);

     expect(fs.existsSync(filePath)).toBe(true);

     const content = fs.readFileSync(filePath, 'utf8');
     expect(content).toContain('Hello World');

     // Cleanup
     if (fs.existsSync(filePath)) {
         fs.unlinkSync(filePath);
     }
  });

});
