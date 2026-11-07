"use client";
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  Info,
  CodeXml,
  Play,
  Cpu,
  Activity,
  Layers,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Server,
  Zap,
  Globe2,
  FileCode2,
  Terminal,
  Eye,
  X
} from 'lucide-react';

export default function Dashboard() {
  const [apps, setApps] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [logs, setLogs] = useState('');
  const [status, setStatus] = useState(null);
  const [deployerStatus, setDeployerStatus] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(null);
  const [previewSubdomain, setPreviewSubdomain] = useState(null);

  const fetchData = () => {
    fetch('/api/apps')
      .then(res => res.json())
      .then(data => setApps(Array.isArray(data) ? data : []))
      .catch(() => setApps([]));

    fetch('/api/routes')
      .then(res => res.json())
      .then(data => setRoutes(Array.isArray(data) ? data : []))
      .catch(() => setRoutes([]));

    fetch('/api/pipeline/status')
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(() => setStatus(null));

    fetch('/api/deployer/status')
      .then(res => res.json())
      .then(res => res.success && setDeployerStatus(res.data))
      .catch(() => setDeployerStatus(null));

    fetch('/api/logs')
      .then(res => res.text())
      .then(data => setLogs(data))
      .catch(() => setLogs(''));
  };

  useEffect(() => {
    fetch('/api/apps').then(res => res.json()).then(data => setApps(Array.isArray(data) ? data : []));
    fetch('/api/routes').then(res => res.json()).then(data => setRoutes(Array.isArray(data) ? data : []));

    // Poll logs every 5 seconds
    const fetchLogs = () => fetch('/api/logs').then(res => res.text()).then(data => setLogs(data));
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">WebApp Factory Dashboard</h1>
          <p className="text-muted-foreground text-lg">Monitoring active pipelines, processed utilities, dynamic deployments, and live daemon logs.</p>
        </div>

        {/* Logs Card */}
        <Card className="w-full border-slate-800 shadow-sm">
          <CardHeader className="bg-slate-50/50 pb-4 border-b">
            <div className="flex items-center gap-2">
               <CardTitle>Daemon Runtime Logs (Tail)</CardTitle>
               <Tooltip>
                 <TooltipTrigger><Info className="h-4 w-4 text-slate-400" /></TooltipTrigger>
                 <TooltipContent>
                   <p>Live feed of the background factory daemon processes, including Playwright scraping, LLM API generation loops, and Vercel deployments.</p>
                 </TooltipContent>
               </Tooltip>
            </div>
            <CardDescription>Real-time output from the autonomous orchestration engine.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
             <pre className="bg-slate-950 text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm whitespace-pre-wrap break-words border shadow-inner">
                {logs || 'Loading logs...'}
             </pre>
          </CardContent>
        </Card>

          {/* Quick Trigger Controls */}
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => triggerPipeline(false)}
                  disabled={triggering}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-1.5 shadow-sm"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Run Factory Cycle
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Immediately trigger discovery scraper, LLM code generator, and Vercel subdomain deployment.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => triggerPipeline(true)}
                  disabled={triggering}
                  variant="outline"
                  className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5"
                >
                  <Zap className="h-4 w-4 text-amber-400" />
                  Dry Run
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Test discovery and code generation without deploying to live production subdomains or updating SEO sitemaps.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={fetchData}
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manually refresh live status, routes, discovered backlog, and logs.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        {triggerMsg && (
          <div className="p-3 bg-blue-950/60 border border-blue-800/80 rounded-md text-sm text-blue-300 flex items-center justify-between">
            <span>{triggerMsg}</span>
            <button onClick={() => setTriggerMsg('')} className="text-xs text-blue-400 hover:underline">Dismiss</button>
          </div>
        )}

        {/* High-Value Metric Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-1.5">
                <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Live Subdomains
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger><Info className="h-3 w-3 text-slate-500" /></TooltipTrigger>
                  <TooltipContent>
                    <p>Mode: {deployerStatus?.mode || 'simulated-mock'} | Wildcard: {deployerStatus?.wildcardDomain || '*.utilityhub.com'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Globe2 className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-white">{routes.length}</div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  {deployerStatus?.mode === 'live-api' ? 'Vercel Live' : 'Vercel Mock'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Multi-tenant deployed widgets</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Discovered Utilities
              </CardTitle>
              <FileCode2 className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{apps.length}</div>
              <p className="text-xs text-slate-400 mt-1">Feasible micro-tools analyzed</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Daemon Health
              </CardTitle>
              <Activity className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">Active</div>
              <p className="text-xs text-slate-400 mt-1">Node cron: Every 6 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Host Memory & Uptime
              </CardTitle>
              <Server className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {status?.memoryUsageMB ? `${status.memoryUsageMB} MB` : 'Optimal'}
              </div>
              <CardDescription>Apps currently ingested into the database.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Target App Name</TableHead>
                    <TableHead className="text-right">Processed Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apps.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No applications processed yet.</TableCell></TableRow>
                  ) : (
                      apps.map(app => (
                          <TableRow key={app.id}>
                              <TableCell className="font-medium">{app.id}</TableCell>
                              <TableCell>{app.app_name}</TableCell>
                              <TableCell className="text-right text-slate-500">{new Date(app.processed_at).toLocaleString()}</TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Routes Table */}
          <Card className="shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
               <div className="flex items-center gap-2">
                 <CardTitle>Active Subdomain Deployments</CardTitle>
                 <Tooltip>
                   <TooltipTrigger><Info className="h-4 w-4 text-slate-400" /></TooltipTrigger>
                   <TooltipContent>
                     <p>Live web URLs dynamically provisioned via the Vercel API. Click the link to view the generated Vanilla JS utility.</p>
                   </TooltipContent>
                 </Tooltip>
              </div>
              <CardDescription>Currently hosted generated utilities.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Project ID</TableHead>
                    <TableHead>Project Slug</TableHead>
                    <TableHead className="text-right">Live Subdomain Route</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {routes.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No active routes found.</TableCell></TableRow>
                  ) : (
                      routes.map(route => (
                          <TableRow key={route.id}>
                              <TableCell className="font-medium">{route.id}</TableCell>
                              <TableCell>{route.slug}</TableCell>
                              <TableCell className="text-right">
                                  <a href={`https://${route.subdomain}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1">
                                      {route.subdomain}
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                                  </a>
                              </TableCell>
                          </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Highest-Value Primary Section: Live Deployments & Embed Snippets */}
        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-md">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-lg text-white">Live Subdomain Deployments & Embed Codes</CardTitle>
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-slate-400" /></TooltipTrigger>
                  <TooltipContent>
                    <p>Generated Single-File HTML/Tailwind/JS utilities deployed via Vercel API with wildcard routing. Click Copy Iframe to embed in Notion or any CMS.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-1 rounded">
                {routes.length} Active Routes
              </span>
            </div>
            <CardDescription className="text-slate-400">
              High-value client-side web utilities ready for immediate web traffic and iframe distribution.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">Utility Slug</TableHead>
                  <TableHead className="text-slate-400">Live Production URL</TableHead>
                  <TableHead className="text-slate-400 text-center">Deployed At</TableHead>
                  <TableHead className="text-slate-400 text-right">Embed Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.length === 0 ? (
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableCell colSpan={4} className="text-center text-slate-500 py-10">
                      No active subdomain deployments found. Trigger a factory cycle to generate new micro-utilities.
                    </TableCell>
                  </TableRow>
                ) : (
                  routes.map(route => (
                    <TableRow key={route.id} className="border-slate-800/60 hover:bg-slate-800/40">
                      <TableCell className="font-mono text-sm text-slate-300 font-medium">
                        {route.slug}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`https://${route.subdomain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1.5 font-medium text-sm"
                        >
                          {route.subdomain}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </TableCell>
                      <TableCell className="text-center text-xs text-slate-400 font-mono">
                        {route.deployed_at || 'Active'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPreviewSubdomain(previewSubdomain === route.subdomain ? null : route.subdomain)}
                            className="text-xs inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-md transition-all font-medium border bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border-blue-700/60"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {previewSubdomain === route.subdomain ? 'Close' : 'Preview'}
                          </button>
                          <button
                            onClick={() => copyIframe(route.subdomain, route.slug)}
                            className={`text-xs inline-flex items-center gap-1.5 py-1.5 px-3 rounded-md transition-all font-medium border ${
                              copiedSlug === route.slug
                                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                            }`}
                          >
                            {copiedSlug === route.slug ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <CodeXml className="h-3.5 w-3.5 text-slate-400" />
                                Copy Iframe
                              </>
                            )}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Embedded Live Sandbox Drawer */}
            {previewSubdomain && (
              <div className="mt-4 p-4 border border-blue-500/30 bg-slate-950/80 rounded-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-semibold text-white">Live Sandbox Preview:</span>
                    <span className="text-xs font-mono text-blue-400">{previewSubdomain}</span>
                  </div>
                  <button
                    onClick={() => setPreviewSubdomain(null)}
                    className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="bg-white rounded-md overflow-hidden border border-slate-800 h-96">
                  <iframe
                    src={`https://${previewSubdomain}`}
                    title={previewSubdomain}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-forms allow-same-origin"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Sandboxed in isolated iframe container to prevent DOM/CSS bleed. Supports live testing and interactive validation.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mid-Section: Discovered & Processed Apps */}
        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-md">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-lg text-white">Discovered App Store Backlog</CardTitle>
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-slate-400" /></TooltipTrigger>
                  <TooltipContent>
                    <p>Scraped via Playwright from Apple App Store, Product Hunt, and prompt directories. Filtered for feasibility by Gemini Flash to guarantee client-side execution.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/60 px-2 py-1 rounded">
                {apps.length} Ingested
              </span>
            </div>
            <CardDescription className="text-slate-400">
              Apps filtered and deduplicated by the discovery engine.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[80px] text-slate-400">ID</TableHead>
                  <TableHead className="text-slate-400">Target Micro-Utility Name</TableHead>
                  <TableHead className="text-slate-400 text-right">Processed Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.length === 0 ? (
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableCell colSpan={3} className="text-center text-slate-500 py-8">
                      No applications currently ingested.
                    </TableCell>
                  </TableRow>
                ) : (
                  apps.map(app => (
                    <TableRow key={app.id} className="border-slate-800/60 hover:bg-slate-800/40">
                      <TableCell className="font-mono text-xs text-slate-400">{app.id}</TableCell>
                      <TableCell className="font-medium text-slate-200">{app.app_name}</TableCell>
                      <TableCell className="text-right text-xs text-slate-400 font-mono">
                        {app.processed_at ? new Date(app.processed_at).toLocaleString() : 'Recent'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Live Daemon Logs Section */}
        <Card className="bg-slate-900 border-slate-800 text-slate-100 shadow-md">
          <CardHeader className="border-b border-slate-800/80 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-emerald-400" />
                <CardTitle className="text-lg text-white">Autonomous Daemon Console Logs</CardTitle>
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-slate-400" /></TooltipTrigger>
                  <TooltipContent>
                    <p>Live stream of Winston logs (`factory.log`), tracing scrapers, LLM code generation, healing loops, syntax checks, and sitemap indexing.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-slate-400 font-mono">Live Stream</span>
              </div>
            </div>
            <CardDescription className="text-slate-400">
              Real-time terminal execution output and error tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <pre className="bg-slate-950 text-emerald-400 p-4 rounded-lg h-72 overflow-y-auto font-mono text-xs whitespace-pre-wrap break-words border border-slate-800 shadow-inner leading-relaxed">
              {logs || 'No daemon logs recorded yet. Run a factory cycle or start the scheduler to view output.'}
            </pre>
          </CardContent>
        </Card>

      </div>
    </TooltipProvider>
  );
}
