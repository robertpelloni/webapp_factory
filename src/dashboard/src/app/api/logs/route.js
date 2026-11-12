import fs from 'fs';
import path from 'path';

export async function GET(request) {
  try {
    let limit = 500;
    if (request && request.url) {
      try {
        const urlObj = new URL(request.url);
        const linesParam = urlObj.searchParams.get('lines');
        if (linesParam) {
          const parsed = parseInt(linesParam, 10);
          if (!isNaN(parsed) && parsed > 0) {
            limit = Math.min(parsed, 2000); // capped at 2000 lines
          }
        }
      } catch (err) {
        // Fall back to default limit if URL parsing fails
      }
    }

    // Resolve factory.log flexibly whether cwd is repo root or src/dashboard
    let logPath = path.resolve(process.cwd(), 'factory.log');
    if (!fs.existsSync(logPath)) {
      const parentLog = path.resolve(process.cwd(), '../../factory.log');
      if (fs.existsSync(parentLog)) {
        logPath = parentLog;
      }
    }

    if (!fs.existsSync(logPath)) {
      return new Response("No logs found.", { status: 200 });
    }

    const logContent = fs.readFileSync(logPath, 'utf8');
    if (!logContent.trim()) {
      return new Response("Log file is currently empty.", { status: 200 });
    }

    const lines = logContent.trim().split('\n');
    const tailLines = lines.slice(-limit).join('\n');

    return new Response(tailLines, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  } catch (error) {
    return new Response(`Error reading logs: ${error.message}`, { status: 500 });
  }
}
