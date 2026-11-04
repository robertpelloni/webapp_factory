export const dynamic = 'force-dynamic';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const isDryRun = !!body.dryRun;
    const projectRoot = path.resolve(process.cwd(), '../../');
    const indexPath = path.resolve(projectRoot, 'index.js');

    const args = [indexPath];
    if (isDryRun) {
      args.push('--dry-run');
    }

    // Spawn orchestrator cycle child process asynchronously so request returns immediately
    const child = spawn(process.execPath, args, {
      cwd: projectRoot,
      detached: true,
      stdio: 'ignore'
    });

    child.unref();

    return new Response(JSON.stringify({
      success: true,
      message: `Factory cycle initiated successfully in ${isDryRun ? 'DRY-RUN' : 'LIVE'} mode.`,
      pid: child.pid,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
