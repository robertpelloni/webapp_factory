export const dynamic = 'force-dynamic';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logPath = path.resolve(process.cwd(), '../../factory.log');
    if (!fs.existsSync(logPath)) {
        return new Response("No logs found.", { status: 200 });
    }

    const logContent = fs.readFileSync(logPath, 'utf8');
    // For large logs, we might want to return just the last 1000 lines
    const lines = logContent.trim().split('\n');
    const tailLines = lines.slice(-500).join('\n');

    return new Response(tailLines, { status: 200 });
  } catch (error) {
    return new Response(`Error reading logs: ${error.message}`, { status: 500 });
  }
}
