import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Dashboard API: Logs Retrieval', () => {
  const logPath = path.resolve(process.cwd(), 'factory.log');
  let originalContent = null;

  beforeEach(() => {
    if (fs.existsSync(logPath)) {
      originalContent = fs.readFileSync(logPath, 'utf8');
    }
  });

  afterEach(() => {
    if (originalContent !== null) {
      fs.writeFileSync(logPath, originalContent);
    }
  });

  it('correctly bounds and tails log output with query parameters', async () => {
    const { GET } = await import('../src/dashboard/src/app/api/logs/route.js');

    // Write 2500 mock lines
    const mockLines = Array.from({ length: 2500 }, (_, i) => `Log line ${i + 1}`);
    fs.writeFileSync(logPath, mockLines.join('\n'));

    // Default 500 lines
    const reqDefault = new Request('http://localhost:3000/api/logs');
    const resDefault = await GET(reqDefault);
    expect(resDefault.status).toBe(200);
    const textDefault = await resDefault.text();
    const splitDefault = textDefault.split('\n');
    expect(splitDefault.length).toBe(500);
    expect(splitDefault[splitDefault.length - 1]).toBe('Log line 2500');

    // Request 100 lines
    const req100 = new Request('http://localhost:3000/api/logs?lines=100');
    const res100 = await GET(req100);
    expect(res100.status).toBe(200);
    const text100 = await res100.text();
    const split100 = text100.split('\n');
    expect(split100.length).toBe(100);

    // Request over maximum 2000 lines (e.g. 5000), capped at 2000
    const reqMax = new Request('http://localhost:3000/api/logs?lines=5000');
    const resMax = await GET(reqMax);
    expect(resMax.status).toBe(200);
    const textMax = await resMax.text();
    const splitMax = textMax.split('\n');
    expect(splitMax.length).toBe(2000);
  });

  it('handles empty log file gracefully', async () => {
    const { GET } = await import('../src/dashboard/src/app/api/logs/route.js');
    fs.writeFileSync(logPath, '   \n  \n');

    const req = new Request('http://localhost:3000/api/logs');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('Log file is currently empty.');
  });
});
