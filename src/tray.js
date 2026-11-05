#!/usr/bin/env node

/**
 * Autonomous Utility Factory - Server Tray & Process Controller
 *
 * Provides CLI/tray server management, service health monitoring,
 * execution triggering, and graceful server/daemon termination.
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PID_FILE = path.resolve(__dirname, '../.factory_servers.pid');
const ROOT_DIR = path.resolve(__dirname, '../');

function printUsage() {
  console.log(`
Autonomous Utility Factory - Server & Tray Controller
Usage: node src/tray.js [command]

Commands:
  --status       Check status of Dashboard, Factory Scheduler, and databases
  --run          Trigger an immediate Factory Cycle (production)
  --dry-run      Trigger an immediate Factory Cycle in Dry-Run mode
  --start-all    Start Dashboard and Orchestrator daemon in background
  --quit         Gracefully stop all running factory and dashboard servers
  --help         Show this help message
  `);
}

function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, () => {
      resolve(true);
    });
    req.on('error', () => {
      resolve(false);
    });
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function showStatus() {
  console.log('=== Autonomous Utility Factory Status ===');

  const dashboardOnline = await checkPort(3000);
  console.log(`Dashboard Web UI (Port 3000): ${dashboardOnline ? 'ONLINE (http://localhost:3000)' : 'STOPPED'}`);

  const routesDb = path.resolve(ROOT_DIR, 'src/deployer/routes.db');
  const discoveryDb = path.resolve(ROOT_DIR, 'src/discovery/discovery.db');
  console.log(`Deployer Routes DB:           ${fs.existsSync(routesDb) ? 'EXISTS' : 'MISSING'}`);
  console.log(`Discovery Apps DB:            ${fs.existsSync(discoveryDb) ? 'EXISTS' : 'MISSING'}`);

  const logFile = path.resolve(ROOT_DIR, 'factory.log');
  if (fs.existsSync(logFile)) {
    const stats = fs.statSync(logFile);
    console.log(`Daemon Logs (factory.log):    ${(stats.size / 1024).toFixed(2)} KB`);
  } else {
    console.log('Daemon Logs (factory.log):    None yet');
  }

  // Check running node processes
  try {
    const pgrep = execSync("pgrep -af 'node.*(index\\.js|scheduler|next)' || true").toString().trim();
    if (pgrep) {
      console.log('\nRunning Factory Processes:');
      console.log(pgrep);
    } else {
      console.log('\nNo active factory background daemons running.');
    }
  } catch {
    // Ignore error
  }
}

async function runCycle(isDryRun = false) {
  console.log(`Initiating factory cycle (dry-run: ${isDryRun})...`);
  const indexPath = path.resolve(ROOT_DIR, 'index.js');
  const args = [indexPath];
  if (isDryRun) args.push('--dry-run');

  const child = spawn(process.execPath, args, {
    cwd: ROOT_DIR,
    stdio: 'inherit'
  });

  child.on('exit', (code) => {
    console.log(`Factory cycle finished with exit code ${code}`);
  });
}

function quitServers() {
  console.log('Terminating factory and dashboard processes...');
  try {
    // Kill processes listening on port 3000
    try {
      execSync('kill $(lsof -t -i :3000) 2>/dev/null || true');
    } catch {}

    // Kill node index.js or daemon processes
    try {
      execSync("pkill -f 'node.*index\\.js' 2>/dev/null || true");
    } catch {}

    if (fs.existsSync(PID_FILE)) {
      try {
        const pids = fs.readFileSync(PID_FILE, 'utf8').trim().split('\n');
        for (const pid of pids) {
          if (pid) {
            try {
              process.kill(parseInt(pid, 10), 'SIGTERM');
            } catch {}
          }
        }
        fs.unlinkSync(PID_FILE);
      } catch {}
    }

    console.log('Servers and daemons cleanly stopped.');
  } catch (err) {
    console.error('Error during shutdown:', err.message);
  }
}

function startAll() {
  console.log('Starting Next.js Dashboard and Orchestrator Daemon...');

  const dashboardDir = path.resolve(ROOT_DIR, 'src/dashboard');
  const dashChild = spawn('npm', ['run', 'start'], {
    cwd: dashboardDir,
    detached: true,
    stdio: 'ignore'
  });
  dashChild.unref();

  const daemonChild = spawn(process.execPath, [path.resolve(ROOT_DIR, 'index.js'), '--cron'], {
    cwd: ROOT_DIR,
    detached: true,
    stdio: 'ignore'
  });
  daemonChild.unref();

  fs.writeFileSync(PID_FILE, `${dashChild.pid}\n${daemonChild.pid}\n`, 'utf8');

  console.log(`Dashboard started (PID: ${dashChild.pid})`);
  console.log(`Daemon scheduler started (PID: ${daemonChild.pid})`);
  console.log('Use `node src/tray.js --status` to monitor or `node src/tray.js --quit` to stop.');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || '--status';

  switch (command) {
    case '--status':
      await showStatus();
      break;
    case '--run':
      await runCycle(false);
      break;
    case '--dry-run':
      await runCycle(true);
      break;
    case '--quit':
      quitServers();
      break;
    case '--start-all':
      startAll();
      break;
    case '--help':
    default:
      printUsage();
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  showStatus,
  runCycle,
  quitServers,
  startAll
};
